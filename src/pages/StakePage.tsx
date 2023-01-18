import { useEffect, useMemo, useReducer, useState } from "react";
import "./Style.scss";
import Stake from "./Stake";
import { ethers } from "ethers";
import { StakeABI } from "./Contracts/StakeABI";
import { RHTABI } from "./Contracts/RHTABI";
import Swal from 'sweetalert2';

type StakeType = "simple" | "prime" | "legacy";

export default function StakePage({statusConnect, stakeAddress, type, period}:{statusConnect: string; stakeAddress: string, type: string, period: string}) {


  const [Staked, setStaked] = useState("");
  const [avaliableStake, setAvaliableStake] = useState(300);
  const [amountStake, setAmountStake] = useState(0);
  const [maxStake, setMaxStake] = useState(0);

  const [approved, setApproved] = useState(false);
  const [loadingApproving, setLoadingApproving] = useState(false);

  const [pricesBnb, setPricesBnb] = useState(0);
  const [activeBNB, setActiveBNB] = useState(0);

  const [userInStake, setUserInStake] = useState(false);

  const [whitelisted, setWhitelisted] = useState(false);
  const [whitelist, setWhitelist] = useState(false);

  const [rewardsLegacy, setRewardsLegacy] = useState("0");

  const [timingLegacyReward, setTimingLegacyReward] = useState("");

  const [canWithdraw, setCanWithdraw] = useState(false);
  
  const [tvlLegacy, setTvlLegacy] = useState("0");

  const [currentAPR, setCurrentAPR] = useState("");

  const [balanceRHT, setBalanceRHT] = useState(0);

  const RHTToken = "0xC315a7E34572A9C3858428187aB10813Ac3420C8";


  useEffect(() => {

    verifyApprove();


    //Legacy
    getAmountStaked();
    getAvaliable();
    infosStake();
    timeStaked();
    getBalanceRHT();

  }, [stakeAddress]);
  



      
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const wallet = signer.getAddress();
  const stakeContract = new ethers.Contract(stakeAddress, StakeABI, signer);



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

 
  const getBalanceRHT = async () => {
    const RHTContract = new ethers.Contract(RHTToken, RHTABI, signer);

    const balance = await RHTContract.balanceOf(wallet);

    setBalanceRHT(parseInt(balance) / 10 ** 18);
  }


  // Functions Legacy
  const getAmountStaked = async () => {
    const valueStaked = await stakeContract.getStaked(wallet);
    let convertValue = parseInt(valueStaked) / 10 ** 18;
    setStaked(convertValue.toString());


    const userInStake = await stakeContract.verifyInStakeStake(wallet);

    console.log("userInStake", userInStake);

    setUserInStake(userInStake);

  };


  async function getAvaliable() {
    const countersBalanace = await stakeContract.slots();
    console.log("countersBalanace", countersBalanace)
    const stakeLimit = await stakeContract.maxSlots();
    let totalAvaliable = parseInt(stakeLimit) - parseInt(countersBalanace);
    setAvaliableStake(totalAvaliable);
  }

  async function infosStake() {

    const maxStake = await stakeContract.maxStake();
    setMaxStake(parseInt(maxStake));

    const whitelist = await stakeContract.whitelistEnabled();
    setWhitelist(whitelist);
    
    if(whitelist == true){
      const whitelisted = await stakeContract.isWhitelisted(wallet);
      setWhitelisted(whitelisted);
    }

    const apr = await stakeContract.apr();
    setCurrentAPR(apr.toString());

    const bnb = await stakeContract.stakeFee();
    setPricesBnb(parseInt(bnb));

    const isBnb = await stakeContract.feeEnabledStake();
    setActiveBNB(isBnb);
  }

  async function timeStaked() {
    
    const reward = await stakeContract.calculateReward(0,0,0);

    setRewardsLegacy((reward / 10 ** 18).toFixed(2).toString());

  

    const start = await stakeContract.getStartTime(wallet);

    const canWithdraw = await stakeContract.canWithdraw(wallet);

    setCanWithdraw(canWithdraw && start > 0);


    if(start > 0){
      updateTimer(parseInt(start), (value: string)=>{
        setTimingLegacyReward(value);
      });
    }
    
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
 async function stake(value: number): Promise<void> {


  if (value <= 0) {
    throw new Error('Invalid value');
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const stakeContract = new ethers.Contract(stakeAddress, StakeABI, signer);

  const valueInWei = ethers.utils.parseEther((value).toString());

  let tx;

  let amountBnb = !activeBNB ? 0 : pricesBnb;

  
  let amountSend =  ethers.utils.parseEther(( amountBnb / 10 ** 18).toString());

  console.log("amountSend", amountSend);



  try {
    tx = await stakeContract.stake(valueInWei, {value: amountSend});
    
    Swal.fire({
      title: 'Please wait...',
      icon: 'info',
      showConfirmButton: false,
      allowEscapeKey: false,
    });
    await tx.wait();
  } catch (error:any) {
    console.log("error", error);
    let errorStake = error.message.match(/Error: ([^"]*)/)[1];

    Swal.fire({
      icon: 'error',
      title: 'Oops... ❌',
      text: `Something went wrong while launching the stake. ${errorStake} Please try again. ❌`,
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

async function removeStake() {
   // Show a confirmation dialog
  const { value } = await Swal.fire({
    title: "Are you sure?",
    text: "This action will remove your stake and you will receive no rewards.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, remove my stake",
    cancelButtonText: "Cancel",
  });

  if (!value) {
    return;
  }

  // Show a loading alert
  Swal.fire({
    title: "Processing...",
    text: "Please wait until your tokens are sent",
    icon: "info",
    allowOutsideClick: false,
  });

  let amountBnb = !activeBNB ? 0 : pricesBnb;

  
  let amountSend =  ethers.utils.parseEther(( amountBnb / 10 ** 18).toString());

    

  try {
    // Call the appropriate function based on the stakeType
    let tx: ethers.providers.TransactionResponse;
    tx = await stakeContract.removeStake({value: amountSend});

    // Wait for the transaction to be mined
    await tx.wait();

    // Show a success alert
    Swal.fire({
      title: "Success!",
      text: "You have removed your stake, you have not received rewards",
      icon: "success",
    });
  } catch (error) {
    console.log("error", error);
    // Show an error alert
    Swal.fire({
      title: "Error",
      text: "There was an error removing your tokens. 😞",
      icon: "error",
    });
  }
}


async function withdrawStakeRewards(): Promise<void> {
  // Show a loading alert
  Swal.fire({
    title: "Processing...",
    text: "Please wait while we withdraw your rewards.",
    icon: "info",
    allowOutsideClick: false,
  });

  let amountBnb = !activeBNB ? 0 : pricesBnb;

  
  let amountSend =  ethers.utils.parseEther(( amountBnb / 10 ** 18).toString());


    

  try {
    // Call the appropriate function based on the stakeType
    let tx: ethers.providers.TransactionResponse;
    tx = await stakeContract.withdraw(wallet,  {value: amountSend});

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
          whitelisted={whitelisted}
          whitelist={whitelist}
          amountToStake={amountStake}
          loadingApproving={loadingApproving}
          rewards={rewardsLegacy}
          canWithdraw={canWithdraw}
          timing={timingLegacyReward}
          inStake={userInStake}
          approve={() => {
            approveToken();
          }}
          removeStake={()=>{
            removeStake();
          }}
          withdraw={() => {
           if(userInStake == true){
              withdrawStakeRewards();
            }
          }}
          startStake={()=>{
            stake(amountStake);
          }}
          approved={approved}
          onChange={(e:number) => {setAmountStake(e)}}
          title={type}
          setAmountToMax={() => {
            setAmountStake(balanceRHT);
          }}
          apr={currentAPR + "%"}
          staked={Staked}
          totalToStake={avaliableStake}
          period={period}
          tvl={tvlLegacy}
        />
      </section>
    </div>
  );
}
