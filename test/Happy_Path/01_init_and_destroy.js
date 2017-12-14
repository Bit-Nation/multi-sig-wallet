let MultiSigWallet = artifacts.require('./MultiSigWallet.sol');

contract('MultiSig Wallet Init and destroy testing', accounts => {

	let multisigWallet = {};

	it('Should be able initialize the wallet with 10 ether', function() {
		return MultiSigWallet.new([accounts[0], accounts[1], accounts[2]], 2, 10)
			.then(function(impl) {
				multisigWallet = impl;
				return web3.eth.sendTransaction({from: accounts[0], to: multisigWallet.address, value: web3.toWei('10', 'ether')});
			}).then(function(txReceipt) {
				let walletBalance = web3.eth.getBalance(multisigWallet.address);

				assert.equal(walletBalance, web3.toWei('10', 'ether'), "Wallet address should have 10 ether");
			})
	});

	it('Should be able to receive ether after death', function() {
		let ownerBalance = web3.eth.getBalance(accounts[0]);
		let walletBalance = web3.eth.getBalance(multisigWallet.address);
		let hash = 1234;

		return multisigWallet.destroy(accounts[0], {data: hash})
			.then(function(txReceipt) {
				return multisigWallet.destroy(accounts[0], {from: accounts[1], data: hash});
			}).then(function(txReceipt) {
				let newOwnerBalance = web3.eth.getBalance(accounts[0]);
				let newWalletBalance = web3.eth.getBalance(multisigWallet.address);

				assert.isTrue(newOwnerBalance > ownerBalance);
				assert.isTrue(newWalletBalance < walletBalance);
			})
	});

});