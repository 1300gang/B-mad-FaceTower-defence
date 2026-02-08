export class AudioSystem {
  constructor() {
    this.context = new (window.AudioContext || window.webkitAudioContext)();
    this.sounds = {};
    this.isMuted = false;
    this.volume = 0.5;

    // In a real scenario, we would load assets here.
    // For now, we'll implement the play method with error handling if sound not found.
  }

  play(name, vol = 1.0) {
    if (this.isMuted) return;

    // Synth fallback for MVP
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.connect(gain);
    gain.connect(this.context.destination);

    const now = this.context.currentTime;

    switch(name) {
      case 'towerPlace':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(vol * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      case 'towerFire':
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.05);
        gain.gain.setValueAtTime(vol * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      case 'enemyDeath':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(55, now + 0.2);
        gain.gain.setValueAtTime(vol * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      case 'organDamage':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(110, now);
        gain.gain.setValueAtTime(vol * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
    }
  }

  unlock() {
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  setMute(muted) {
    this.isMuted = muted;
  }
}
