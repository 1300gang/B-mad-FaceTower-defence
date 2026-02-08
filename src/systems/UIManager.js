export class UIManager {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.selectedTowerType = 'GREEN';

    this.elements = {
      gold: document.getElementById('gold-count'),
      messages: document.getElementById('status-message'),
      gameOverScreen: document.getElementById('game-over-screen'),
      towerButtons: document.querySelectorAll('.tower-btn'),
      loadingScreen: document.getElementById('loading-screen')
    };
  }

  updateGold(amount) {
    if (this.elements.gold) {
      this.elements.gold.textContent = amount;
    }
    this.updateTowerAffordability(amount);
  }

  updateTowerAffordability(gold) {
    this.elements.towerButtons.forEach(btn => {
      const type = btn.dataset.type;
      // Note: We'd ideally import TOWER_STATS here or pass it in
      // For now, hardcoded costs to match core/Tower.js
      const costs = { GREEN: 20, RED: 30, BLUE: 40 };
      btn.disabled = (gold < costs[type]);
    });
  }

  updateHealth(organName, currentHP, maxHP) {
    const bar = document.getElementById(`${organName.toLowerCase()}-bar`);
    const text = document.getElementById(`${organName.toLowerCase()}-text`);

    if (bar) {
      const percentage = (currentHP / maxHP) * 100;
      bar.style.width = `${percentage}%`;

      if (percentage <= 25) {
        bar.style.background = '#ff0000';
      } else if (percentage <= 50) {
        bar.style.background = '#ffaa00';
      } else {
        bar.style.background = '#00ff00';
      }
    }

    if (text) {
      text.textContent = `${currentHP}/${maxHP}`;
    }
  }

  showMessage(text, duration = 3000) {
    if (this.elements.messages) {
      this.elements.messages.textContent = text;
      this.elements.messages.style.display = 'block';

      setTimeout(() => {
        if (this.elements.messages.textContent === text) {
          this.elements.messages.style.display = 'none';
        }
      }, duration);
    }
  }

  hideLoadingScreen() {
    if (this.elements.loadingScreen) {
      this.elements.loadingScreen.style.display = 'none';
    }
  }

  showGameOver() {
    if (this.elements.gameOverScreen) {
      this.elements.gameOverScreen.style.display = 'flex';
    }
  }
}
