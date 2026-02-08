import { VitalOrgan } from '../core/VitalOrgan.js';

export class HealthSystem {
  constructor() {
    this.organs = {
      eyes: new VitalOrgan('EYES', 10, null),
      nose: new VitalOrgan('NOSE', 7, null),
      mouth: new VitalOrgan('MOUTH', 15, null)
    };
    this.isGameOver = false;
  }

  // Position needs to be updated once landmarks are available/updated
  updateOrganPositions(landmarks) {
    if (!landmarks) return;
    this.organs.eyes.position = landmarks[168].position; // Midpoint
    this.organs.nose.position = landmarks[1].position;   // Tip
    this.organs.mouth.position = landmarks[13].position; // Center
  }

  damageOrgan(name, amount) {
    const organ = this.organs[name.toLowerCase()];
    if (organ) {
      organ.takeDamage(amount);
      this.updateUI();
      this.checkGameOver();
    }
  }

  checkGameOver() {
    if (Object.values(this.organs).every(o => o.isDestroyed)) {
      this.isGameOver = true;
      this.triggerGameOver();
    }
  }

  triggerGameOver() {
    console.log("GAME OVER");
    const gameOverScreen = document.getElementById('game-over-screen');
    if (gameOverScreen) {
      gameOverScreen.style.display = 'flex';
    }
  }

  updateUI() {
    for (const [name, organ] of Object.entries(this.organs)) {
      const bar = document.getElementById(`${name}-bar`);
      const text = document.getElementById(`${name}-text`);
      if (bar) bar.style.width = `${organ.getHealthPercentage()}%`;
      if (text) text.textContent = `${organ.currentHP}/${organ.maxHP}`;
    }
  }
}
