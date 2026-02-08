import * as THREE from 'three';
import { MindARThree } from 'mind-ar/dist/mindar-face-three.prod.js';
import { AssetLoader } from './AssetLoader.js';
import { EnemySystem } from '../systems/EnemySystem.js';

export class GameManager {
  constructor() {
    this.mindarThree = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.assetLoader = new AssetLoader();
    this.anchors = [];
    this.enemySystem = null;
    this.lastTime = 0;
    this.headOccluder = null;
  }

  async init() {
    this.mindarThree = new MindARThree({
      container: document.querySelector("#container") || document.body,
    });

    const { renderer, scene, camera } = this.mindarThree;
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    this.scene.add(light);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(0, 5, 5);
    this.scene.add(dirLight);

    // Story A.2: Head Occluder Setup
    await this.setupHeadOccluder();

    // Story B.1: Enemy System Setup
    this.enemySystem = new EnemySystem(this.scene, this.headOccluder, this.assetLoader);

    // Story A.1: Test Scene
    this.setupTestScene();
  }

  async setupHeadOccluder() {
    // Face mesh occluder (built-in)
    const faceMesh = this.mindarThree.addFaceMesh();
    faceMesh.material.colorWrite = false;
    faceMesh.visible = true;

    // External head occluder model
    this.headOccluder = await this.assetLoader.loadHeadOccluder();
    const headAnchor = this.mindarThree.addAnchor(168); // Forehead
    headAnchor.group.add(this.headOccluder);
  }

  setupTestScene() {
    // Nose tip anchor
    const anchor = this.mindarThree.addAnchor(1);
    const geometry = new THREE.BoxGeometry(0.05, 0.05, 0.05);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    anchor.group.add(cube);
  }

  async start() {
    try {
      await this.mindarThree.start();
      this.lastTime = performance.now();
      this.renderer.setAnimationLoop(this.update.bind(this));
      console.log("MindAR started successfully");
      document.querySelector("#loading-screen").style.display = "none";
    } catch (error) {
      console.error("AR Start failed:", error);
      this.showError("Failed to start AR. Please ensure camera access is granted.");
    }
  }

  update() {
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    if (this.enemySystem) {
      this.enemySystem.update(deltaTime);
    }

    this.renderer.render(this.scene, this.camera);
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'absolute';
    errorDiv.style.top = '50%';
    errorDiv.style.left = '50%';
    errorDiv.style.transform = 'translate(-50%, -50%)';
    errorDiv.style.background = 'rgba(255, 0, 0, 0.8)';
    errorDiv.style.color = 'white';
    errorDiv.style.padding = '20px';
    errorDiv.style.borderRadius = '10px';
    errorDiv.innerText = message;
    document.body.appendChild(errorDiv);
  }
}
