let MultiSigWallet = artifacts.require('./MultiSigWallet.sol');

contract('MultiSig Wallet set new daily limit test', accounts => {

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

	it('Should be able to set a new daily limit', function() {
		let accountBalance = web3.eth.getBalance(accounts[2]);
		let newAccountBalance;
		let hash = 1234;
		let newDailyLim = 20;

		// Do a normal withdrawal first
		return multiSigWallet.execute(accounts[2], 9, hash)
			.then(function(txReceipt) {

				assert.equal(txReceipt.logs.length, 1, "There should have been one event emitted");
				assert.equal(txReceipt.logs[0].event, "SingleTransact", "First event should have been SingleTransact");

				newAccountBalance = web3.eth.getBalance(accounts[2]);
				assert.isTrue(newAccountBalance.greaterThan(accountBalance));

				// Then set a new withdrawal limit of 20
				return multiSigWallet.setDailyLimit(newDailyLim);

			}).then(function(txReceipt) {

				// Make sure the correct events fired
				assert.equal(txReceipt.logs.length, 1, "There should have been one event emitted");
				assert.equal(txReceipt.logs[0].event, "Confirmation", "First event should have been Confirmation");

				// confirm the operation from account[1]
				return multiSigWallet.setDailyLimit(newDailyLim, {from: accounts[1], data: '123'});

			}).then(function(txReceipt) {

				assert.equal(txReceipt.logs.length, 2, "There should have been two events emitted");
				assert.equal(txReceipt.logs[0].event, "Confirmation", "First event should have been Confirmation");
				assert.equal(txReceipt.logs[1].event, "DailyLimitSet", "Second event should have been DailyLimitSet");
				assert.equal(txReceipt.logs[1].args.newDailyLim, newDailyLim, "The new daily limit should be " + newDailyLim);

				return multiSigWallet.resetSpentToday({from: accounts[0], data: '234'});
			}).then(function(txReceipt) {

				assert.equal(txReceipt.logs.length, 1, "There should have been two events emitted");
				assert.equal(txReceipt.logs[0].event, "Confirmation", "First event should have been Confirmation");

				return multiSigWallet.resetSpentToday({from: accounts[1], data: '234'});

			}).then(function(txReceipt) {

				assert.equal(txReceipt.logs.length, 2, "There should have been two events emitted");
				assert.equal(txReceipt.logs[0].event, "Confirmation", "First event should have been Confirmation");
				assert.equal(txReceipt.logs[1].event, "ResetSpentToday", "Second event should have been ResetSpentToday");

				accountBalance = web3.eth.getBalance(accounts[2]);
				hash = 2345;
				return multiSigWallet.execute(accounts[2], 19, hash);

			}).then(function(txReceipt) {

				assert.equal(txReceipt.logs.length, 1, "There should have been one event emitted");
				assert.equal(txReceipt.logs[0].event, "SingleTransact", "First event should have been SingleTransact");

				newAccountBalance = web3.eth.getBalance(accounts[2]);
				assert.isTrue(newAccountBalance.greaterThan(accountBalance));

			})
	});

});
