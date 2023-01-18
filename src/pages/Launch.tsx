import { useEffect, useMemo, useReducer, useState } from "react";
import { ethers } from "ethers";
import { SaleBUSD } from "./Contracts/BUSD";
import { CrowdSale } from "./Contracts/CrowdSale";
import "./Style.scss";
import StakePage from "./StakePage";

type State = {
  valueToken: number;
  balanceToken: number;
  quantity: number;
};

type Action =
  | { type: "theTrust"; valueToken: any }
  | { type: "balanceHSC"; balanceToken: any }
  | { type: "tokenPrice"; quantity: any };

function reducer(state: State, action: Action) {
  switch (action.type) {
    case "theTrust":
      return {
        ...state,
        valueToken: action.valueToken,
      };
    case "balanceHSC":
      return {
        ...state,
        balanceToken: action.balanceToken,
      };
    case "tokenPrice":
      return {
        ...state,
        quantity: action.quantity,
      };
    default:
      return state;
  }
}

export default function Launch() {
  const [nullAccount, setNullAccount] = useState<any>(null);
  const [statusConnect, setStatusConnect] = useState<string>("Connect");
  const [{ valueToken, balanceToken, quantity }, dispatch] = useReducer(
    reducer,
    {
      valueToken: "",
      balanceToken: 0,
      quantity: 0,
    }
  );
  const [loading, setLoading] = useState(false);
  const [stakeContract, setStakeContract] = useState("0xdDd9D9155582ABbCe018E831bf3e8D8f50ac382f");
  const [currentMonth, setcurrentMonth] = useState("30");

  const tokenBUSD = "0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee"; // 0xe9e7cea3dedca5984780bafc599bd69add087d56 Mainnet BUSD //Testnet: 0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee
  const tokenAddress = "0xb16b19872a83C11B49beCa7A02e156f49De0A9D2";

  const [stakeContractInfo, setstakeContractInfo] = useState([
    {
      address: "0xE5e748128F80EE014fE2363CD66Db703fD0Ee5cF",
      type: "Stake Simple",
      days: "30",
      period: "1 month"
    },
    {
      address: "0xC8a9ACa7110a306E24192EBe90028b8eFC2b5e0a",
      type: "Stake Prime",
      days: "30",
      period: "1 month"
    },
    {
      address: "0x4D9ECaCCD109AE6b4A5DC46cf99Fe5E18EF9Ae1e",
      type: "Stake Legacy",
      days: "30",
      period: "1 month"
    },
    {
      address: "0xADF00ec8ad5d7e1a1439319E5434812f655F9F05",
      type: "Stake Simple",
      days: "60",
      period: "2 months"
    },
    {
      address: "0x9504dEe98EfEBCD8011F4b6b8dC2301E2232751B",
      type: "Stake Prime",
      days: "60",
      period: "2 months"
    },
    {
      address: "0xc15B9E053963213EACD30539d4B940d48832A732",
      type: "Stake Legacy",
      days: "60",
      period: "2 months"
    },
    {
      address: "0x4E5cad5CAfD21D6fb5688c519423f3b7bb14353a",
      type: "Stake Simple",
      days: "90",
      period: "3 months"
    },
    {
      address: "0x4E5cad5CAfD21D6fb5688c519423f3b7bb14353a",
      type: "Stake Prime",
      days: "90",
      period: "3 months"
    },
    {
      address: "0x4E5cad5CAfD21D6fb5688c519423f3b7bb14353a",
      type: "Stake Legacy",
      days: "90",
      period: "3 months"
    }
  ]);

  function buttonClick(days:string) {
    if(days == "30"){
      setcurrentMonth("30");
    }else if(days == "60"){
      setcurrentMonth("60")
    }else if(days  == "90"){
      setcurrentMonth("90");
    }
     
  }

  function disconnect() {
    setStatusConnect("Connect");
    setNullAccount(null);
  }

  useMemo(() => {
    var a = valueToken;
    var b = 0.0032;
    var quo = (a / b).toFixed(2);

    dispatch({ type: "tokenPrice", quantity: quo });
  }, [valueToken, quantity]);

  const ConnectWallet = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    provider
      .send("eth_requestAccounts", [])
      .then((wallet) => {
        setNullAccount(wallet);
      })
      .catch((err) => {
        if (err.code === 4001) {
          setNullAccount(null);
        }
      });
  };

  const approveBUSD = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const BUSD = new ethers.Contract(tokenBUSD, SaleBUSD, signer);
      const transation = await BUSD.approve(
        tokenAddress,
        "5000000000000000000000"
      );

      await transation.wait().then(() => {
        setStatusConnect("Buy Token");
      });
  };



  useMemo(async () => {

    if (nullAccount === null) {
      setStatusConnect("Connect");
    } else if (nullAccount !== null) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const wallet = signer.getAddress();
      const BUSD = new ethers.Contract(tokenBUSD, SaleBUSD, signer);
      const value = await BUSD.allowance(wallet, tokenAddress);

          console.log("nullAccount", nullAccount);
      if (value.toString() >= "400000000000000000000") {
        setStatusConnect("Buy Token");
      } else {
        setStatusConnect("Approve");
      }
    }
  }, [nullAccount, statusConnect]);

  const buyToken = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const crowd = new ethers.Contract(tokenAddress, CrowdSale, signer);
    await crowd.buyToken(ethers.utils.parseEther(valueToken));
  };

  console.log("currentMonth", currentMonth);
  return (
    <div id="Container">
       <nav className="navbar">
          <div className="navbar-container container">
              <input type="checkbox" name="" id=""/>
              <div className="hamburger-lines">
                  <span className="line line1"></span>
                  <span className="line line2"></span>
                  <span className="line line3"></span>
              </div>
              <ul className="menu-items">
                  <li><a target="_blank" href="https://rewardhunters.finance/">Home</a></li>
                  <li><a href="#sectionb_stake">Stake</a></li>
              </ul>
          </div>
          
          <div onClick={() => {
            disconnect()
          }} className="btn_paper disconnect_btn">
              Disconnect
          </div>
      </nav>
      <div className="contianer_swap_card">
          <img src="./swap.png"  className="image_title_defi"/>

      <section>
        <aside className="swap_token_card">
          <div className="content_sale_buy">
             <div className="contant_text_header">
                <span className="swap_title">
                    SWAP $RHT
                </span>
                <hr/>
             </div>
            {nullAccount !== null ? (
                <>
                    <div className="_input">
                        <div className="icon_label">
                            <img width={24} src="https://tokens.pancakeswap.finance/images/symbol/busd.png"/>
                            <div>$BUSD</div>
                        </div>
                        <div className="staking_flip_card_back_form_input">
                        <input
                            type="text"
                            value={valueToken}
                            onChange={(e) =>
                            dispatch({ type: "theTrust", valueToken: e.target.value })
                            }
                            placeholder={"0.0"}
                        />
                        </div>
                    </div>
                    <div className="_input">
                    <div className="icon_label">
                        <img width={24} src="/logo.png"/>
                        <div>$RHT</div>
                    </div>
                    <div className="staking_flip_card_back_form_input">
                        <input
                            className="result_rht"
                            type="text"
                            value={quantity}
                            disabled
                            onChange={(e) =>
                            dispatch({ type: "theTrust", valueToken: e.target.value })
                            }
                            placeholder={"0.0"}
                        />
                    </div>
                    </div>
                    <label className="label_price">
                            <span className="price_text">Price:</span> 0.0032 BUSD
                    </label>
                </>
              
            ) : undefined}

            <div className="_sale">
              {nullAccount === null || loading == true ? (
                <div onClick={() => ConnectWallet()} className="btn_paper">
                  {statusConnect}
                </div>
              ) : (
                <div>
                  {statusConnect === "Approve" ? (
                    <div onClick={() => approveBUSD()} className="btn_paper">
                      {statusConnect}
                    </div>
                  ) : (
                    <div onClick={() => buyToken()} className="btn_paper">
                      {statusConnect}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>
      </section>
      </div>
      
      <div className="divider_green">
        <div className="divider_green_bar">
          <img src="./stake.png" width={450} className="image_title"/>
          <div className="container_menu">
            <div className="tabs">
              <input  type="radio" id="radio-1" className="input_stake" name="tabs" checked />
              <label onClick={()=>{
                buttonClick("30");
              }} className={`tab ${currentMonth == "30" ? "glider" : ""}`} >1 Month</label>
              <input  type="radio" id="radio-2" className="input_stake" name="tabs" />
              <label onClick={()=>{
                buttonClick("60");
              }} className={`tab ${currentMonth == "60" ? "glider" : ""}`} >2 Months</label>
              <input  type="radio" id="radio-3" className="input_stake" name="tabs" />
              <label onClick={()=>{
                buttonClick("90");
              }} className={`tab ${currentMonth == "90" ? "glider" : ""}`}>3 Months</label>
            </div>
          </div>

        </div>
      </div>
      <section className="sectionb_stake Container_StakePage" id="sectionb_stake">
        {stakeContractInfo.map((item)=>
          (item.days == currentMonth ?
            <StakePage stakeAddress={item.address} statusConnect={statusConnect} type={item.type} period={item.period}/>
          : undefined)
        )}
      </section>
    </div>
  );
}
