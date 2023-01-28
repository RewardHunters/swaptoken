import { useEffect, useMemo, useReducer, useState } from "react";
import "./Style.scss";

export default function Stake({
  approve,
  withdraw,
  title,
  inStake,
  rewards,
  maxStake,
  minStake,
  apr,
  staked,
  timing,
  totalToStake,
  period,
  tvl,
  setAmountToMax,
  amountToStake,
  onChange,
  startStake,
  removeStake,
  approved,
  canWithdraw,
  loadingApproving,
  whitelisted,
  whitelist,
}: {
  approve: Function;
  withdraw: Function;
  tvl: number;
  title: string;
  rewards: string;
  maxStake: number;
  minStake: number;
  apr: string;
  staked: string;
  timing: string;
  totalToStake: number;
  period: string;
  setAmountToMax: Function;
  amountToStake: number;
  onChange: Function;
  startStake: Function;
  removeStake: Function;
  approved: boolean;
  canWithdraw: boolean;
  inStake: boolean;
  loadingApproving: boolean;
  whitelisted: boolean;
  whitelist: boolean;
}) {

  function handleFocus(e:any) {
    e.currentTarget.select();
  }

  return (
    <div className="container_stake">
      <aside>
        <div className="section_stake">
          <div className="stake_infos">
            <span className="title">Avaliable to Stake</span>
            <span className="value">{totalToStake} Holders</span>
          </div>
          <div className="stake_infos">
            <span className="value">{title}</span>
          </div>
        </div>
        <hr className="hr_stake" />
        <div className="section_stake">
          <div className="stake_infos">
            <span className="title">Staked Amount</span>
            <span className="value">$RHT {staked}</span>
          </div>
          <div className="stake_infos">
            <span className="title">APR</span>
            <span className="value">{apr}</span>
          </div>
        </div>
        <div className="stake_inputs_section">
          <div className="stake_input">
            <img width={24} className="icon" src="/logo.png" />
            <input
              className="input-field"
              type="text"
              value={amountToStake}
              onFocus={ handleFocus }
              onChange={(e) => {
                onChange(e.target.value);
              }}
              autoFocus
              placeholder={"0.0"}
            />
            <div onClick={() => setAmountToMax()} className="btn_paper_input">
              Max
            </div>
          </div>
          {whitelist == true && whitelisted == false ?
            <div
              onClick={() => {
                if (!approved) {
                  approve();
                }else{
                  startStake();
                }
              }}
              className="btn_paper rewardis-disabled"
            >
             You are not on the whitelist
            </div>
          : 
            <div
              onClick={() => {
                if (!approved) {
                  approve();
                }else{
                  startStake();
                }
              }}
              className="btn_paper"
            >
              {approved ? "Stake" : loadingApproving ? "Approving..." : "Approve"}
            </div>
          }

          
          {canWithdraw?
            <div
              onClick={() => { withdraw() }}
              className={`btn_paper ${canWithdraw ? "" : "rewardis-disabled"}`}
            >
              Withdraw Rewards {canWithdraw ? "(Available)" : ""}
            </div>
          : 
            (inStake ?
              <div
                onClick={() => { removeStake() }}
                className={`btn_paper_error`}
              >
                Remove Tokens (No Rewards)
              </div>
            : 
              <div
                onClick={() => { withdraw() }}
                className={`btn_paper ${canWithdraw ? "" : "rewardis-disabled"}`}
              >
                Withdraw Rewards {canWithdraw ? "(Available)" : ""}
              </div>
            )
          }

          <div className="stake_infos_card">
            <span className="title">REWARDS</span>
            <span className="value">$RHT {rewards}</span>
          </div>
          <div className="stake_infos_card">
            <span className="title">Period</span>
            <span className="value">{period}</span>
          </div>
          <div className="stake_infos_card">
            <span className="title">Min Stake</span>
            <span className="value">{minStake}</span>
          </div>
          <div className="stake_infos_card">
            <span className="title">Max Stake</span>
            <span className="value">{maxStake}</span>
          </div>
          <div className="stake_infos_card">
            <span className="title">TVL</span>
            <span className="value">{tvl} $RHT</span>
          </div>
          <div className="stake_infos_card">
            <span className="title">Time in Stake</span>
            <span className="value">{timing}</span>
          </div>
        </div>
      </aside>
    </div>
  )
}