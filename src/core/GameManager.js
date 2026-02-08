import * as THREE from 'three';
import { MindARThree } from 'mind-ar/dist/mindar-face-three.prod.js';
import { AssetLoader } from './AssetLoader.js';
import { EnemySystem } from '../systems/EnemySystem.js';
import { EconomySystem } from '../systems/EconomySystem.js';
import { HealthSystem } from '../systems/HealthSystem.js';
import { TowerSystem } from '../systems/TowerSystem.js';
import { TowerType } from './Tower.js';

export class GameManager {
  constructor() {
    this.mindarThree = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.assetLoader = new AssetLoader();
    this.anchors = [];
    this.enemySystem = null;
    this.economySystem = new EconomySystem();
    this.healthSystem = new HealthSystem();
    this.towerSystem = null;
    this.lastTime = 0;
    this.headOccluder = null;
    this.selectedTowerType = TowerType.GREEN;
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

    // Tower System Setup
    this.towerSystem = new TowerSystem(this.scene, this.headOccluder, this.economySystem);

    // Story B.1: Enemy System Setup
    this.enemySystem = new EnemySystem(this.scene, this.headOccluder, this.assetLoader, this.healthSystem, this.economySystem);

    // Setup input
    this.setupInputHandlers();

    // Story A.1: Test Scene
    this.setupTestScene();
  }

  setupInputHandlers() {
    const container = document.querySelector("#container") || document.body;
    container.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      this.handlePlacement(touch.clientX, touch.clientY);
    });
    container.addEventListener('mousedown', (e) => {
      this.handlePlacement(e.clientX, e.clientY);
    });

    // UI selection
    document.querySelectorAll('.tower-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.selectedTowerType = e.target.dataset.type;
        document.querySelectorAll('.tower-btn').forEach(b => b.classList.remove('selected'));
        e.target.classList.add('selected');
      });
    });
  }

  handlePlacement(x, y) {
    if (this.healthSystem.isGameOver) return;

    // Get current landmarks for snapping
    const landmarks = this.mindarThree.controller.getLandmarks();
    if (!landmarks) return;

    // Convert landmark positions to world coordinates
    const landmarkPositions = landmarks.map((l, i) => {
        // MindAR landmarks are in a different coordinate system, but MindARThree provides helper
        // Actually we need the actual world position.
        // mindarThree.addAnchor(i) creates a group that follows the landmark.
        // For efficiency, we can use the controller's methods if we had a direct reference to the camera params.
        // Alternatively, we use the anchors we already have or create them on the fly.

        // Simpler approach for MVP: MindAR landmarks in controller are already somewhat normalized.
        // But for raycast hitting headOccluder, we just need to snap to the nearest landmark index.
        // We can get the world position by creating a temporary anchor if needed,
        // or using the faceMesh which follows the landmarks.
        return { index: i, position: this.getLandmarkWorldPosition(i) };
    });

    this.towerSystem.placeTower(this.selectedTowerType, x, y, this.camera, landmarkPositions);
  }

  getLandmarkWorldPosition(index) {
      // Create a temporary anchor to get world position if not already tracked
      // This is a bit expensive but precise.
      // Optimization: use a pre-created set of anchors for PLACEABLE_LANDMARKS.
      if (!this.anchors[index]) {
          this.anchors[index] = this.mindarThree.addAnchor(index);
      }
      this.anchors[index].group.updateMatrixWorld();
      return new THREE.Vector3().setFromMatrixPosition(this.anchors[index].group.matrixWorld);
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
    if (this.healthSystem.isGameOver) {
      this.renderer.render(this.scene, this.camera);
      return;
    }

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Update health system with landmark positions for organs
    const landmarks = this.mindarThree.controller.getLandmarks();
    if (landmarks) {
        const organPositions = {
            168: { position: this.getLandmarkWorldPosition(168) },
            1: { position: this.getLandmarkWorldPosition(1) },
            13: { position: this.getLandmarkWorldPosition(13) }
        };
        this.healthSystem.updateOrganPositions(organPositions);
    }

    if (this.enemySystem) {
      this.enemySystem.update(deltaTime);
    }

    if (this.towerSystem) {
        this.towerSystem.update(deltaTime, this.enemySystem.enemies, currentTime);
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
