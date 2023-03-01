/** @module classes/Porfolio */

// eslint-disable-next-line import/extensions
import Fraction from 'fraction.js';

/**
 * Represents an Investment Portfolio
 */
class Portfolio {
  /**
   * @property {Object} #assets The portfolio assets
   */
  #assets;

  /**
   * @property {Fraction} #assets The portfolio value
   */
  #value;

  /**
   * @property {Function} #calculatePortolioValue Calculates the portfolio value
   * @returns {Fraction} The Portfolio Assets
   */
  #calculatePortfolioValue() {
    let currentTotal = new Fraction(0);

    Object.values(this.#assets).forEach((/** @type {Fraction} */ amount) => {
      currentTotal = currentTotal.add(amount);
    });

    return currentTotal;
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
   * @return {Fraction} The porfolio value
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

    Object.entries(this.#assets).forEach((asset) => {
      const assetName = asset[0];
      /** @type {Fraction} */
      const assetValue = asset[1];

      percentages[assetName] = assetValue.div(this.#value);
    });

    return percentages;
  }
}

/** The portfolio class */
export default Portfolio;
