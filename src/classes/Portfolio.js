class Portfolio {
  #assets;

  #value;

  #calculatePortfolioValue() {
    let currentTotal = 0;

    Object.values(this.#assets).forEach((amount) => {
      currentTotal += amount;
    });

    return currentTotal;
  }

  constructor(assets = {}) {
    this.#assets = assets;
    this.#value = this.#calculatePortfolioValue();
  }

  set assets(newAssets = {}) {
    this.#assets = newAssets;
    this.#value = this.#calculatePortfolioValue();
  }

  get assets() {
    return this.#assets;
  }

  get value() {
    return this.#value;
  }

  getAssetsPercentages() {
    const percentages = {};

    Object.entries(this.#assets).forEach(([assetName, assetValue]) => {
      percentages[assetName] = assetValue / this.#value;
    });

    return percentages;
  }
}

export default Portfolio;
