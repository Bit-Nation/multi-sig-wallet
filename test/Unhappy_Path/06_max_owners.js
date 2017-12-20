let MultiSigWallet = artifacts.require('./MultiSigWallet.sol');

contract('MultiSig Wallet too many required testing', accounts => {

	it('Should fail when initializing the wallet with numaccounts = numrequired', function() {
		return MultiSigWallet.new([accounts[0], accounts[1], accounts[2]], 3, 10)
			.then(assert.fail)
			.catch(function(error) {
				assert(error.message.indexOf('assert') >= 0, "error should be assert");
			})
	});

});
