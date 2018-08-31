const PurchaseLimitedCrowdsale = artifacts.require('PurchaseLimitedCrowdsaleImpl');
const MintableToken = artifacts.require('MintableToken.sol');
const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .use(require('chai-as-promised'))
  .should();

const ether = (n) => new BigNumber(web3.toWei(n, 'ether'));

contract('PurchaseLimitedCrowdsale', function (accounts) {
  const [owner, purchaser] = accounts;
  const rate = 500;
  const wallet = owner;
  const tokenSupply = new BigNumber('1e25');
  const value = ether(4);
  const minimumLimit = ether(2);
  const maximumLimit = ether(10);
  const excessValue = maximumLimit.add(ether(1));
  const underValue = minimumLimit.sub(ether(1));

  let crowdsale;
  let token;
  beforeEach(async function () {
    token = await MintableToken.new();
    crowdsale = await PurchaseLimitedCrowdsale.new(
      minimumLimit, maximumLimit, rate, wallet, token.address,
    );
    await token.mint(crowdsale.address, tokenSupply);
  });

  describe('total purchase amount', async function () {
    it('accumulates purchase amount', async function () {
      const raisedWeiBeforePurchase = await crowdsale.contributions(purchaser);
      raisedWeiBeforePurchase.should.be.bignumber.equal(0);

      await crowdsale.sendTransaction({ value, from: purchaser }).should.be.fulfilled;

      const raisedWeiAfterPurchase = await crowdsale.contributions(purchaser);
      raisedWeiAfterPurchase.should.be.bignumber.equal(value);

      await crowdsale.sendTransaction({ value, from: purchaser }).should.be.fulfilled;

      const raisedWeiAfterSecondPurchase = await crowdsale.contributions(purchaser);
      raisedWeiAfterSecondPurchase.should.be.bignumber.equal(value.times(2));
    });
  });

  describe('purchase limit', async function () {
    it('accepts the purchase by the minimum amount', async function () {
      await crowdsale.sendTransaction({ value: minimumLimit }).should.be.fulfilled;
    });

    it('accepts the purchase by the maximum amount', async function () {
      await crowdsale.sendTransaction({ value: maximumLimit }).should.be.fulfilled;
    });

    it('accepts the purchase for amount between minimumLimit and maximumLimit', async function () {
      await crowdsale.sendTransaction({ value }).should.be.fulfilled;
    });

    it('rejects the purchase under minimum amount', async function () {
      await crowdsale.sendTransaction({ value: underValue }).should.be.rejectedWith(/revert/);
    });

    it('rejects the purchase excessing maximum amount', async function () {
      await crowdsale.sendTransaction({ value: excessValue }).should.be.rejectedWith(/revert/);
    });
  });
});
