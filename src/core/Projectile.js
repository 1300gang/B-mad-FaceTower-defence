import * as THREE from 'three';

export class Projectile {
  constructor(startPos, target, damage, speed = 0.5) {
    this.id = crypto.randomUUID();
    this.target = target;
    this.damage = damage;
    this.speed = speed;

    const geometry = new THREE.SphereGeometry(0.01, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(startPos);
  }

  update(deltaTime) {
    if (!this.target || this.target.hp <= 0) return true; // Signal for removal

    const direction = new THREE.Vector3()
      .subVectors(this.target.mesh.position, this.mesh.position)
      .normalize();

    this.mesh.position.add(direction.multiplyScalar(this.speed * deltaTime));

    const dist = this.mesh.position.distanceTo(this.target.mesh.position);
    if (dist < 0.02) {
      this.target.takeDamage(this.damage);
      return true; // Hit target
    }

    return false;
  }
}
