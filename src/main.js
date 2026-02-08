import { GameManager } from './core/GameManager.js';

const init = async () => {
  const gameManager = new GameManager();
  await gameManager.init();
  await gameManager.start();
};

init();
