import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export class AssetLoader {
  constructor() {
    this.gltfLoader = new GLTFLoader();

    // Optional: Draco compression support
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    this.gltfLoader.setDRACOLoader(dracoLoader);

    this.cache = new Map();
  }

  async loadGLB(path) {
    if (this.cache.has(path)) return this.cache.get(path).clone();

    // First, check if the file exists to avoid GLTFLoader parsing 404 HTML as JSON
    try {
      const response = await fetch(path, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`Asset not found: ${path}`);
      }
    } catch (e) {
      throw new Error(`Failed to reach asset: ${path}`);
    }

    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        path,
        (gltf) => {
          this.cache.set(path, gltf.scene);
          resolve(gltf.scene.clone());
        },
        null,
        (error) => {
          console.error('Error loading GLB:', path, error);
          reject(error);
        }
      );
    });
  }

  async loadEnemyModel(type) {
    const paths = {
      CRAWLER: '/assets/models/crawler.glb',
      TANK: '/assets/models/tank.glb',
      FLYER: '/assets/models/flyer.glb'
    };

    const path = paths[type];
    try {
      return await this.loadGLB(path);
    } catch (e) {
      throw new Error(`Failed to load enemy model: ${type}`);
    }
  }

  async loadHeadOccluder(path = '/assets/models/headOccluder.glb') {
    try {
      const model = await this.loadGLB(path);
      model.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            colorWrite: false,
            depthWrite: true
          });
        }
      });
      return model;
    } catch (e) {
      console.warn('Could not load head occluder model, using procedural placeholder', e);
      return this.createProceduralOccluder();
    }
  }

  createProceduralOccluder() {
    const group = new THREE.Group();
    const headGeometry = new THREE.SphereGeometry(0.1, 32, 32);
    const headMaterial = new THREE.MeshStandardMaterial({
      colorWrite: false,
      depthWrite: true
    });
    const headOccluder = new THREE.Mesh(headGeometry, headMaterial);
    headOccluder.scale.set(1, 1.3, 1.1);
    headOccluder.position.set(0, 0, -0.05);
    group.add(headOccluder);
    return group;
  }
}
