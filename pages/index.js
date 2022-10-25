import Head from "next/head";
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { useEffect, useState } from "react";
import { useRef } from "react";
import abi from "../pages/constants/contract-abi.json"
import style from "../styles/Home.module.css"

export default function Home() {
const [walletConnected, setWalletConnected] = useState(false);
const [joinedWhitelist, setJoinedWhitelist] = useState(false);
const [loading, setLoading] = useState(false);
const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);
const [addressOfWhitelisted, setAddressOfwhitelisted] = useState([]);
const web3ModalRef = useRef();

const Whitelist_Address = "0x33Ba6F58577f051Dc7B02afF0bFDDb4f3c4bCE9A";


// const style = {
//   button = {
//     padding: 2rem 0;
//     border-top: 1px solid #eaeaea;
//     cursor: pointer;
//   }

// }

//setting providers or signers and setting network
//goerli chainID = 5
const getProviderOrSigner = async (needSigner = false) => {
  const provider = await web3ModalRef.current.connect();
  const web3Provider = new providers.Web3Provider(provider);
  const { chainId } = await web3Provider.getNetwork();
  if (chainId !== 5) {
    window.alert("Change the network to Goerli");
    throw new Error("Change network to Goerli");
  }
  if (needSigner) {
    const signer = web3Provider.getSigner();
    return signer;
  }
  return web3Provider;
};

//add address to be whitelisted
const addAddressToWhitelist = async () => {
  try {
    const signer = await getProviderOrSigner(true);
    const whitelistContract = new Contract(
      Whitelist_Address,
      abi,
      signer
    );
    const tx = await whitelistContract.addAddressToWhitelist();
    setLoading(true);
    await tx.wait();
    setLoading(false);
    await getNumberOfWhitelisted();
    await returnAllWhitelistedAddressses();
    setJoinedWhitelist(true);
  } catch (err) {
    console.error(err);
  }
};

//return the total number of people that i've been whitelisted
const getNumberOfWhitelisted = async () => {
  try {
    const provider = await getProviderOrSigner();
    const whitelistContract = new Contract(
      Whitelist_Address,
      abi,
      provider
    );
    const _numberOfWhitelisted = await whitelistContract.numAddressesWhitelisted();
    setNumberOfWhitelisted(_numberOfWhitelisted);
  } catch (err) {
    console.error(err);
  }
};

//check if address has been whitelisted before
const checkIfAddressInWhitelist = async () => {
  try {
    const signer = await getProviderOrSigner(true);
    const whitelistContract = new Contract(
      Whitelist_Address,
      abi,
      signer
    );
    const address = await signer.getAddress();
    const _joinedWhitelist = await whitelistContract.whitelistedAddresses(
      address
    );
    setJoinedWhitelist(_joinedWhitelist);
  } catch (err) {
    console.error(err);
  }
};

//it returns all the address that has been whitelisted
const returnAllWhitelistedAddressses = async () => {
  try {
    const provider = await getProviderOrSigner();
    const whitelistContract = new Contract(
      Whitelist_Address,
      abi,
      provider
    );
    const AllWhitelistedAddressses = await whitelistContract.allWhitelistedAddress();
    setAddressOfwhitelisted(AllWhitelistedAddressses);
  } catch (err) {
    console.error(err);
  }
};

//this is for connecting my metamask to the dapp
const connectWallet = async () => {
  try {
    await getProviderOrSigner();
    setWalletConnected(true);
    checkIfAddressInWhitelist();
    getNumberOfWhitelisted();
    returnAllWhitelistedAddressses()
  } catch (err) {
    console.error(err);
  }
};

//this is for rendering my result/response to the user/page
const renderButton = () => {
  if (walletConnected) {
    if (joinedWhitelist) {
      return (
        <div className={style.description}>
          Thank you for joining the Whitelist!
        </div>
      );
    } else if (loading) {
      return <button className={style.button}>Loading...</button>;
    } else {
      return (
        <button onClick={addAddressToWhitelist} className={style.join}>
          Join the Whitelist
        </button>
      );
    }
  } else {
    return (
      <button onClick={connectWallet} className={style.button}>
        Connect your wallet
      </button>
    );
  }
};

useEffect(() => {
  if (!walletConnected) {
    web3ModalRef.current = new Web3Modal({
      network: "goerli",
      providerOptions: {},
      disableInjectedProvider: false,
    });
    connectWallet();
  }
}, [walletConnected]);

return (
  <div>
    <Head>
      <title>Whitelist Dapp</title>
      <meta name="description" content="Whitelist-Dapp" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <div>
      <div>
        <h1 className={style.header}>myWhitelist Dashboard!</h1>
        <div className={style.paragraph}> 
          This is only for people intersted in getting My token. it is of limited supply
        </div>
        <div className={style.numContainer}>
          <span className={style.numofadd}>{numberOfWhitelisted}</span> Address have already been Whitelisted
        </div>
        <div>
        {numberOfWhitelisted == 0 ? (  
          <p>No whitelisted addresses yet</p>
        ) :(
          addressOfWhitelisted?.map((addr, index) => {
            console.log("address of whitelisted", addressOfWhitelisted);
            return(
              <ul key={index}>
                <li>{`${addr}`}</li>
              </ul>
            );
          })
        )}

        </div>

        {renderButton()}
      </div>
    </div>
    <footer>
      Made with <span className={style.love}>&#10084;</span>  by  <a href="https://github.com/Ultra-Tech-code">BlackAdam</a>
    </footer>
   
  </div>
);
}