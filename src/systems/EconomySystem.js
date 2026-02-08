export class EconomySystem {
  constructor(initialGold = 50) {
    this.gold = initialGold;
  }

  canAfford(cost) {
    return this.gold >= cost;
  }

  spend(amount) {
    if (this.canAfford(amount)) {
      this.gold -= amount;
      this.updateUI();
      return true;
    }
    return false;
  }

  earn(amount) {
    this.gold += amount;
    this.updateUI();
  }

  updateUI() {
    const goldElement = document.getElementById('gold-count');
    if (goldElement) {
      goldElement.innerText = this.gold;
    }
  }
}
