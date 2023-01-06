import { useEffect, useMemo, useReducer, useState } from "react";
import "./Style.scss";
import Stake from "./Stake";
import { ethers } from "ethers";
import { StakeABI } from "./Contracts/StakeABI";
import { RHTABI } from "./Contracts/RHTABI";
import Swal from 'sweetalert2';

type StakeType = "simple" | "prime" | "legacy";

export default function StakePage({statusConnect, stakeAddress, aprStakeSimple, aprStakePrime, aprStakeLegacy}:{statusConnect: string; stakeAddress: string; aprStakeSimple: string; aprStakePrime: string; aprStakeLegacy: string;}) {
  const [StakedSimple, setStakedSimple] = useState("");
  const [AvaliableSimple, setAvaliableSimple] = useState(0);
  const [maxSimpleStake, setMaxSimpleStake] = useState(0);
  const [amountSimple, setAmountSimple] = useState(0);


  const [StakedPrime, setStakedPrime] = useState("");
  const [AvaliablePrime, setAvaliablePrime] = useState(300);
  const [amountPrime, setAmountPrime] = useState(0);
  const [maxPrimeStake, setMaxPrimeStake] = useState(0);


  const [StakedLegacy, setStakedLegacy] = useState("");
  const [AvaliableLegacy, setAvaliableLegacy] = useState(300);
  const [amountLegacy, setAmountLegacy] = useState(0);
  const [maxLegacyStake, setMaxLegacyStake] = useState(0);
  const [activeBNB, setActiveBNB] = useState(false);


  const [approved, setApproved] = useState(false);
  const [loadingApproving, setLoadingApproving] = useState(false);

  const [simplePricesBnb, setSimplePricesBnb] = useState(0);
  const [primePricesBnb, setPrimePricesBnb] = useState(0);
  const [legacyPricesBnb, setLegacyPricesBnb] = useState(0);

  const [userSimpleInStaked, setUserSimpleInStaked] = useState(false);
  const [userPrimeInStaked, setUserPrimeInStaked] = useState(false);
  const [userLegacyInStaked, setUserLegacyInStaked] = useState(false);

  const [rewardsSimple, setRewardsSimple] = useState("0");
  const [rewardsPrime, setRewardsPrime] = useState("0");
  const [rewardsLegacy, setRewardsLegacy] = useState("0");

  const [timingSimpleReward, setTimingSimpleReward] = useState("");
  const [timingPrimeReward, setTimingPrimeReward] = useState("");
  const [timingLegacyReward, setTimingLegacyReward] = useState("");

  const [verifyVestingSimple, setVerifyVestingSimple] = useState(false);
  const [verifyVestingPrime, setVerifyVestingPrime] = useState(false);
  const [verifyVestingLegacy, setVerifyVestingLegacy] = useState(false);
  
  const [tvlSimple, setTvlSimple] = useState("0");
  const [tvlPrime, setTvlPrime] = useState("0");
  const [tvlLegacy, setTvlLegacy] = useState("0");

  const RHTToken = "0xC315a7E34572A9C3858428187aB10813Ac3420C8";


  useEffect(() => {

    verifyApprove();

    //Simple
    getAmountStakedSimple();
    getAvaliableSimple();
    infosStakeSimple();
    timeStakedSimple();


    //Prime
       
    getAmountStakedPrime();
    getAvaliablePrime();
    infosStakePrime();
    timeStakedPrime();


    //Legacy
    getAmountStakedLegacy();
    getAvaliableLegacy();
    infosStakeLegacy();
    timeStakedLegacy();

    // getAllTvl();
  }, [stakeAddress]);
  



      
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const wallet = signer.getAddress();
  const stakeContract = new ethers.Contract(stakeAddress, StakeABI, signer);

  //functions simple
  const getAmountStakedSimple = async () => {


    const valueStaked = await stakeContract.getStakedSimple(wallet);
    let convertValue = parseInt(valueStaked) / 10 ** 18;
    setStakedSimple(convertValue.toString());
    
    const userInStake = await stakeContract.verifySimpleStake(wallet);

    setUserSimpleInStaked(userInStake);

   

  };

  async function getAllTvl() {
    const simpleTvl = await stakeContract.totalSimpleStaked();
    setTvlSimple((parseInt(simpleTvl) / 10 ** 18).toString());

    const primeTvl = await stakeContract.totalPrimeStaked();
    setTvlPrime((parseInt(primeTvl) / 10 ** 18).toString());
    
    const legacyTvl = await stakeContract.totalLegacyStaked();
    setTvlLegacy((parseInt(legacyTvl) / 10 ** 18).toString());
  }

  async function getAvaliableSimple() {
    const countersBalanace = await stakeContract.counterBalance(stakeAddress);
    const simpleStakeLimit = await stakeContract.simpleStakeLimit();
    let totalAvaliable = parseInt(simpleStakeLimit) - parseInt(countersBalanace.counterSimple);
    setAvaliableSimple(totalAvaliable);
  }

  async function infosStakeSimple() {

    const maxStake = await stakeContract.maxSimpleRHT();
    setMaxSimpleStake(parseInt(maxStake));

    const bnb = await stakeContract.priceBNBSimpleStake();
    setSimplePricesBnb(parseInt(bnb));

    const isBnb = await stakeContract.isBNB();
    setActiveBNB(isBnb);
  }

  async function timeStakedSimple() {
    
    const reward = await stakeContract.lastRewardUpdateSimpleStake(wallet);

    setRewardsSimple((reward / 10 ** 18).toFixed(2).toString());

    const inStakeTime = await stakeContract.verifyVestingTimeSimple(wallet);
    let canWithdraw = parseInt(inStakeTime) <= 0 ? false : true;

    setVerifyVestingSimple(canWithdraw);


    const start = await stakeContract.simpleStake(wallet);

    if(parseInt(start.startBlock))
     updateTimer(parseInt(start.startBlock), (value: string)=>{
      setTimingSimpleReward(value);
     });
  }


  //end functions simple

  


  function updateTimer(startTimestamp: number, cb: Function) {
    let currentTimestamp = Math.floor(Date.now() / 1000);
    let elapsedTime = currentTimestamp - startTimestamp;
    let days = Math.floor(elapsedTime / 86400);  // 86400 segundos em 1 dia
    elapsedTime = elapsedTime % 86400;
    let hours = Math.floor(elapsedTime / 3600).toString().padStart(2, '0');
    elapsedTime = elapsedTime % 3600;
    let minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
    let seconds = (elapsedTime % 60).toString().padStart(2, '0');

    // Mostra os dias apenas quando há 1 ou mais dias
    let timeString = '';
    if (days > 0) {
      timeString += `${days} days `;
    }
    timeString += `${hours}:${minutes}:${seconds}`;

    setTimeout(() => {
      updateTimer(startTimestamp, cb);
      cb(timeString);
    }, 1000);
  }

  //Functions Prime

  const getAmountStakedPrime = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const wallet = signer.getAddress();

    const stake = new ethers.Contract(stakeAddress, StakeABI, signer);
    const valueStaked = await stake.getStakedPrime(wallet);
    let convertValue = parseInt(valueStaked) / 10 ** 18;
    setStakedPrime(convertValue.toString());


    const userInStake = await stake.verifyPrimeStake(wallet);

    setUserPrimeInStaked(userInStake);
  };

  async function getAvaliablePrime() {
    const countersBalanace = await stakeContract.counterBalance(stakeAddress);
    const primeStakeLimit = await stakeContract.primeStakeLimit();
    let totalAvaliable = parseInt(primeStakeLimit) - parseInt(countersBalanace.counterPrime);
    setAvaliablePrime(totalAvaliable);
  }

  async function infosStakePrime() {

    const maxStake = await stakeContract.maxPrimeRHT();
    setMaxPrimeStake(parseInt(maxStake));

    const bnb = await stakeContract.priceBNBPrimeStake();
    setPrimePricesBnb(parseInt(bnb));

    const isBnb = await stakeContract.isBNB();
    setActiveBNB(isBnb);
  }

  async function timeStakedPrime() {
    
    const reward = await stakeContract.lastRewardUpdatePrimeStake(wallet);

    setRewardsPrime((reward / 10 ** 18).toFixed(2).toString());

    const inStakeTime = await stakeContract.verifyVestingTimePrime(wallet);
    let canWithdraw = parseInt(inStakeTime) <= 0 ? false : true;

    setVerifyVestingPrime(canWithdraw);


    const start = await stakeContract.primeStake(wallet);

    if(parseInt(start.startBlock))
     updateTimer(parseInt(start.startBlock), (value: string)=>{
      setTimingPrimeReward(value);
     });
  }


  //end functions prime


  // Functions Legacy
  const getAmountStakedLegacy = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const wallet = signer.getAddress();

    const stake = new ethers.Contract(stakeAddress, StakeABI, signer);
    const valueStaked = await stake.getStakedLegacy(wallet);
    let convertValue = parseInt(valueStaked) / 10 ** 18;
    setStakedLegacy(convertValue.toString());


    const userInStake = await stake.verifyLegacyStake(wallet);

    setUserLegacyInStaked(userInStake);

  };


  async function getAvaliableLegacy() {
    const countersBalanace = await stakeContract.counterBalance(stakeAddress);
    const legacyStakeLimit = await stakeContract.legacyStakeLimit();
    let totalAvaliable = parseInt(legacyStakeLimit) - parseInt(countersBalanace.counterLegacy);
    setAvaliableLegacy(totalAvaliable);
  }

  async function infosStakeLegacy() {

    const maxStake = await stakeContract.maxLegacyRHT();
    setMaxLegacyStake(parseInt(maxStake));

    const bnb = await stakeContract.priceBNBLegacyStake();
    setLegacyPricesBnb(parseInt(bnb));

    const isBnb = await stakeContract.isBNB();
    setActiveBNB(isBnb);
  }

  async function timeStakedLegacy() {
    
    const reward = await stakeContract.lastRewardUpdateLegacyStake(wallet);

    setRewardsLegacy((reward / 10 ** 18).toFixed(2).toString());

    const inStakeTime = await stakeContract.verifyVestingTimeLegacy(wallet);
    let canWithdraw = parseInt(inStakeTime) <= 0 ? false : true;

    setVerifyVestingLegacy(canWithdraw);


    const start = await stakeContract.legacyStake(wallet);

    if(parseInt(start.startBlock))
     updateTimer(parseInt(start.startBlock), (value: string)=>{
      setTimingLegacyReward(value);
     });
  }



  //end functions legacy


  const approveToken = async () => {
    try {
      setLoadingApproving(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const RHT = new ethers.Contract(RHTToken, RHTABI, signer);
      const transation = await RHT.approve(
        stakeAddress,
        "500000000000000000000000"
      );

      await transation.wait().then(() => {
        setApproved(true);
        setLoadingApproving(false);
      });
    } catch (error) {
      setApproved(false);
      setLoadingApproving(false);
    }
  };



  const verifyApprove = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const wallet = signer.getAddress();
    const RHT = new ethers.Contract(RHTToken, RHTABI, signer);
    const value = await RHT.allowance(wallet, stakeAddress);
    console.log(parseInt(value.toString()) );

    if (parseInt(value.toString()) >= 50000000000000000000000) {
      setApproved(true);
    } else {
      setApproved(false);
    }
  };


  

  //Stake Section
 async function stake(option: 'simpleStakeLaunch' | 'primeStakeLaunch' | 'legacyStakeLaunch', value: number): Promise<void> {


  if (value <= 0) {
    throw new Error('Invalid value');
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const stakeContract = new ethers.Contract(stakeAddress, StakeABI, signer);

  const valueInWei = ethers.utils.parseEther((value).toString());

  let tx;

  let amountBnb = 0;



  if(activeBNB){
     if(option == "simpleStakeLaunch"){
      amountBnb = simplePricesBnb;
    }else if(option == "primeStakeLaunch"){
      amountBnb = primePricesBnb;
    }else if(option == "legacyStakeLaunch"){
      amountBnb = legacyPricesBnb;
    }
  }
  
  console.log("amountBnb", amountBnb);

  Swal.fire({
    title: 'Please wait...',
    icon: 'info',
    showConfirmButton: false,
    allowEscapeKey: false,
    timer: 10000,
  });


  try {
    tx = await stakeContract[option](valueInWei, {value: amountBnb});
  } catch (error:any) {
    console.log(error);

    Swal.fire({
      icon: 'error',
      title: 'Oops... ❌',
      text: `Something went wrong while launching the stake. ${error.message} Please try again. ❌`,
    });
    return;
  }

  console.log(`Transaction hash: ${tx.hash}`);
  Swal.fire({
    icon: 'success',
    title: 'Stake launched! ✅',
    text: `Your stake has been launched with transaction hash: ${tx.hash} ✅ \n Wait for the transaction to finish and restart the page to check your stake`,
  });
}


async function withdrawStakeRewards(
  stakeType: StakeType
): Promise<void> {
  // Show a loading alert
  Swal.fire({
    title: "Processing...",
    text: "Please wait while we withdraw your rewards.",
    icon: "info",
    allowOutsideClick: false,
  });

   let amountBnb = 0;



    if(activeBNB){
      if(stakeType == "simple"){
        amountBnb = simplePricesBnb;
      }else if(stakeType == "prime"){
        amountBnb = primePricesBnb;
      }else if(stakeType == "legacy"){
        amountBnb = legacyPricesBnb;
      }
    }
    

  try {
    // Call the appropriate function based on the stakeType
    let tx: ethers.providers.TransactionResponse;
    if (stakeType === "simple") {
      tx = await stakeContract.withdrawRewardSimpleStake(wallet,  {value: amountBnb});
    } else if (stakeType === "prime") {
      tx = await stakeContract.withdrawRewardPrimeStake(wallet,  {value: amountBnb});
    } else if (stakeType === "legacy") {
      tx = await stakeContract.withdrawRewardLegacyStake(wallet,  {value: amountBnb});
    } else {
      throw new Error("Invalid stake type");
    }

    // Wait for the transaction to be mined
    await tx.wait();

    // Show a success alert
    Swal.fire({
      title: "Success!",
      text: "Your rewards have been withdrawn. 🎉",
      icon: "success",
    });
  } catch (error) {
    console.log("error", error);
    // Show an error alert
    Swal.fire({
      title: "Error",
      text: "There was an error withdrawing your rewards. 😞",
      icon: "error",
    });
  }
}

  

  return (
    <div className="Container_StakePage">
      <section className="sectionb_stake" id="sectionb_stake">
        <Stake
          amountToStake={amountSimple}
          loadingApproving={loadingApproving}
          rewards={rewardsSimple}
          timing={timingSimpleReward}
          inStake={userSimpleInStaked}
          canWithdraw={verifyVestingSimple}
          approve={() => {
            approveToken();
          }}
          withdraw={() => {
            if(verifyVestingSimple == true && userSimpleInStaked == true){
              withdrawStakeRewards("simple");
            }
          }}
          approved={approved}
          onChange={(e: number) => {
            setAmountSimple(e);
          }}
          title="Stake Classic"
          setAmountToMax={() => {
            setAmountSimple(maxSimpleStake);
          }}
          startStake={()=>{
            stake("simpleStakeLaunch", amountSimple);
          }}
          apr="8%"
          staked={StakedSimple}
          totalToStake={AvaliableSimple}
          period="1 month"
          tvl={tvlSimple}
        />
        <Stake
          amountToStake={amountPrime}
          loadingApproving={loadingApproving}
          rewards={rewardsPrime}
          canWithdraw={verifyVestingPrime}
          timing={timingPrimeReward}
          inStake={userPrimeInStaked}
          approve={() => {
            approveToken();
          }}
          withdraw={() => {
            if(verifyVestingPrime == true && userPrimeInStaked == true){
              withdrawStakeRewards("prime");
            }
          }}
          startStake={()=>{
            stake("primeStakeLaunch", amountPrime);
          }}
          approved={approved}
          onChange={(e:number) => {setAmountPrime(e)}}
          title="Stake Premium"
          setAmountToMax={() => {
            setAmountPrime(maxPrimeStake);
          }}
          apr={aprStakePrime}
          staked={StakedPrime}
          totalToStake={AvaliablePrime}
          period="1 month"
          tvl={tvlPrime}
        />
        <Stake
          amountToStake={amountLegacy}
          loadingApproving={loadingApproving}
          rewards={rewardsLegacy}
          canWithdraw={verifyVestingLegacy}
          timing={timingLegacyReward}
          inStake={userLegacyInStaked}
          approve={() => {
            approveToken();
          }}
          withdraw={() => {
           if(verifyVestingLegacy == true && userLegacyInStaked == true){
              withdrawStakeRewards("legacy");
            }
          }}
          startStake={()=>{
            stake("legacyStakeLaunch", amountLegacy);
          }}
          approved={approved}
          onChange={(e:number) => {setAmountLegacy(e)}}
          title="Stake Legacy"
          setAmountToMax={() => {
            setAmountLegacy(maxLegacyStake);
          }}
          apr={aprStakeLegacy}
          staked={StakedLegacy}
          totalToStake={AvaliableLegacy}
          period="1 month"
          tvl={tvlLegacy}
        />
      </section>
    </div>
  );
}
