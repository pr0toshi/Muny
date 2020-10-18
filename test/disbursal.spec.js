const { expect } = require('chai');
const { BigNumber } = require('ethers');
const { formatEther } = require('ethers/lib/utils');
const { expandTo8Decimals } = require('./utils');

const errorDelta = 1e-8;

function calcRelativeDiff(expected, actual) {
  const diff = expected.sub(actual).toNumber();
  return Math.abs(diff / expected.toNumber());
}


describe('Muny.sol', async () => {
  let muny, deployer;
  let account1, account2;
  before(async () => {
    ({ deployer } = await getNamedAccounts());
    const [signer, signer1, signer2] = await ethers.getSigners();
    account1 = await signer1.getAddress();
    account2 = await signer2.getAddress();
    const Muny = await ethers.getContractFactory('Muny');
    muny = await Muny.deploy('Muny', 'Muny', deployer, deployer);
  });

  describe('Constructor & Settings', async () => {
    it('totalSupply()', async () => {
      const totalSupply = await muny.callStatic.totalSupply({ gasLimit: 5e6 });
      const supply = expandTo8Decimals(1e7);
      expect(totalSupply.eq(supply)).to.be.true;
    });
  });

  describe('Disbursal', async () => {
    it('_disburse()', async () => {
      await muny._disburse(expandTo8Decimals(1000), { gasLimit: 5e6 });
      const totalSupply = await muny.callStatic.totalSupply({ gasLimit: 5e6 });
      const supply = expandTo8Decimals(1e7 + 1000);
      expect(totalSupply.eq(supply)).to.be.true;
    });

    it('totalDisbursals()', async () => {
      const totalDisbursals = await muny.totalDisbursals({ gasLimit: 5e6 });
      expect(totalDisbursals.eq(1)).to.be.true;
    });

    it('getDividendsOwed()', async () => {
      const owed = await muny['getDividendsOwed(address)'](deployer, { gasLimit: 5e6 });
      const supply = expandTo8Decimals(1000);
      expect(owed.eq(supply)).to.be.true;
    });

    it('lastDisbursalIndex() returns 0', async () => {
      const lastDisbursalIndex = await muny.lastDisbursalIndex(deployer, { gasLimit: 5e6 });
      expect(lastDisbursalIndex.eq(0)).to.be.true;
    });

    it('claimDividends()', async () => {
      const balanceBefore = await muny.balanceOf(deployer, { gasLimit: 5e6 });
      expect(balanceBefore.eq(expandTo8Decimals(1e7))).to.be.true;
      await muny['claimDividends(address)'](deployer, { gasLimit: 5e6 });
      const balanceAfter = await muny.balanceOf(deployer, { gasLimit: 5e6 });
      const diff = balanceAfter.sub(balanceBefore);
      expect(diff.eq(expandTo8Decimals(1000))).to.be.true;
    });

    it('lastDisbursalIndex() returns 1', async () => {
      const lastDisbursalIndex = await muny.lastDisbursalIndex(deployer, { gasLimit: 5e6 });
      expect(lastDisbursalIndex.eq(1)).to.be.true;
    });
  });

  const getTransferredValueAfterFeeAndBurn = async (amountt) => {
    const totalSupply = await muny.totalSupply({ gasLimit: 5e6 });
    const burnedSupply = await muny.burnedSupply({ gasLimit: 5e6 });
    const amount = amountt.mul(totalSupply.sub(burnedSupply)).div(totalSupply);
    const afterFee = amount.mul(99000).div(100000);
    const newBurnedSupply = burnedSupply.add(amount.div(200));
    return afterFee.mul(totalSupply).div(totalSupply.sub(newBurnedSupply));
  };

  const assertRoughlyEquals = (expected, actual) => {
    const diff = calcRelativeDiff(expected, actual);
    expect(diff).to.be.lt(errorDelta);
  }

  describe('Multiple disbursals', async () => {
    let totalSupplyBeforeDisbursal;
    before(async () => {
      const value = expandTo8Decimals(100);

      const expectedBalance = await getTransferredValueAfterFeeAndBurn(value);
      await muny.transfer(account1, value, { gasLimit: 5e6 }).then(tx => tx.wait());
      const balance1 = await muny.balanceOf(account1, { gasLimit: 5e6 });
      expect(balance1.eq(expectedBalance)).to.be.true;

      await muny.transfer(account2, value, { gasLimit: 5e6 });
      const balance2 = await muny.balanceOf(account2, { gasLimit: 5e6 });
      expect(balance2.eq(expectedBalance)).to.be.true;
    });
    
    it('Executes four disbursals', async () => {
      const amount = expandTo8Decimals(1000);

      totalSupplyBeforeDisbursal = await muny.totalSupply({ gasLimit: 5e6 });

      for (let i = 0; i < 4; i++) {
        await muny._disburse(amount, { gasLimit: 5e6 });
      }

      const totalSupplyAfter = await muny.totalSupply({ gasLimit: 5e6 });
      const diff = totalSupplyAfter.sub(totalSupplyBeforeDisbursal);
      expect(diff.eq(amount.mul(4))).to.be.true;
    });

    it('totalDisbursals()', async () => {
      const totalDisbursals = await muny.totalDisbursals({ gasLimit: 5e6 });
      expect(totalDisbursals.eq(5)).to.be.true;
    });

    it('getDividendsOwed()', async () => {
      const burnedSupply = await muny.burnedSupply({ gasLimit: 5e6 });
      const balance = await muny._balances(account1, { gasLimit: 5e6 });
      let compoundBalance = BigNumber.from(balance);
      let totalSupply = BigNumber.from(totalSupplyBeforeDisbursal);
      let remainingSupply = totalSupply.sub(burnedSupply);
      let newDividendPoints = expandTo8Decimals(1000).mul(expandTo8Decimals(1)).div(remainingSupply);
      //expandTo8Decimals(4000).mul(expandTo8Decimals(1)).div(remainingSupply);
      for (let i = 0; i < 4; i++) {
        compoundBalance = compoundBalance.add(
          compoundBalance.mul(newDividendPoints).div(expandTo8Decimals(1))
        );
        totalSupply = totalSupply.add(expandTo8Decimals(1000));
        remainingSupply = totalSupply.sub(burnedSupply);
        newDividendPoints = expandTo8Decimals(1000).mul(expandTo8Decimals(1)).div(remainingSupply);
      }
      const expectedDividends = compoundBalance.sub(balance);
      const owed1 = await muny['getDividendsOwed(address)'](account1, { gasLimit: 5e6 });
      const owed2 = await muny['getDividendsOwed(address)'](account2, { gasLimit: 5e6 });
      expect(owed1.sub(expectedDividends).abs().toNumber()).to.be.lte(1);
      expect(owed2.sub(expectedDividends).abs().toNumber()).to.be.lte(1);
    });
  });
});