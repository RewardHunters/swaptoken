import { useEffect, useMemo, useReducer, useState } from "react";
import { ethers } from "ethers";
import { SaleBUSD } from "./Contracts/BUSD";
import { CrowdSale } from "./Contracts/CrowdSale";
import "./Style.scss";
import Stake from "./Stake";

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
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [loading, setLoading] = useState(false);

  const tokenBUSD = "0xe9e7cea3dedca5984780bafc599bd69add087d56"; // 0xe9e7cea3dedca5984780bafc599bd69add087d56 Mainnet BUSD //Testnet: 0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee
  const tokenAddress = "0xE24ef451b9053A3B03C9A1c57FD58FD5C5c8AdAd";

  function buttonClick() {
     const glider = document.getElementById('glider')
      const inputs = document.getElementsByClassName('input_stake')
      let current = 0

      console.log(inputs.length);

      for (let i = 0; i < inputs.length; i++) {
        inputs[i].addEventListener('click', () => {
          if (current === i) return
          if (current < i) { // right
            document.body.style.setProperty('--diff', (i - current + 1).toString());
            document.body.style.setProperty('--right', `${200 * current}px`);
            if(glider){
              glider.style.animation = "right .5s cubic-bezier(0, 1.31, 1, 1.01)"
            }
          } else if (current > i) { // left
            document.body.style.setProperty('--diff', (current - i + 1).toString());
            if(glider){
              glider.style.animation = "left 0.5s cubic-bezier(0, 1.31, 1, 1.01)"
            }
          }
          setTimeout(() => {
            if(glider){
              glider.style.animation = ''
            }
          }, 500)
          current = i
        })
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
    try {
      setLoadingApprove(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const BUSD = new ethers.Contract(tokenBUSD, SaleBUSD, signer);
      const transation = await BUSD.approve(
        tokenAddress,
        "500000000000000000000"
      );

      await transation.wait().then(() => {
        setStatusConnect("Buy Token");
      });

      setLoadingApprove(false);
    } catch (error) {
      setLoadingApprove(false);
    }

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
      console.log("value", value.toString());
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
                        <img width={24} src="https://bscscan.com/token/images/rewardhunters_32.png?=v24"/>
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
                            <span className="price_text">Price:</span> 0.00032 BUSD
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
                      {loadingApprove ? "Approving..." : statusConnect}
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
                buttonClick();
              }} className="tab" >1 Month</label>
              <input  type="radio" id="radio-2" className="input_stake" name="tabs" />
              <label onClick={()=>{
                buttonClick();
              }} className="tab" >2 Months</label>
              <input  type="radio" id="radio-3" className="input_stake" name="tabs" />
              <label onClick={()=>{
                buttonClick();
              }} className="tab">3 Months</label>
              <span id="glider" className="glider"></span>
            </div>
          </div>

        </div>
      </div>
      <section className="sectionb_stake" id="sectionb_stake">
        <Stake title="Stake Classic" apr="16%" staked="0" totalToStake="0" period="1 month" tvl=""/>
        <Stake title="Stake Premium" apr="48%" staked="0" totalToStake="0" period="1 month" tvl=""/>
        <Stake title="Stake Legacy" apr="56%" staked="0" totalToStake="0" period="1 month" tvl=""/>
      </section>
    </div>
  );
}
