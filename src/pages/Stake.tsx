import { useEffect, useMemo, useReducer, useState } from "react";
import "./Style.scss";



export default function Stake({ title, apr, staked, totalToStake, period, tvl }: { tvl: string, title: string, apr: string, staked: string, totalToStake: string, period: string }) {

  return (
    <div className="container_stake">
      <aside>
        <div className="section_stake">
          <div className="stake_infos">
            <span className="title">Avaliable to Stake</span>
            <span className="value">{totalToStake} $RHT</span>
          </div>
          <div className="stake_infos">
            <span className="value">{title}</span>
          </div>
        </div>
        <hr className="hr_stake"/>
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
              <img width={24} className="icon" src="https://bscscan.com/token/images/rewardhunters_32.png?=v24"/>
              <input
                  className="input-field"
                  type="text"
                  value={0}
                  onChange={(e) =>{}}
                  placeholder={"0.0"}
              />
              <div className="btn_paper_input">
                Max
              </div>
          </div>
          <div onClick={() => {}} className="btn_paper disabled">
              Closed
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
