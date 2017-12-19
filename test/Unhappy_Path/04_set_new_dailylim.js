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
		let hash = 1234;
		let newDailyLim = 20;

		// Do a normal withdrawal first
		return multiSigWallet.setDailyLimit(newDailyLim, {from: accounts[0], data: '123'})
			.then(function(txReceipt) {

				// Make sure the correct events fired
				assert.equal(txReceipt.logs.length, 1, "There should have been one event emitted");
				assert.equal(txReceipt.logs[0].event, "Confirmation", "First event should have been Confirmation");

				// Try to withdraw tokens with just one confirmation for setDailyLimit
				return multiSigWallet.execute(accounts[2], 19, hash);

			}).then(function(txReceipt) {

				// Should've failed to just single transact the execution, and additional confirmations will be needed

				assert.equal(txReceipt.logs.length, 2, "There should have been one event emitted");
				assert.equal(txReceipt.logs[0].event, "Confirmation", "First event should have been Confirmation");
				assert.equal(txReceipt.logs[1].event, "ConfirmationNeeded", "Second event should have been ConfirmationNeeded");

			})
	});

});
