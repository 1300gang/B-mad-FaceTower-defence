export class EconomySystem {
  constructor(initialGold = 50) {
    this.gold = initialGold;
    this.uiManager = null;
  }

  setUIManager(uiManager) {
    this.uiManager = uiManager;
    this.updateUI();
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
    if (this.uiManager) {
      this.uiManager.updateGold(this.gold);
    }
  }
}
