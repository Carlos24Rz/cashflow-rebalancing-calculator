/** @module utilities/rebalancePortfolio */

// An algorithm to rebalance an investment portfolio using
// the cash-flow rebalancing technique, given the desired asset allocation
// and the montly contribution

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
    const targetDifference = Math.abs(
      Number(targetAllocation[asset]) - Number(percentages[asset])
    );

    if (targetDifference > 0.01) return false;
  }

  return true;
}

/**
 * Portfolio rebalancing algorithm using recursion and a greedy approach
 * @param {Portfolio} currentPortfolio The Current Portfolio
 * @param {Object} targetAllocation The Desired Asset Allocation
 * @param {Number} montlyContribution The Montly Contribution
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
      const targetDifference =
        Number(targetAllocation[assetName]) - Number(assetAllocation);

      // asset is over the target allocation
      if (targetDifference < 0) {
        overTargetAssets.push({
          assetName,
          value: Math.abs(targetDifference).toFixed(2),
        });
      } else if (targetDifference > 0) {
        belowTargetAssets.push({
          assetName,
          value: targetDifference.toFixed(2),
        });
      }
    }
  );

  // Sort by most unbalanced assets
  belowTargetAssets.sort(
    (currentAsset, nextAsset) =>
      Number(nextAsset.value) - Number(currentAsset.value)
  );
  overTargetAssets.sort(
    (currentAsset, nextAsset) =>
      Number(nextAsset.value) - Number(currentAsset.value)
  );

  const rebalanceAmount = overTargetAssets.reduce(
    (currentBalance, { assetName, value }) => {
      const difference = Number(targetAllocation[assetName]) - Number(value);

      if (difference < 0) {
        newAssetAllocation[assetName] = '0';
        // eslint-disable-next-line no-param-reassign
        currentBalance += Number(targetAllocation[assetName]);
      } else {
        newAssetAllocation[assetName] = difference.toFixed(2);
        // eslint-disable-next-line no-param-reassign
        currentBalance += Number(value);
      }

      return currentBalance;
    },
    0
  );

  newAssetAllocation[belowTargetAssets[0].assetName] =
    Number(targetAllocation[belowTargetAssets[0].assetName]) + rebalanceAmount;

  Object.entries(newAssetAllocation).forEach(([assetName, assetAllocation]) => {
    currentMonthInvestment[assetName] = (
      Number(montlyContribution) * Number(assetAllocation)
    ).toFixed(2);
    portfolioAssets[assetName] = (
      Number(portfolioAssets[assetName]) +
      Number(currentMonthInvestment[assetName])
    ).toFixed(2);
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

export default rebalancePortfolio;
