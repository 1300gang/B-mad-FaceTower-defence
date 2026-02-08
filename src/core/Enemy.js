import { ENEMY_STATS } from '../utils/EnemyTypes.js';

export class Enemy {
  constructor(type, mesh) {
    this.id = crypto.randomUUID();
    this.type = type;
    this.mesh = mesh;

    const stats = ENEMY_STATS[type];
    this.hp = stats.hp;
    this.maxHp = stats.hp;
    this.speed = stats.speed;

    this.pathProgress = 0.0;
    this.targetOrgan = null;
    this.mixer = null;

    // For flyers
    this.orbitAngle = Math.random() * Math.PI * 2;
    this.orbitTime = 0;
  }

  takeDamage(amount) {
    this.hp -= amount;
    return this.isDead();
  }

  isDead() {
    return this.hp <= 0;
  }
}
