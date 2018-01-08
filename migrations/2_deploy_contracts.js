const MultiSigWallet = artifacts.require('MultiSigWallet.sol');

module.exports = deployer => {
	const args = process.argv.slice();
	// console.log(args.length);
	// console.log(args);
	if (args.length < 5) {
		console.error("MultiSig wallet needs to pass owner list and the number of required confirmations");
	} else if (args.length < 6) {
		deployer.deploy(MultiSigWallet, args[3].split(","), args[4], args[5])
	}
	// deployer.deploy(MultiSigWallet)
};

// To migrate to network, run truffle migrate account1,account2,account3 requiredConfirmations
// eg.
// truffle migrate "0x1","0x2" 2
