/** @module utilities/rebalancePortfolio */

// An algorithm to rebalance an investment portfolio using
// the cash-flow rebalancing technique, given the desired asset allocation
// and the montly contribution

import Fraction from 'fraction.js';
// eslint-disable-next-line import/extensions
import Portfolio from '../classes/Portfolio.js';

/**
 * Vanguard suggest to rebalance a portfolio only if an
 * asset has shifted more than 5 percentage points from its target
 * https://investor.vanguard.com/investor-resources-education/article/3-rebalancing-tips-to-fine-tune-your-portfolio
 *
 * @param {Portfolio} portfolio
 * @param {Object} targetAllocation
 */
function isBalanced(portfolio, targetAllocation) {
  const percentages = portfolio.getPortfolioAllocation();

  // eslint-disable-next-line no-restricted-syntax, guard-for-in
  for (const asset in percentages) {
    const targetDifference = targetAllocation[asset]
      .sub(percentages[asset])
      .abs();

    if (targetDifference.compare(new Fraction('0.05')) > 0) return false;
  }

  return true;
}

/**
 * Portfolio rebalancing algorithm using recursion and a greedy approach
 * @param {Portfolio} currentPortfolio The Current Portfolio
 * @param {Object} targetAllocation The Desired Asset Allocation
 * @param {Fraction} montlyContribution The Montly Contribution
 * @param {Object[]} montlyInvestments The Current Monthly Investment to rebalance the portfolio
 * @returns {Object[]} The Monthly Rebalance Investment until the portfolio is rebalanced
 */
function rebalance(
  currentPortfolio,
  targetAllocation,
  montlyContribution,
  montlyInvestments = []
) {
  // base case: Portfolio is balanced
  if (isBalanced(currentPortfolio, targetAllocation)) {
    return montlyInvestments;
  }

  const belowTargetAssets = [];
  const overTargetAssets = [];
  const currentMonthInvestment = {};
  const newAssetAllocation = { ...targetAllocation };

  const portfolioAssets = currentPortfolio.assets;
  const portfolioAllocation = currentPortfolio.getPortfolioAllocation();

  Object.entries(portfolioAllocation).forEach(
    ([assetName, assetAllocation]) => {
      const targetDifference = targetAllocation[assetName].sub(assetAllocation);

      // asset is over the target allocation
      if (targetDifference.compare(new Fraction('0')) < 0) {
        overTargetAssets.push({
          assetName,
          value: targetDifference.abs(),
        });
      } else if (targetDifference.compare(new Fraction('0')) > 0) {
        belowTargetAssets.push({
          assetName,
          value: targetDifference,
        });
      }
    }
  );

  // Sort by most unbalanced assets
  belowTargetAssets.sort((currentAsset, nextAsset) =>
    nextAsset.value.compare(currentAsset.value)
  );
  overTargetAssets.sort((currentAsset, nextAsset) =>
    nextAsset.value.compare(currentAsset.value)
  );

  const rebalanceAmount = overTargetAssets.reduce(
    (currentBalance, { assetName, value }) => {
      // newAssetAllocation[assetName] = new Fraction('0');
      // // eslint-disable-next-line no-param-reassign
      // currentBalance = currentBalance.add(targetAllocation[assetName]);
      const difference = targetAllocation[assetName].sub(value);

      if (difference.compare(new Fraction('0')) < 0) {
        newAssetAllocation[assetName] = new Fraction('0');
        // eslint-disable-next-line no-param-reassign
        currentBalance = currentBalance.add(targetAllocation[assetName]);
      } else {
        newAssetAllocation[assetName] = difference;
        // eslint-disable-next-line no-param-reassign
        currentBalance = currentBalance.add(value);
      }

      return currentBalance;
    },
    new Fraction('0')
  );

  newAssetAllocation[belowTargetAssets[0].assetName] =
    targetAllocation[belowTargetAssets[0].assetName].add(rebalanceAmount);

  Object.entries(newAssetAllocation).forEach(([assetName, assetAllocation]) => {
    currentMonthInvestment[assetName] = montlyContribution.mul(assetAllocation);
    portfolioAssets[assetName] = portfolioAssets[assetName].add(
      currentMonthInvestment[assetName]
    );
  });

  // eslint-disable-next-line no-param-reassign
  currentPortfolio.assets = portfolioAssets;
  montlyInvestments.push(currentMonthInvestment);

  return rebalance(
    currentPortfolio,
    targetAllocation,
    montlyContribution,
    montlyInvestments
  );
}

function rebalancePortfolio(portfolio, targetAllocation, montlyContribution) {
  // create a copy of the Portfolio
  const portfolioCopy = new Portfolio(portfolio.assets);

  return rebalance(portfolioCopy, targetAllocation, montlyContribution);
}

/** The portfolio rebalancing calculator */
export default rebalancePortfolio;
