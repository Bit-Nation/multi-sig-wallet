let MultiSigWallet = artifacts.require('./MultiSigWallet.sol');

contract('MultiSig Wallet request and confirm without sufficient approvals', accounts => {

	let multisigWallet = {};
	let dailyLim = 10;
	let numConfirms = 2;

	before(function() {
		return MultiSigWallet.new([accounts[0], accounts[1], accounts[2]], numConfirms, dailyLim)
			.then(function(instance) {
				multisigWallet = instance;
				return web3.eth.sendTransaction({from: accounts[0], to: multisigWallet.address, value: web3.toWei('1', 'ether')});
			})
	});

	it('should fail to execute if non-owners try to confirm', function() {
		let accountBalance = web3.eth.getBalance(accounts[2]);
		let newAccountBalance;
		let hash = 1234;

		// Request 20 wei to account[2]
		return multisigWallet.execute(accounts[2], 20, hash, {from: accounts[0]})
			.then(function(txReceipt) {
				// Make sure the correct events fired
				assert.equal(txReceipt.logs.length, 2, "There should have been two events emitted");
				assert.equal(txReceipt.logs[0].event, "Confirmation", "First event should have been Confirmation");
				assert.equal(txReceipt.logs[1].event, "ConfirmationNeeded", "Second event should have been confirmation needed");

				// Make sure the balances did not change
				newAccountBalance = web3.eth.getBalance(accounts[2]);
				assert.equal(newAccountBalance.toNumber(), accountBalance.toNumber());
				accountBalance = newAccountBalance;

				let operation = txReceipt.logs[1].args.operation;

				// Confirm the operation from account[1]
				return multisigWallet.confirm(operation, {from: accounts[3]});
			})
			.then(assert.fail)
			.catch(function(error) {
				assert(error.message.indexOf('revert') >= 0, "error should be revert");
			})
	})

});