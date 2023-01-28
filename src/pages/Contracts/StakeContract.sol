// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


// Defines the stake contract
contract StakeContract is Ownable {
  using SafeMath for uint256;

  // Define uma variável para armazenar o endereço do contrato ERC20 do token
  ERC20 public token;

  // Defines the event type used to record stakes
  event Stake(
    address indexed staker,
    uint256 value,
    uint256 startTime,
    uint256 endTime,
    uint256 reward
  );

  // Defines the event type used to record withdrawals
  event Withdraw(
    address indexed staker,
    uint256 value,
    uint256 reward
  );

  // Defines the event type used to record changes to the whitelist
  event WhitelistChanged(bool enabled);

  // Defines the event type used to record changes to the fee
  event FeeChanged(bool enabled, uint256 value);

  // Defines the event type used to record changes to the max period
  event MaxPeriodChanged(uint256 value);

  event PoolChanged(bool added, uint256 value);

  event StakeLockChanged(bool stakeLocked);
  event WithdrawLockChanged(bool withdrawLocked);

  event MinStakeChanged(uint256 min);
  event MaxStakeChanged(uint256 max);

  //max pool
  uint256 public avaliableStake;

  // Defines the stake fee (in BNB)
  uint256 public stakeFee;

  // Defines the withdraw fee (in BNB)
  uint256 public withdrawFee;

  // Defines the max period for the stake (in days)
  uint256 public maxPeriod;

  // Defines the current APR (in percentage)
  uint256 public apr;

  // Defines whether the whitelist is enabled or not
  bool public whitelistEnabled;

  // Defines whether the fee is enabled or not
  bool public feeEnabledStake;

  // Defines whether the fee is enabled or not
  bool public feeEnabledWithdraw;

  // Defines whether the stake function is locked or not
  bool public stakeLocked;

  // Defines whether the withdraw function is locked or not
  bool public withdrawLocked;

  // Defines the amount of tokens in the pool
  uint256 public pool;

  // Defines the address of the wallet where the fee should be sent
  address public feeWallet;

  // Defines the mapping that stores the stake information for each user
  mapping(address => StakeInfo) public stakes;

  // Defines the mapping that stores the whitelist information for each address
  mapping(address => bool) public whitelist;

  // Declare the constant for the number of seconds in a year
  uint256 public constant secondsInYear = 31536000;

  //avaliable slots
  uint256 public slots;

  uint256 public maxSlots = 600;

  uint256 public maxStake;
  uint256 public minStake;

  uint256 public removeStakeFee;
  bool public removeStakeFeeEnabled;

  uint256 public tokenTVL;

  // Defines the struct type that stores stake information for each user
  struct StakeInfo {
    uint256 amount;
    uint256 startTime;
    uint256 endTime;
    uint256 reward;
    bool inStake;
  }

    constructor(
    ERC20 _token,
    uint256 _stakeFee,
    uint256 _withdrawFee,
    uint256 _maxPeriod,
    uint256 _apr,
    uint256 _maxStake,
    uint256 _minStake,
    bool _whitelistEnabled,
    bool _feeEnabledStake,
    bool _feeEnabledWithdraw,
    address _feeWallet
  ) {
    token = _token;
    stakeFee = _stakeFee;
    withdrawFee = _withdrawFee; 
    maxPeriod = _maxPeriod;
    apr = _apr;
    whitelistEnabled = _whitelistEnabled;
    feeEnabledStake = _feeEnabledStake;
    feeEnabledWithdraw = _feeEnabledWithdraw;
    feeWallet = _feeWallet;
    maxStake = _maxStake;
    minStake = _minStake;
  }

  // Function that allows the user to stake tokens
  function stake(uint256 _value) public payable {
    require(!stakes[msg.sender].inStake, "Error: You already made a stake (to change the stake value you need to cancel your current stake)");

    require(_value >= minStake && _value <= maxStake, "Error: The value is not within the allowed range");

    require(slots <= maxSlots, "Error: Staking is not possible, the limit has been reached");

    require(!stakeLocked, "Error: Stake function is currently locked");

    require(pool > _value, "Error: there is not enough pool for you to make the stake");

    token.approve(address(this), _value);
    // Check if the user is on the whitelist (if it is enabled)
    require(!whitelistEnabled || isWhitelisted(msg.sender), "Error: User is not on the whitelist");

    // Check that the user is sending the correct amount of BNB (if the fee is enabled)
    if (feeEnabledStake) {
      require(msg.value == stakeFee, "Error: Incorrect BNB value");
    }

    if (feeEnabledStake) {
        payable(feeWallet).transfer(msg.value);
    }

    // Transfer tokens from the user to the contract
    require(token.transferFrom(msg.sender, address(this), _value), "Error: Error transferring tokens to the contract");

    // Calculate the start and end time of the stake
    uint256 startTime = block.timestamp;
    uint256 endTime = startTime.add(maxPeriod.mul(1 days));

    // Calculate the reward for the stake
    uint256 reward = calculateReward(_value, startTime, endTime);

    // Add the stake to the stakes mapping
    stakes[msg.sender] = StakeInfo(_value, startTime, endTime, reward, true);

    // Emit the Stake event
    emit Stake(msg.sender, _value, startTime, endTime, reward);

    // Update the pool
    pool = pool.add(_value);

    tokenTVL = tokenTVL.add(_value);

    slots++;
  }

  function addPool(uint256 _value) public onlyOwner {
    token.approve(address(this), _value);
    require(token.transferFrom(msg.sender, address(this), _value), "Error: Error transferring tokens to the contract");
    pool = pool.add(_value);
    emit PoolChanged(true, _value);
  }

  function removePool(uint256 _value) public onlyOwner {
      token.approve(msg.sender, _value);
      require(pool >= _value, "Error: Pool value is less than the value to remove");
      require(token.transfer(msg.sender, _value), "Error: Error transferring tokens to owner");
      pool = pool.sub(_value);
      emit PoolChanged(false, _value);
  }

  event TransferError(address indexed user, uint256 value);


  function removeStake() public payable {
    require(stakes[msg.sender].inStake == true, "Error: User does not have a stake");

    

    // Check that the user is sending the correct amount of BNB (if the fee is enabled)
    if (removeStakeFeeEnabled) {
      require(msg.value == removeStakeFee, "Error: Incorrect BNB value");
    }

    if (feeEnabledStake) {
        payable(feeWallet).transfer(msg.value);
    }

    token.approve(address(this), stakes[msg.sender].amount);
    // Transfer tokens from the user to the contract
    require(token.transferFrom(address(this), msg.sender, stakes[msg.sender].amount), "Error: Error transferring tokens to the contract");



    // Add the stake to the stakes mapping
    stakes[msg.sender] = StakeInfo(0, 0, 0, 0, false);

    // Update the pool
    pool = pool.sub(stakes[msg.sender].amount);

    tokenTVL = tokenTVL.sub(stakes[msg.sender].amount);
    
    slots--;
  }

  function setRemoveStakeFee(uint256 _removeStakeFee) public onlyOwner {
      removeStakeFee = _removeStakeFee;
  }

  function enableRemoveStakeFee() public onlyOwner {
      removeStakeFeeEnabled = true;
  }

  // Function that allows the user to withdraw tokens
  function withdraw() public payable {
    require(!withdrawLocked, "Error: Withdraw function is currently locked");
    // Get the stake info for the user
    StakeInfo storage stakeInf = stakes[msg.sender];

    // Check if the user has a stake
    require(stakeInf.amount > 0, "Error: User does not have a stake");

    // Check that the user is not withdrawing before the end time of the stake
    if(msg.sender != feeWallet){
      require(block.timestamp >= stakeInf.endTime, "Error: Cannot withdraw before the end of the stake period");
    }


    // Calculate the reward for the withdrawal
    uint256 reward = calculateReward(stakeInf.amount, stakeInf.startTime, stakeInf.endTime);

    // Check that the user is sending the correct amount of BNB (if the fee is enabled)
    if (feeEnabledWithdraw) {
      require(msg.value == withdrawFee, "Error: Incorrect BNB value");
      payable(feeWallet).transfer(msg.value);
    }

    token.approve(address(this), reward + stakes[msg.sender].amount);
    // Send the reward to the user
    require(token.transferFrom(address(this), msg.sender, reward + stakes[msg.sender].amount), "Error: Error transferring tokens to the contract");

    // Update the stake info
    stakeInf.amount = 0;
    stakeInf.reward = 0;
    stakeInf.startTime = 0;

    // Check if the user has withdrawn all of their stake
    if (stakeInf.amount == 0) {
        stakeInf.inStake = false;
        slots--;
    }
    avaliableStake = avaliableStake.sub(stakeInf.amount);

    tokenTVL = tokenTVL.sub(stakeInf.amount);

    // Emit the Withdraw event
    emit Withdraw(msg.sender, stakeInf.amount, reward);
}

  function getStaked (address _wallet) public view returns(uint256){
        StakeInfo storage stakeInf = stakes[_wallet];
        return stakeInf.amount;
  }

  function verifyInStakeStake (address _wallet) public view returns(bool){
        StakeInfo storage stakeInf = stakes[_wallet];
        return stakeInf.inStake;
  }


  function multiAddWhitelist(address[] memory wallets) external onlyOwner {
        require(wallets.length < 600, "Can only airdrop 600 wallets per txn due to gas limits");
        for(uint256 i = 0; i < wallets.length; i++){
            whitelist[wallets[i]] = true;
        }
  }

  function multiRemoveWhitelist(address[] memory wallets) external onlyOwner {
        require(wallets.length < 600, "Can only airdrop 600 wallets per txn due to gas limits");
        for(uint256 i = 0; i < wallets.length; i++){
            whitelist[wallets[i]] = false;
        }
  }

  // Function that allows the owner to remove an address from the whitelist
  function removeFromWhitelist(address _user) public onlyOwner {
    delete whitelist[_user];
    emit WhitelistChanged(whitelistEnabled);
  }

  // Function that enables/disables the whitelist
  function setWhitelistEnabled(bool _enabled) public onlyOwner {
    whitelistEnabled = _enabled;
    emit WhitelistChanged(_enabled);
  }

  // Function that enables/disables the fee
  function setFeeEnabledStake(bool _enabled) public onlyOwner {
    feeEnabledStake = _enabled;
    emit FeeChanged(_enabled, stakeFee);
  }

  // Function that enables/disables the fee
  function setFeeEnabledWithdraw(bool _enabled) public onlyOwner {
    feeEnabledWithdraw = _enabled;
    emit FeeChanged(_enabled, withdrawFee);
  }

  // Function that allows the owner to set the early withdrawal fee
  function setStakeFee(uint256 _value) public onlyOwner {
    stakeFee = _value;
    emit FeeChanged(feeEnabledStake, _value);
  }

  
  function toggleStakeLock() public onlyOwner {
      stakeLocked = !stakeLocked;
      emit StakeLockChanged(stakeLocked);
  }

  function toggleWithdrawLock() public onlyOwner {
      withdrawLocked = !withdrawLocked;
      emit WithdrawLockChanged(withdrawLocked);
  }

  function setMaxSlots(uint256 _maxSlots) public onlyOwner {
        maxSlots = _maxSlots;
    }

    function setMaxStake(uint256 _maxStake) public onlyOwner {
        maxStake = _maxStake;
    }

    function setMinStake(uint256 _minStake) public onlyOwner {
        minStake = _minStake;
    }

    
    function setContract(ERC20 _token) public onlyOwner {
        token = _token;
    }


   // Function that allows the owner to set the early withdrawal fee
  function setWithdrawFee(uint256 _value) public onlyOwner {
    withdrawFee = _value;
    emit FeeChanged(feeEnabledWithdraw, _value);
  }


  // Function that allows the owner to set the max period
  function setMaxPeriod(uint256 _value) public onlyOwner {
    maxPeriod = _value;
    emit MaxPeriodChanged(_value);
  }

  // Function that allows the owner to set the APR
  function setAPR(uint256 _value) public onlyOwner {
    apr = _value;
  }

  function setFeeWallet(address _feeWallet) public onlyOwner {
    feeWallet = _feeWallet;
  }

  // Function that calculates the reward for a stake/withdrawal
  function calculateReward(uint256 _value, uint256 _startTime, uint256 _endTime) public view returns (uint256) {
    StakeInfo storage stakeInf = stakes[msg.sender];

    if(_value == 0){
      _value = stakeInf.amount;
    }

    if(_startTime == 0){
      _startTime = stakeInf.startTime;
    }

    if(_endTime == 0){
      _endTime = block.timestamp;
    }

   

    // Calculate the elapsed time (in seconds)
    uint256 elapsedTime = _endTime - _startTime;

     uint256 maxDays = maxPeriod * 86400;

    if(elapsedTime > maxDays){
      elapsedTime = maxDays;
    }
    // Calculate the elapsed time (in seconds) divided by the number of seconds in a year
    // and multiply by the annual percentage rate (APR)
    // Use the safe math library to prevent overflow
    return (_value.mul(elapsedTime).div(secondsInYear).mul(apr)).div(100);
  }

   function stakedTime(address _sender) public view returns (uint256) {
    StakeInfo storage stakeInf = stakes[_sender];
   

    // Calculate the elapsed time (in seconds)
    uint256 elapsedTime = block.timestamp - stakeInf.startTime;

     uint256 maxDays = maxPeriod * 86400;

    if(elapsedTime > maxDays){
      elapsedTime = maxDays;
    }
    // Calculate the elapsed time (in seconds) divided by the number of seconds in a year
    // and multiply by the annual percentage rate (APR)
    // Use the safe math library to prevent overflow
    return elapsedTime;
  }

  function isWhitelisted(address _user) public view returns (bool) {
    return whitelist[_user];
  }

  function getStartTime(address _sender) public view returns (uint256) {
    StakeInfo storage stakeInf = stakes[_sender];

    return  stakeInf.startTime;
  }

  function canWithdraw(address _sender) public view returns (bool) {
    StakeInfo storage stakeInf = stakes[_sender];

    return  block.timestamp >= stakeInf.endTime;
  }
}