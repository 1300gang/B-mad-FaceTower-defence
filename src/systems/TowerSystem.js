import * as THREE from 'three';
import { Tower, TowerType, TOWER_STATS } from '../core/Tower.js';
import { Projectile } from '../core/Projectile.js';

export class TowerSystem {
  constructor(scene, headOccluder, economySystem, audioSystem) {
    this.scene = scene;
    this.headOccluder = headOccluder;
    this.economySystem = economySystem;
    this.audioSystem = audioSystem;
    this.towers = [];
    this.projectiles = [];
    this.occupiedLandmarks = new Set();

    this.raycaster = new THREE.Raycaster();

    // Strategic landmarks for placement
    this.PLACEABLE_LANDMARKS = [1, 10, 234, 454, 152, 67, 297, 21, 251, 103, 332];
  }

  placeTower(type, screenX, screenY, camera, landmarks) {
    const ndc = new THREE.Vector2(
      (screenX / window.innerWidth) * 2 - 1,
      -(screenY / window.innerHeight) * 2 + 1
    );

    this.raycaster.setFromCamera(ndc, camera);
    const intersects = this.raycaster.intersectObject(this.headOccluder, true);

    if (intersects.length === 0) return null;

    const hitPoint = intersects[0].point;
    const nearest = this.findNearestLandmark(hitPoint, landmarks);

    if (this.occupiedLandmarks.has(nearest.index)) {
      console.log("Landmark occupied");
      return null;
    }

    const cost = TOWER_STATS[type].cost;
    if (!this.economySystem.spend(cost)) {
      console.log("Not enough gold");
      return null;
    }

    const mesh = this.createTowerMesh(type);
    // Position should be set by anchor in MindAR, but we'll set it here for immediate feedback
    mesh.position.copy(nearest.position);
    this.scene.add(mesh);

    const tower = new Tower(type, nearest.index, mesh);
    this.towers.push(tower);
    this.occupiedLandmarks.add(nearest.index);

    if (this.audioSystem) this.audioSystem.play('towerPlace');

    return tower;
  }

  findNearestLandmark(point, landmarks) {
    let nearestIndex = this.PLACEABLE_LANDMARKS[0];
    let minDistance = Infinity;

    for (const index of this.PLACEABLE_LANDMARKS) {
      const landmarkPos = landmarks[index].position;
      const dist = point.distanceTo(landmarkPos);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIndex = index;
      }
    }

    return {
      index: nearestIndex,
      position: landmarks[nearestIndex].position
    };
  }

  createTowerMesh(type) {
    const stats = TOWER_STATS[type];
    const geometry = new THREE.BoxGeometry(0.04, 0.08, 0.04);
    const material = new THREE.MeshStandardMaterial({
      color: stats.color,
      emissive: stats.color,
      emissiveIntensity: 0.5
    });
    return new THREE.Mesh(geometry, material);
  }

  update(deltaTime, enemies, currentTime) {
    // Update Towers (Targeting & Firing)
    for (const tower of this.towers) {
      if (!tower.target || tower.target.hp <= 0 ||
          tower.mesh.position.distanceTo(tower.target.mesh.position) > tower.range) {
        tower.target = this.findTarget(tower, enemies);
      }

      if (tower.target && tower.canFire(currentTime)) {
        this.fireProjectile(tower);
        tower.lastFired = currentTime;
      }
    }

    // Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const finished = this.projectiles[i].update(deltaTime);
      if (finished) {
        this.removeProjectile(i);
      }
    }
  }

  findTarget(tower, enemies) {
    let nearest = null;
    let minDistance = tower.range;

    for (const enemy of enemies) {
      const dist = tower.mesh.position.distanceTo(enemy.mesh.position);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = enemy;
      }
    }
    return nearest;
  }

  fireProjectile(tower) {
    const projectile = new Projectile(
      tower.mesh.position,
      tower.target,
      tower.damage
    );
    this.scene.add(projectile.mesh);
    this.projectiles.push(projectile);

    if (this.audioSystem) this.audioSystem.play('towerFire', 0.5);
  }

  removeProjectile(index) {
    const p = this.projectiles[index];
    this.scene.remove(p.mesh);
    p.mesh.geometry.dispose();
    p.mesh.material.dispose();
    this.projectiles.splice(index, 1);
  }
}
