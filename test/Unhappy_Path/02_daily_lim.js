let MultiSigWallet = artifacts.require('./MultiSigWallet.sol');

contract('MultiSig Wallet daily limit test', accounts => {

	let multiSigWallet = {};
	let dailyLim = 10;
	let numConfirms = 2;

	before(function() {
		return MultiSigWallet.new([accounts[0], accounts[1], accounts[2]], numConfirms, dailyLim)
			.then(function(instance) {
				multiSigWallet = instance;
				return web3.eth.sendTransaction({from: accounts[0], to: multiSigWallet.address, value: web3.toWei('1', 'ether')});
			})
	});

	it('Should be able to fail to withdraw an amount that is greater than the daily limit', function() {
		let accountBalance = web3.eth.getBalance(accounts[2]);
		let newAccountBalance;
		let hash = 1234;

		// account[0] tells wallet to withdraw 9 wei to account[2]
		return multiSigWallet.execute(accounts[2], 9, hash)
			.then(function(txReceipt) {
				newAccountBalance = web3.eth.getBalance(accounts[2]);
				assert.isTrue(newAccountBalance.greaterThan(accountBalance));

				accountBalance = newAccountBalance;
				// Make it go over the daily limit of 10 wei
				hash = 12345;
				return multiSigWallet.execute(accounts[2], 2, hash);
			}).then(function(txReceipt) {
				newAccountBalance = web3.eth.getBalance(accounts[2]);
				assert.equal(newAccountBalance.toNumber(), accountBalance.toNumber(), "Account balance should not have changed");
			})
	});

	it('Should be able to fail to withdraw from a non-owner account', function() {
		let hash = 1234;

		// account[0] tells wallet to withdraw 9 wei to account[2]
		return multiSigWallet.execute(accounts[2], 9, hash, {from: accounts[3]})
			.then(assert.fail)
			.catch(function(error) {
				assert(error.message.indexOf('revert') >= 0, "error should be revert");
			})
	});

});