export const TowerType = {
  GREEN: 'GREEN',
  RED: 'RED',
  BLUE: 'BLUE'
};

export const TOWER_STATS = {
  [TowerType.GREEN]: {
    range: 0.3,
    damage: 1,
    fireRate: 1.0,
    cost: 20,
    color: 0x00ff00
  },
  [TowerType.RED]: {
    range: 0.4,
    damage: 2,
    fireRate: 0.5,
    cost: 30,
    color: 0xff0000
  },
  [TowerType.BLUE]: {
    range: 0.5,
    damage: 1,
    fireRate: 2.0,
    cost: 40,
    color: 0x0000ff
  }
};

export class Tower {
  constructor(type, anchorIndex, mesh) {
    this.id = crypto.randomUUID();
    this.type = type;
    this.anchorIndex = anchorIndex;
    this.mesh = mesh;

    const stats = TOWER_STATS[type];
    this.range = stats.range;
    this.damage = stats.damage;
    this.fireRate = stats.fireRate;

    this.lastFired = 0;
    this.target = null;
  }

  canFire(currentTime) {
    const cooldown = 1000 / this.fireRate;
    return (currentTime - this.lastFired) >= cooldown;
  }
}
