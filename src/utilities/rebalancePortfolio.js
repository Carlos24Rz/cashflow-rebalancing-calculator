/** @module utilities/rebalancePortfolio */

// An algorithm to rebalance an investment portfolio using
// the cash-flow rebalancing technique, given the desired asset allocation
// and the montly contribution

import Fraction from 'fraction.js';

// Determines how the error variation of the algorithm
// Vanguard suggest to rebalance a portfolio only if an
// asset has shifted more than 5 percentage points from its target
// https://investor.vanguard.com/investor-resources-education/article/3-rebalancing-tips-to-fine-tune-your-portfolio
const UNBALANCED_RANGE = new Fraction('0');

/**
 * Portfolio rebalancing visualizing algorithm using a greedy approach
 * @param {Portfolio} portofolio The current portfolio
 * @param {Object} targetAllocation The desired asset allocation
 * @param {Object} currentPortfolio The amount of money it need to be invested per asset to balance it
 * @param {Fraction} remainingPortfolioValue The total amount of money to be invested
 * @param {Fraction} montlyContribution The Montly Contribution
 * @returns {Object[]} The Monthly Rebalance Investment until the portfolio is rebalanced
 */
function rebalance(
  portofolio,
  targetAllocation,
  balancedPortfolio,
  montlyContribution
) {
  const montlyAllocation = [];

  // Order assets by those that have shifted the most from its original allocation
  const portfolioAllocation = portofolio.getPortfolioAllocation();
  const balancedPortfolioList = Object.entries(balancedPortfolio).sort(
    (
      // eslint-disable-next-line no-unused-vars
      [currentAssetName, currentAssetValue],
      // eslint-disable-next-line no-unused-vars
      [nextAssetName, nextAssetValue]
    ) => {
      const nextAssetDifference = targetAllocation[nextAssetName].sub(
        portfolioAllocation[nextAssetName]
      );
      const currentAssetDiffrence = targetAllocation[currentAssetName].sub(
        portfolioAllocation[currentAssetName]
      );

      return nextAssetDifference.compare(currentAssetDiffrence);
    }
  );

  let index = 0;

  while (index < balancedPortfolioList.length) {
    let remainingMonthAmount = montlyContribution;
    const monthAllocation = Object.keys(targetAllocation).reduce(
      (dict, assetName) => {
        // eslint-disable-next-line no-param-reassign
        dict[assetName] = new Fraction('0');

        return dict;
      },
      {}
    );

    while (remainingMonthAmount.compare(new Fraction('0')) !== 0) {
      const difference =
        balancedPortfolioList[index][1].sub(remainingMonthAmount);

      if (difference.compare(new Fraction('0')) >= 0) {
        balancedPortfolioList[index][1] = difference;
        monthAllocation[balancedPortfolioList[index][0]] =
          monthAllocation[balancedPortfolioList[index][0]].add(
            remainingMonthAmount
          );
        remainingMonthAmount = new Fraction('0');
        montlyAllocation.push(monthAllocation);
      } else {
        monthAllocation[balancedPortfolioList[index][0]] = monthAllocation[
          balancedPortfolioList[index][0]
        ].add(balancedPortfolioList[index][1]);
        balancedPortfolioList[index][1] = new Fraction('0');
        remainingMonthAmount = difference.abs();
        // eslint-disable-next-line no-plusplus
        index++;
      }

      if (index >= balancedPortfolioList.length) break;
    }
  }

  return montlyAllocation;
}

function rebalancePortfolio(portfolio, targetAllocation, montlyContribution) {
  const targetAllocationDict = {};
  const balancedAllocation = { ...targetAllocation };
  const overTargetAllocationAssets = [];

  // hash the percentages to get which assets have the same target allocation
  Object.entries(targetAllocation).forEach(([assetName, assetValue]) => {
    const assetAllocationFraction = assetValue.toFraction();

    if (!targetAllocationDict[assetAllocationFraction]) {
      targetAllocationDict[assetAllocationFraction] = [];
    }

    targetAllocationDict[assetAllocationFraction].push(assetName);
  });

  Object.entries(portfolio.getPortfolioAllocation()).forEach(
    ([assetName, assetAllocation]) => {
      const targetDifference = targetAllocation[assetName].sub(assetAllocation);

      // asset is over the target allocation
      if (targetDifference.compare(new Fraction('0')) < 0) {
        overTargetAllocationAssets.push({
          assetName,
          value: targetDifference.abs(),
        });
      }
    }
  );

  // Sort by most unbalanced assets
  overTargetAllocationAssets.sort((currentAsset, nextAsset) =>
    nextAsset.value.compare(currentAsset.value)
  );

  const mostUnbalancedAssetFraction =
    targetAllocation[overTargetAllocationAssets[0].assetName].toFraction();

  const baselineAsset = targetAllocationDict[
    mostUnbalancedAssetFraction
  ].reduce((currentMax, currentAsset) => {
    // eslint-disable-next-line no-param-reassign
    if (!currentMax) currentMax = currentAsset;
    else {
      const assetValue = portfolio.assets[currentAsset];
      const maxValue = portfolio.assets[currentMax];

      // eslint-disable-next-line no-param-reassign
      if (maxValue.compare(assetValue) < 0) currentMax = currentAsset;
    }

    return currentMax;
  }, '');

  // Adjust allocation based on the error variation
  balancedAllocation[baselineAsset] =
    targetAllocation[baselineAsset].add(UNBALANCED_RANGE);

  // remove surplus created by shifting most unbalanced asset by the error variation
  let unbalancedSurplus = UNBALANCED_RANGE;
  while (unbalancedSurplus.compare(new Fraction('0')) > 0) {
    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const asset in balancedAllocation) {
      if (unbalancedSurplus.compare(new Fraction('0')) <= 0) break;

      const difference = balancedAllocation[asset].sub(new Fraction('0.01'));

      if (
        asset !== baselineAsset &&
        difference.compare(new Fraction('0')) > 0
      ) {
        balancedAllocation[asset] = difference;
        unbalancedSurplus = unbalancedSurplus.sub(new Fraction('0.01'));
      }
    }
  }

  const balancedValuePortfolio = portfolio.assets[baselineAsset].div(
    balancedAllocation[baselineAsset]
  );

  let remainingPortfolioValue = new Fraction('0');
  // calculate remaining contributions for each asset
  Object.entries(balancedAllocation).forEach(([assetName, assetAllocation]) => {
    balancedAllocation[assetName] = assetAllocation
      .mul(balancedValuePortfolio)
      .sub(portfolio.assets[assetName]);

    remainingPortfolioValue = remainingPortfolioValue.add(
      balancedAllocation[assetName]
    );
  });

  return rebalance(
    portfolio,
    targetAllocation,
    balancedAllocation,
    montlyContribution
  );
}

/** The portfolio rebalancing calculator */
export default rebalancePortfolio;
