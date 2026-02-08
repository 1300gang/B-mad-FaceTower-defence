export class VitalOrgan {
  constructor(name, maxHP, position) {
    this.name = name;
    this.maxHP = maxHP;
    this.currentHP = maxHP;
    this.position = position;
    this.isDestroyed = false;
  }

  takeDamage(amount) {
    if (this.isDestroyed) return 0;
    this.currentHP = Math.max(0, this.currentHP - amount);
    if (this.currentHP === 0) {
      this.isDestroyed = true;
    }
    return this.currentHP;
  }

  getHealthPercentage() {
    return (this.currentHP / this.maxHP) * 100;
  }
}
