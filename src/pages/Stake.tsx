import { useEffect, useMemo, useReducer, useState } from "react";
import "./Style.scss";

export default function Stake({
  approve,
  title,
  apr,
  staked,
  totalToStake,
  period,
  tvl,
  setAmountToMax,
  amountToStake,
  onChange,
  startStake,
  approved,
  loadingApproving,
}: {
  approve: Function;
  tvl: string;
  title: string;
  apr: string;
  staked: string;
  totalToStake: number;
  period: string;
  setAmountToMax: Function;
  amountToStake: number;
  onChange: Function;
  startStake: Function;
  approved: boolean;
  loadingApproving: boolean;
}) {

  console.log("approved", approved);
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
            <span className="value">{staked} $RHT</span>
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
              onChange={(e) => {
                onChange(e.target.value);
              }}
              placeholder={"0.0"}
            />
            <div onClick={() => setAmountToMax()} className="btn_paper_input">
              Max
            </div>
          </div>
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

          <div className="stake_infos_card">
            <span className="title">Period</span>
            <span className="value">{period}</span>
          </div>
          <div className="stake_infos_card">
            <span className="title">TVL</span>
            <span className="value">{tvl}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
