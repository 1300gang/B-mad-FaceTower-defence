import * as THREE from 'three';
import { Enemy } from '../core/Enemy.js';
import { EnemyType, ENEMY_STATS, WAVES } from '../utils/EnemyTypes.js';

export class EnemySystem {
  constructor(scene, headOccluder, assetLoader, healthSystem, economySystem, audioSystem, uiManager) {
    this.scene = scene;
    this.headOccluder = headOccluder;
    this.assetLoader = assetLoader;
    this.healthSystem = healthSystem;
    this.economySystem = economySystem;
    this.audioSystem = audioSystem;
    this.uiManager = uiManager;
    this.enemies = [];

    this.currentWaveIndex = 0;
    this.spawnedInWave = 0;
    this.spawnTimer = 0;
    this.isWaveActive = false;

    this.raycaster = new THREE.Raycaster();
  }

  async startNextWave() {
    if (this.currentWaveIndex >= WAVES.length) {
      if (this.uiManager) this.uiManager.showMessage("ALL THREATS NEUTRALIZED");
      return;
    }

    this.spawnedInWave = 0;
    this.isWaveActive = true;
    const waveNum = WAVES[this.currentWaveIndex].wave;
    if (this.uiManager) this.uiManager.showMessage(`INCOMING WAVE ${waveNum}`);
  }

  async spawn(type) {
    const stats = ENEMY_STATS[type];
    const position = this.getRandomSpawnPosition();

    let mesh;
    try {
      mesh = await this.assetLoader.loadEnemyModel(type);
    } catch (e) {
      mesh = this.createPlaceholderMesh(type);
    }

    mesh.position.copy(position);
    this.scene.add(mesh);

    const enemy = new Enemy(type, mesh);
    this.enemies.push(enemy);
    return enemy;
  }

  createPlaceholderMesh(type) {
    const stats = ENEMY_STATS[type];
    const geometry = new THREE.BoxGeometry(stats.size, stats.size, stats.size);
    const material = new THREE.MeshStandardMaterial({
      color: stats.color,
      emissive: stats.color,
      emissiveIntensity: 0.3
    });
    return new THREE.Mesh(geometry, material);
  }

  getRandomSpawnPosition() {
    // Random position at the back of the head
    const angle = Math.random() * Math.PI * 2;
    const radius = 0.2 + Math.random() * 0.1;

    return new THREE.Vector3(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      -0.5 // Z is behind the head
    );
  }

  update(deltaTime) {
    this.updateWaves(deltaTime);
    this.updateEnemies(deltaTime);
  }

  updateWaves(deltaTime) {
    if (!this.isWaveActive) {
      if (this.enemies.length === 0) {
        // Automatically start next wave if none active
        this.startNextWave();
      }
      return;
    }

    const currentWave = WAVES[this.currentWaveIndex];
    this.spawnTimer += deltaTime;

    // Enhanced wave spawning logic
    let currentWaveTypeIndex = 0;
    let countBeforeCurrent = 0;

    // Find which enemy type in the wave we should be spawning now
    for (let i = 0; i < currentWave.enemies.length; i++) {
      const waveConfig = currentWave.enemies[i];
      if (this.spawnedInWave < countBeforeCurrent + waveConfig.count) {
        currentWaveTypeIndex = i;
        break;
      }
      countBeforeCurrent += waveConfig.count;
      if (i === currentWave.enemies.length - 1) {
        // All types in this wave finished spawning
        this.isWaveActive = false;
        this.currentWaveIndex++;
        return;
      }
    }

    const currentTypeConfig = currentWave.enemies[currentWaveTypeIndex];
    this.spawnTimer += deltaTime;

    if (this.spawnTimer >= currentTypeConfig.interval) {
      this.spawn(currentTypeConfig.type);
      this.spawnedInWave++;
      this.spawnTimer = 0;
    }
  }

  updateEnemies(deltaTime) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];

      if (enemy.mixer) {
        enemy.mixer.update(deltaTime);
      }

      // Assign target organ if none
      if (!enemy.targetOrgan) {
        enemy.targetOrgan = this.assignTargetOrgan(enemy);
      }

      if (enemy.type === EnemyType.FLYER) {
        this.updateFlyer(enemy, deltaTime);
      } else {
        this.updateCrawler(enemy, deltaTime);
      }

      // Check collision with target organ
      if (enemy.targetOrgan && enemy.targetOrgan.position) {
        const dist = enemy.mesh.position.distanceTo(enemy.targetOrgan.position);
        if (dist < 0.05) {
          this.healthSystem.damageOrgan(enemy.targetOrgan.name, 1);
          this.removeEnemy(enemy.id);
          continue;
        }
      }

      if (enemy.isDead()) {
        this.economySystem.earn(ENEMY_STATS[enemy.type].reward);
        if (this.audioSystem) this.audioSystem.play('enemyDeath');
        this.removeEnemy(enemy.id);
      }
    }
  }

  assignTargetOrgan(enemy) {
    const organs = this.healthSystem.organs;
    if (enemy.type === EnemyType.FLYER) return organs.eyes;
    if (enemy.type === EnemyType.TANK) return organs.mouth;

    // Nearest for crawler
    let nearest = organs.nose;
    let minDist = Infinity;
    for (const organ of Object.values(organs)) {
      if (organ.isDestroyed || !organ.position) continue;
      const dist = enemy.mesh.position.distanceTo(organ.position);
      if (dist < minDist) {
        minDist = dist;
        nearest = organ;
      }
    }
    return nearest;
  }

  updateCrawler(enemy, deltaTime) {
    if (!enemy.targetOrgan || !enemy.targetOrgan.position) return;

    const target = enemy.targetOrgan.position;
    const direction = target.clone().sub(enemy.mesh.position).normalize();

    const nextPos = enemy.mesh.position.clone().add(direction.multiplyScalar(enemy.speed * deltaTime));

    const clampedPos = this.clampToSurface(nextPos);
    enemy.mesh.position.copy(clampedPos);

    enemy.mesh.lookAt(target);
  }

  updateFlyer(enemy, deltaTime) {
    const radius = 0.35;
    const angularSpeed = 0.5;

    enemy.orbitAngle += angularSpeed * deltaTime;
    enemy.orbitTime += deltaTime;

    enemy.mesh.position.set(
      Math.cos(enemy.orbitAngle) * radius,
      Math.sin(enemy.orbitTime * 0.2) * 0.1, // Slight vertical bobbing
      Math.sin(enemy.orbitAngle) * radius
    );

    enemy.mesh.lookAt(0, 0, 0);
  }

  clampToSurface(position) {
    // Ray from position to center
    const direction = new THREE.Vector3(0, 0, 0).sub(position).normalize();
    this.raycaster.set(position, direction);

    const intersects = this.raycaster.intersectObject(this.headOccluder, true);
    if (intersects.length > 0) {
      const point = intersects[0].point;
      const normal = intersects[0].face.normal.clone();
      normal.transformDirection(intersects[0].object.matrixWorld);
      return point.add(normal.multiplyScalar(0.01));
    }

    // Fallback: ray from center to position
    this.raycaster.set(new THREE.Vector3(0, 0, 0), position.clone().normalize());
    const intersectsBack = this.raycaster.intersectObject(this.headOccluder, true);
    if (intersectsBack.length > 0) {
      return intersectsBack[0].point;
    }

    return position;
  }

  removeEnemy(id) {
    const index = this.enemies.findIndex(e => e.id === id);
    if (index === -1) return;

    const enemy = this.enemies[index];
    this.scene.remove(enemy.mesh);

    enemy.mesh.traverse(child => {
      if (child.isMesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });

    this.enemies.splice(index, 1);
  }
}
