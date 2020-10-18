const { BigNumber } = require('ethers');
const { formatEther } = require('ethers/lib/utils');

const DELAY = 60 * 60 * 24 * 2

async function mineBlock(provider, timestamp) {
  return provider.send('evm_mine', timestamp ? [timestamp] : [])
}

async function fastForward(provider, seconds) {
  await provider.send('evm_increaseTime', [seconds]);
  await mineBlock(provider);
}

function expandTo8Decimals(n) {
  return BigNumber.from(n).mul(BigNumber.from(10).pow(8))
}

function from18Decimals(n) {
  return formatEther(n);
}

module.exports = {
  DELAY,
  mineBlock,
  expandTo8Decimals,
  from18Decimals,
  fastForward
}