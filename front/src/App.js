import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./styles/App.css";
import abi from "./utils/WavePortal.json";
import twitterLogo from './assets/twitter-logo.svg';


const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const contractAddress = "0xea76dd45D3024c0f1166562ed3c1966307416eAC";
  const contractABI = abi.abi;
  var isPaused;

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
      let newContent = ', ' + totalWaves + ' waves actually ';
      element.innerHTML = newContent;
    } catch (error) {
      console.log(error);
    }
  }

  /*
    Update isPaused
  */
  const getIsPaused = async () => {
    try {
      const { ethereum } = window;
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      isPaused = await wavePortalContract.getIsPaused();
      if (isPaused) {
        let element = document.getElementById("waveButton");
        element.innerText = "Impossible to wave because contract in paused";
        document.getElementById("waveButton").disabled = true; 
      } else {
        let element = document.getElementById("waveButton");
        element.innerText = "Wave !";
        document.getElementById("waveButton").disabled = false; 
      }
    } catch (error) {
      console.log(error);
    }
  }

  /*
    Check if wallet connected is owner of contract
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
        let element = document.getElementById("changePauseButtonDiv");
        let newContent = ``;
        element.innerHTML = newContent;
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

        /*
        * Execute the actual wave from your smart contract
        */
        var waveMessage = document.getElementById('waveTextArea').value;
        
        const waveTxn = await wavePortalContract.wave(waveMessage, { gasLimit: 300000, value: ethers.utils.parseEther("0.015")});
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);
        document.getElementById('waveTextArea').value  = "";
        getTotalWaves();
        getAllWaves();
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  /*
   Call contract to change the pause state
 */
  const changePauseState = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        var currentOwner = await wavePortalContract.getActualOwner();
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });

        if (currentOwner.toLowerCase() === accounts[0].toLowerCase()) {
          /*
          * Execute the actual wave from your smart contract
          */
          const changePauseStateTxn = await wavePortalContract.changeIsPausedState();
          console.log("Mining...", changePauseStateTxn.hash);

          await changePauseStateTxn.wait();
          console.log("Mined -- ", changePauseStateTxn.hash);
          console.log("Pause state changed");
          getIsPaused();
        } else {
          console.log("Only owner can change pause state");
        }
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  /*
    Create a method that gets all waves from your contract
  */
  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        const waves = await wavePortalContract.getAllWaves();


        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    checkIfIsOwner();
    getTotalWaves();
    getAllWaves();
    getIsPaused();
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
          <textarea id="waveTextArea" placeholder="Enter a nice text"></textarea>
          <button id="waveButton" div="waveButton" className="waveButton" onClick={wave} >
            Wave !
          </button>
        </div>


        <div id="changePauseButtonDiv">
          <button div="changePauseButton" className="changePauseButton" onClick={changePauseState} >
            Change pause state of the contract
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

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}

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