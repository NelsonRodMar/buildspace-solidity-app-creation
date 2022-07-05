import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./styles/App.css";
import abi from "./utils/WavePortal.json";
import twitterLogo from './assets/twitter-logo.svg';


const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const contractAddress = "0x54D41A349a75BCa0c46c9709c5b3De2666A7A458";
  const contractABI = abi.abi;
  
  /*
    Update current Waves
  */
  const getTotalWaves = async () => {
    try {
      const { ethereum } = window;
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      var totalWaves = await wavePortalContract.getTotalWaves();
      let element = document.getElementById("totalWaves");
      let newContent =', ' + totalWaves + ' waves actually ';
      element.innerHTML=  newContent;
    } catch (error) {
      console.log(error);
    }
  }

  /*
    Check if wallet connected is owner of contract to waves
  */
  const checkIfIsOwner = async () => {
    try {
      const { ethereum } = window;
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      var currentOwner = await wavePortalContract.getActualOwner();
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      if (currentOwner.toLowerCase() !== accounts[0].toLowerCase()) {
        console.log(false);
        let element = document.getElementById("waveButtonDiv");
        let newContent =`<p>Only the owner of the contract can wave 👋🏼</p>`;
        element.innerHTML=  newContent;
      }
    } catch (error) {
      console.log(error);
    }
  }

  /*
    Check if a wallet is connected
  */
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found")
      }
      checkIfIsOwner();
    } catch (error) {
      console.log(error);
    }
  }

  /**
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  /*
    Call contract for a new wave
  */
  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let owner = await wavePortalContract.getActualOwner();
          /*
          * Execute the actual wave from your smart contract
          */
          const waveTxn = await wavePortalContract.wave();
          console.log("Mining...", waveTxn.hash);

          await waveTxn.wait();
          console.log("Mined -- ", waveTxn.hash);
          let count = await wavePortalContract.getTotalWaves();
          console.log("Retrieved total wave count...", count.toNumber());
          getTotalWaves();
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    checkIfIsOwner();
    getTotalWaves();
  }, [])

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          👋 Hey there<span id="totalWaves"></span>!
        </div>

        <div className="bio">
          I am Nelson and start learning Solidity with Buildspace, let's wave 🌊
        </div>

        <div id="waveButtonDiv">
          <button div="waveButton" className="waveButton" onClick={wave} >
                Wave !
          </button>
        </div>
        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}


        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href="https://twitter.com/NelsonRodMar"
            target="_blank"
            rel="noreferrer"
          >Built by @NelsonRodMar</a>
        </div>

      </div>
    </div>
  );
}

export default App