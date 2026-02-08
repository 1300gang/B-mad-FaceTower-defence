export const EnemyType = {
  CRAWLER: 'CRAWLER',
  TANK: 'TANK',
  FLYER: 'FLYER'
};

export const ENEMY_STATS = {
  [EnemyType.CRAWLER]: {
    hp: 1,
    speed: 0.05, // Adjusted for scene scale
    reward: 10,
    size: 0.04,
    color: 0x00ff00,
    target: 'nearest'
  },
  [EnemyType.TANK]: {
    hp: 3,
    speed: 0.02,
    reward: 30,
    size: 0.06,
    color: 0xff0000,
    target: 'mouth'
  },
  [EnemyType.FLYER]: {
    hp: 1,
    speed: 0.08,
    reward: 20,
    size: 0.03,
    color: 0x0000ff,
    target: 'eyes'
  }
};

export const WAVES = [
  {
    wave: 1,
    enemies: [
      { type: EnemyType.CRAWLER, count: 5, interval: 2.0 }
    ]
  },
  {
    wave: 2,
    enemies: [
      { type: EnemyType.CRAWLER, count: 8, interval: 1.5 },
      { type: EnemyType.TANK, count: 2, interval: 4.0 }
    ]
  },
  {
    wave: 3,
    enemies: [
      { type: EnemyType.CRAWLER, count: 10, interval: 1.0 },
      { type: EnemyType.TANK, count: 4, interval: 3.0 },
      { type: EnemyType.FLYER, count: 3, interval: 5.0 }
    ]
  }
];
