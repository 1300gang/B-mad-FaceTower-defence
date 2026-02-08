import { VitalOrgan } from '../core/VitalOrgan.js';

export class HealthSystem {
  constructor() {
    this.organs = {
      eyes: new VitalOrgan('EYES', 10, null),
      nose: new VitalOrgan('NOSE', 7, null),
      mouth: new VitalOrgan('MOUTH', 15, null)
    };
    this.isGameOver = false;
    this.uiManager = null;
    this.audioSystem = null;
  }

  setManagers(uiManager, audioSystem) {
    this.uiManager = uiManager;
    this.audioSystem = audioSystem;
    this.updateUI();
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
      if (this.audioSystem) this.audioSystem.play('organDamage');
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
    if (this.uiManager) {
      this.uiManager.showGameOver();
    }
    if (this.audioSystem) this.audioSystem.play('gameOver');
  }

  updateUI() {
    if (this.uiManager) {
      for (const [name, organ] of Object.entries(this.organs)) {
        this.uiManager.updateHealth(name, organ.currentHP, organ.maxHP);
      }
    }
  }
}
