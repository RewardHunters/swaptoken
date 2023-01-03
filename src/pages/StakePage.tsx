import { useEffect, useMemo, useReducer, useState } from "react";
import "./Style.scss";
import Stake from "./Stake";
import { ethers } from "ethers";
import { StakeABI } from "./Contracts/StakeABI";
import { RHTABI } from "./Contracts/RHTABI";
import Swal from 'sweetalert2';

export default function StakePage({statusConnect}:{statusConnect: string;}) {
  const [StakedSimple, setStakedSimple] = useState("");
  const [AvaliableSimple, setAvaliableSimple] = useState(600);
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


  const [approved, setApproved] = useState(false);
  const [loadingApproving, setLoadingApproving] = useState(false);

  const stakeAddress = "0x184196BEcD947E96d64FEC37358F0B1Aa896B8f0";
  const RHTToken = "0xC315a7E34572A9C3858428187aB10813Ac3420C8";

  useEffect(() => {
    getAmountStakedSimple();
    getAmountStakedPrime();
    getAmountStakedLegacy();
    verifyApprove();
  }, []);

  const getAmountStakedSimple = async () => {
   
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const wallet = signer.getAddress();
    const stake = new ethers.Contract(stakeAddress, StakeABI, signer);
    const valueStaked = await stake.getStakedSimple(wallet);
   
    let convertValue = parseInt(valueStaked) / 10 ** 18;
    setStakedSimple(convertValue.toString());

    const countersBalanace = await stake.counterBalance(stakeAddress);
    const simpleStakeLimit = await stake.simpleStakeLimit();
    let totalAvaliable = parseInt(simpleStakeLimit) - parseInt(countersBalanace.counterSimple);
    setAvaliableSimple(totalAvaliable);

    const maxStake = await stake.maxSimpleRHT();
    setMaxSimpleStake(parseInt(maxStake));
  };

  const getAmountStakedPrime = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const wallet = signer.getAddress();

    const stake = new ethers.Contract(stakeAddress, StakeABI, signer);
    const valueStaked = await stake.getStakedPrime(wallet);
    let convertValue = parseInt(valueStaked) / 10 ** 18;
    setStakedPrime(convertValue.toString());

    const countersBalanace = await stake.counterBalance(stakeAddress);
    const primeStakeLimit = await stake.primeStakeLimit();
    let totalAvaliable = parseInt(primeStakeLimit) - parseInt(countersBalanace.counterPrime);
    setAvaliablePrime(totalAvaliable);

    const maxStake = await stake.maxPrimeRHT();
    setMaxPrimeStake(parseInt(maxStake));
  };

  const getAmountStakedLegacy = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const wallet = signer.getAddress();

    const stake = new ethers.Contract(stakeAddress, StakeABI, signer);
    const valueStaked = await stake.getStakedLegacy(wallet);
    let convertValue = parseInt(valueStaked) / 10 ** 18;
    setStakedLegacy(convertValue.toString());

    const countersBalanace = await stake.counterBalance(stakeAddress);
    const legacyStakeLimit = await stake.legacyStakeLimit();
    let totalAvaliable = parseInt(legacyStakeLimit) - parseInt(countersBalanace.counterLegacy);
    setAvaliableLegacy(totalAvaliable);

    const maxStake = await stake.maxLegacyRHT();
    setMaxLegacyStake(parseInt(maxStake));
  };

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

  console.log("value", value);

  const valueInWei = ethers.utils.parseEther((value).toString());;

  console.log("valueInWei", valueInWei.toString());

  let tx;

  Swal.fire({
    title: 'Please wait...',
    icon: 'info',
    showConfirmButton: false,
    allowEscapeKey: false,
    timer: 10000,
  });

  try {
    tx = await stakeContract[option](valueInWei);
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
    text: `Your stake has been launched with transaction hash: ${tx.hash} ✅`,
  });
}

  

  return (
    <div className="Container_StakePage">
      <section className="sectionb_stake" id="sectionb_stake">
        <Stake
          amountToStake={amountSimple}
          loadingApproving={loadingApproving}
          approve={() => {
            approveToken();
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
          apr="16%"
          staked={StakedSimple}
          totalToStake={AvaliableSimple}
          period="1 month"
          tvl=""
        />
        <Stake
          amountToStake={amountPrime}
          loadingApproving={loadingApproving}
          approve={() => {
            approveToken();
          }}
          startStake={()=>{
            stake("simpleStakeLaunch", amountSimple);
          }}
          approved={approved}
          onChange={(e:number) => {setAmountPrime(e)}}
          title="Stake Premium"
          setAmountToMax={() => {
            setAmountPrime(maxPrimeStake);
          }}
          apr="48%"
          staked={StakedPrime}
          totalToStake={AvaliablePrime}
          period="1 month"
          tvl=""
        />
        <Stake
          amountToStake={amountLegacy}
          loadingApproving={loadingApproving}
          approve={() => {
            approveToken();
          }}
          startStake={()=>{
            stake("simpleStakeLaunch", amountSimple);
          }}
          approved={approved}
          onChange={(e:number) => {setAmountLegacy(e)}}
          title="Stake Legacy"
          setAmountToMax={() => {
            setAmountLegacy(maxLegacyStake);
          }}
          apr="56%"
          staked={StakedLegacy}
          totalToStake={AvaliableLegacy}
          period="1 month"
          tvl=""
        />
      </section>
    </div>
  );
}
