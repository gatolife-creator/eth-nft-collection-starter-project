import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";

import myEpicNft from "./utils/MyEpicNFT.json";

const TWITTER_HANDLE = "gatolife81";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = "";
const TOTAL_MINT_COUNT = 15;
const CONTRACT_ADDRESS = "0xDcE034f6F1689B62672C94645b1fbC3A9AFa0814";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const [supply, setSupply] = useState(0);

  console.log("currentAccount: ", currentAccount);

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have MetaMask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);

      setupEventListner();
    } else {
      console.log("No authorized account found");
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

      setupEventListner();
    } catch (error) {
      console.log(error);
    }
  };

  const setupEventListner = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          alert(
            `あなたのウォレットに NFT を送信しました。OpenSea に表示されるまで最大で10分かかることがあります。NFT へのリンクはこちらです: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
          getSupply();
        });
        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const renderNotConnectedContainer = () => {
    return (
      <button
        className="cta-button connect-wallet-button"
        onClick={connectWallet}
      >
        Connect to Wallet
      </button>
    );
  };

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );
        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await connectedContract.makeAnEpicNFT();
        setIsMinting(true);
        console.log("Mining...please wait.");
        await nftTxn.wait();

        setIsMinting(false);
        getSupply();
        console.log(
          `Mined, see transaction: https://goerli.etherscan.io/tx/${nftTxn.hash}`
        );
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getSupply = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          provider
        );
        const supply = await connectedContract.getSupply();
        setSupply(supply);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfChainIsGoerli = async () => {
    const { ethereum } = window;
    let chainId = await ethereum.request({ method: "eth_chainId" });
    console.log("Connected to chain " + chainId);
    // 0x5 は　Goerli の ID です。
    const goerliChainId = "0x5";
    if (chainId !== goerliChainId) {
      alert("You are not connected to the Goerli Test Network!");
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    getSupply();
    checkIfChainIsGoerli();
  }, []);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">あなただけの特別な NFT を Mint しよう💫</p>
          <p className="mint-count">
            現在のミント済み数 {`${supply} / ${TOTAL_MINT_COUNT}`}
          </p>
          {currentAccount === "" && renderNotConnectedContainer()}
          {currentAccount !== "" && !isMinting && (
            <button
              className="cta-button connect-wallet-button"
              onClick={askContractToMintNft}
            >
              Mint NFT
            </button>
          )}
          {currentAccount !== "" && isMinting && (
            <button className="cta-button connect-wallet-button">
              Minting...
            </button>
          )}
        </div>
        <div className="middle-container">
          <button className="opensea-button">
            <a
              className="opensea-text"
              href="https://testnets.opensea.io/collection/squarenft-362"
              target="_blank"
              rel="noreferrer"
            >
              OpenSeaでコレクションを表示
            </a>
          </button>
        </div>
        <div className="footer-container">
          <img src={twitterLogo} alt="Twitter Logo" className="twitter-logo" />
          <a
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
            className="footer-text"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
