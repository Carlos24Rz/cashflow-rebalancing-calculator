/** @module classes/Porfolio */

/**
 * Represents an Investment Portfolio
 */
class Portfolio {
  /**
   * @property {Object} #assets The portfolio assets
   */
  #assets;

  /**
   * @property {String} #assets The portfolio value
   */
  #value;

  /**
   * @property {Function} #calculatePortolioValue Calculates the portfolio value
   * @returns {string} The Portfolio Assets
   */
  #calculatePortfolioValue() {
    let currentTotal = 0;

    Object.values(this.#assets).forEach((amount) => {
      currentTotal += Number(amount);
    });

    return currentTotal.toFixed(2);
  }

  /**
   * Create a portfolio
   * @param {Object} assets The portfolio assets
   */
  constructor(assets = {}) {
    this.#assets = assets;
    this.#value = this.#calculatePortfolioValue();
  }

  /**
   * Update the portfolio assets
   * @param {Object} newAssets The new portolio assets
   */
  set assets(newAssets = {}) {
    this.#assets = newAssets;
    this.#value = this.#calculatePortfolioValue();
  }

  /**
   * Get the portolio assets
   * @return {Object} The porfolio assets
   */
  get assets() {
    return this.#assets;
  }

  /**
   * Get the portfolio value
   * @return {String} The porfolio value
   */
  get value() {
    return this.#value;
  }

  /**
   * Get the portfolio allocation in percentages
   * @return {Object} The porfolio allocation in percentages
   */
  getPortfolioAllocation() {
    const percentages = {};

    Object.entries(this.#assets).forEach(([assetName, assetValue]) => {
      percentages[assetName] = (
        Number(assetValue) / Number(this.#value)
      ).toFixed(2);
    });

    return percentages;
  }
}

/** The portfolio class */
export default Portfolio;
