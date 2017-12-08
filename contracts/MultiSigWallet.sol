pragma solidity 0.4.18;

contract MultiSigWallet {

    // Events
    event Confirmation(address indexed sender, uint indexed transactionId);
    event Revocation(address indexed sender, uint indexed transactionId);
    event Submission(uint indexed transactionId);
    event Execution(uint indexed transactionId);
    event ExecutionFailure(uint indexed transactionId);
    event Deposit(address indexed sender, uint value);
    event OwnerAddition(address indexed owner);
    event OwnerRemoval(address indexed owner);
    event RequirementChange(uint required);

    // Storage

    mapping (uint => Transaction) public transactions;
    mapping (uint => mapping (address => bool)) public confirmations;
    mapping (address => bool) public isOwner;
    address[] public owners;
    uint public required;
    uint public transactionCount;

    struct Transaction {
        address destination;
        uint value;
        bytes data;
        bool executed;
    }

    // Modifiers
    modifier ownerDoesNotExist(address owner) {
        require(isOwner[owner]);
        _;
    }
    modifier ownerExists(address owner) {
        require(isOwner[owner]);
        _;
    }
    modifier transactionExists(uint transactionId) {
        require(transactions[transactionId].destination != 0);
        _;
    }
    modifier confirmed(uint transactionId, address owner) {
        require(confirmations[transactionId][owner]);
        _;
    }
    modifier notConfirmed(uint transactionId, address owner) {
        require(!confirmations[transactionId][owner]);
        _;
    }
    modifier notExecuted(uint transactionId) {
        require(!transactions[transactionId].executed);
        _;
    }
    modifier notNull(address _address) {
        require(_address != 0);
        _;
    }

    // Fallback function allows to deposit ether
    function () payable {
        if (msg.value > 0)
            Deposit(msg.sender, msg.value);
    }

    // Constructor
    function MultiSigWallet(address[] _owners, uint _required) public {
        require(_owners.length >= _required && _required != 0 && _owners.length != 0);
        for (uint i=0; i<_owners.length; i++) {
            require(!isOwner[_owners[i]] && _owners[i] != 0);
            isOwner[_owners[i]] = true;
        }
        owners = _owners;
        required = _required;
    }

    // Public functions

    function addOwner(address owner) public notNull(owner) ownerDoesNotExist(owner) {

    }

    function removeOwner(address owner) public {

    }

    function changeRequirement(uint _required) public {

    }

    function submitTransaction(address destination, uint value) public returns (uint transactionId) {

    }

    function confirmTransaction(uint transactionId) public {

    }

    function revokeConfirmation(uint transactionId) public {

    }

    function executeTransaction(uint transactionId) public {

    }

    // Internal functions
    function addTransaction(address destination, uint value, bytes data) internal notNull(destination) returns (uint transactionId) {
        transactionId = transactionCount;
        transactions[transactionId] = Transaction({
            destination: destination,
            value: value,
            data: data,
            executed: false
        });
        transactionCount += 1;
        Submission(transactionId);
    }

}