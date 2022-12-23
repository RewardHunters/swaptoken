// SPDX-License-Identifier: MIT                                                                               
                                                    
pragma solidity 0.8.13;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol";

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        this; // silence state mutability warning without generating bytecode - see https://github.com/ethereum/solidity/issues/2691
        return msg.data;
    }
}

contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    constructor () {
        address msgSender = _msgSender();
        _owner = msgSender;
        emit OwnershipTransferred(address(0), msgSender );
    }

    function owner() public view returns (address) {
        return _owner;
    }

    modifier onlyOwner() {
        require(_owner == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    function renounceOwnership() external virtual onlyOwner {
        emit OwnershipTransferred(_owner, address(0));
        _owner = address(0);
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }
}

interface AggregatorV3Interface {
  function decimals() external view returns (uint8);

  function description() external view returns (string memory);

  function version() external view returns (uint256);

  function getRoundData(uint80 _roundId)
    external
    view
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    );

  function latestRoundData()
    external
    view
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    );
}

library SafeMath {



    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return a - b;
    }


    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        return a * b;
    }


    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return a / b;
    }


    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        return a % b;
    }


    function sub(
        uint256 a,
        uint256 b,
        string memory errorMessage
    ) internal pure returns (uint256) {
        unchecked {
            require(b <= a, errorMessage);
            return a - b;
        }
    }


    function div(
        uint256 a,
        uint256 b,
        string memory errorMessage
    ) internal pure returns (uint256) {
        unchecked {
            require(b > 0, errorMessage);
            return a / b;
        }
    }


    function mod(
        uint256 a,
        uint256 b,
        string memory errorMessage
    ) internal pure returns (uint256) {
        unchecked {
            require(b > 0, errorMessage);
            return a % b;
        }
    }
}


contract RHTSwap is Ownable {
    IERC20 _token;
    AggregatorV3Interface internal priceFeed;
    using SafeMath for uint256;

    uint256 public priceToken = 3200000000000000;
    IERC20 busd;
    address ownerReceive;

    constructor(address token) {
        _token = IERC20(token);
        busd = IERC20(0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56);
        ownerReceive = 0x934A67c2Ebe06212Ed85Ee3143723Cf1C340D930;
        priceFeed = AggregatorV3Interface(0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE);//Testnet: 0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526 Mainnet: 0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE
    }

    function buyToken(uint256 amountInBUSD) public payable{
        // require(msg.value >= getPriceNFT(amountInBUSD), "The amount in BNB sent is not valid");
        uint256 amountSend = amountInBUSD / priceToken;
        uint256 amountHaveBalance = amountSend * 10 ** 18;
        require(amountSend <= _token.balanceOf(address(this)), "There are not enough funds to make this transfer");

        fowardFunds(amountInBUSD);

        transferBuyedToken(msg.sender, amountHaveBalance);
    }

    function fowardFunds(uint256 bAmount) private {
        require(ownerReceive != address(0), "Cannot be shipped to dead address");
        IERC20(busd).transferFrom(_msgSender(), address(ownerReceive), bAmount);
    }

    
    function transferBuyedToken(address to, uint amount) internal {
        _token.approve(address(this), amount);
        
        require(_token.allowance(address(this), address(this)) >= amount);
        _token.transferFrom(address(this), to, amount);
    }

    function removeSupply(uint amount) public onlyOwner {
        transferBuyedToken(msg.sender,amount);
    }
    

    function getPriceNFT (uint256 _price) public view returns(uint){
        uint256 bnb = 1 * 10 ** 18;
        uint256 bnbUSD = getLatestPrice();
        uint priceMint = _price;

        return bnb.mul(priceMint).div(bnbUSD) ;
    }

    function getSupply () public view returns(uint256){
        return _token.balanceOf(address(this));
    }


    function setAggregatorWallet (AggregatorV3Interface _contract) public onlyOwner(){
        priceFeed = AggregatorV3Interface(_contract); //Testnet: 0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526 Mainnet: 0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE
    }

    function setTokenPrice (uint256 value) public onlyOwner(){
       priceToken = value;
    }

    function setTokenContract (address value) public onlyOwner(){
       IERC20(value);
    }


    function getLatestPrice() public view returns (uint256) {
        (
            /*uint80 roundID*/,
            int price,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();
        return uint256(int(price));
    }

    
}