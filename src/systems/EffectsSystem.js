export class EffectsSystem {
  constructor() {
    this.overlay = document.getElementById('effects-overlay');
    this.lastEyeHP = -1;
  }

  update(healthSystem) {
    const eyeOrgan = healthSystem.organs.eyes;
    if (!eyeOrgan) return;

    if (eyeOrgan.currentHP !== this.lastEyeHP) {
      this.lastEyeHP = eyeOrgan.currentHP;
      this.applyEyeEffects(eyeOrgan.currentHP, eyeOrgan.maxHP);
    }
  }

  applyEyeEffects(currentHP, maxHP) {
    if (!this.overlay) return;

    const percentage = (currentHP / maxHP) * 100;
    const canvas = document.querySelector('canvas');

    if (percentage > 50) {
      this.resetEffects(canvas);
    } else if (percentage > 25) {
      const intensity = (50 - percentage) / 25; // 0 to 1
      this.applyVignette(intensity);
      if (canvas) canvas.style.filter = 'none';
    } else if (percentage > 10) {
      this.applyVignette(1.0);
      const blurIntensity = (25 - percentage) / 15; // 0 to 1
      if (canvas) canvas.style.filter = `blur(${blurIntensity * 8}px)`;
      this.overlay.style.backgroundColor = 'transparent';
    } else if (percentage > 0) {
      this.applyVignette(1.0);
      if (canvas) canvas.style.filter = 'blur(8px)';
      const darknessIntensity = (10 - percentage) / 10; // 0 to 1
      this.overlay.style.backgroundColor = `rgba(0, 0, 0, ${darknessIntensity * 0.8})`;
    } else {
      // Total blindness
      this.overlay.style.background = 'black';
      if (canvas) canvas.style.filter = 'none';
    }
  }

  applyVignette(intensity) {
    const gradient = `radial-gradient(circle at center, transparent 30%, rgba(0, 0, 0, ${intensity * 0.7}) 100%)`;
    this.overlay.style.background = gradient;
  }

  resetEffects(canvas) {
    this.overlay.style.background = 'none';
    this.overlay.style.backgroundColor = 'transparent';
    if (canvas) canvas.style.filter = 'none';
  }
}
