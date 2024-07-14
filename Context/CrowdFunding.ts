
import { useState, useEffect, createContext, ReactNode } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";

//Internal import
import { CrowdFundingABI, CrowdFundingAddress } from "./constants";

//--Fetch Smart contract

// Define the context types
interface ICrowdFundingContext {
    titleData: string;
    currentAccount: string | null;
    campaigns: any[];
    userCampaigns: any[];
    donations: any[];
    createCampaign: () => Promise<void>;
    getCampaigns: () => Promise<void>;
    getUserCampaigns: (userId: string) => Promise<void>;
    donate: (campaignId: string) => Promise<void>;
    getDonations: (campaignId: string) => Promise<void>;
    connectWallet: () => Promise<void>;
  }


const fetchContract = (signerOrProvider: any) =>
  new ethers.Contract(CrowdFundingAddress, CrowdFundingABI, signerOrProvider);

export const CrowdFundingContext = createContext<ICrowdFundingContext | undefined>(undefined);

interface CrowdFundingProviderProps {
    children: ReactNode;
  }
  
export const CrowdFundingProvider = ({children}: CrowdFundingProviderProps) => {
  const titleData = "Crowd Funding Contract";
  const [currentAccount, setCurrentAccount] = useState<string>("");

  const createCampaign = async (campaign: any) => {
    const { title, description, amount, deadline } = campaign;
    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
    const provider = new ethers.BrowserProvider(connection); //ethers.BrowserProvider(connection);
    const signer = provider.getSigner();
    const contract = fetchContract(signer);

    console.log(currentAccount);
    try {
      const transaction = await contract.createCampaign(
        currentAccount,
        title,
        description,
        ethers.parseUnits(amount, 18),
        new Date(deadline).getTime() // deadline
      );

      await transaction.wait();
      console.log(" contract call success", transaction);
    } catch (error) {
      console.log("contract call failure", error);
    }
  };

  const getCampaigns = async () => {
    const provider = new ethers.JsonRpcProvider();
    const contract = fetchContract(provider);

    const campaigns = await contract.getCampaigns();

    const parsedCampaings = campaigns.map((campaign: any, i: any) => ({
      owner: campaign.owner,
      title: campaign.title,
      description: campaign.description,
      target: ethers.formatEther(campaign.toString()),
      deadline: campaign.deadline.toNumber(),
      amountCollected: ethers.formatEther(campaign.amountCollected.toString()),
      pId: i,
    }));

    return parsedCampaings;
  };

  const getUserCampaigns = async () => {
    const provider = new ethers.JsonRpcProvider();
    const contract = fetchContract(provider);

    const allCampaigns = await contract.getCampaigns();

    const accounts = await window.ethereum.request({
      method: "eth_accounts",
    });

    const currentUser = accounts[0];

    const filterCampaigns = allCampaigns.filter(
      (campaign: any) =>
        campaign.owner === "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
    );

    const userData = filterCampaigns.map((campaign: any, i: any) => ({
      owner: campaign.owner,
      title: campaign.title,
      description: campaign.description,
      target: ethers.formatEther(campaign.target.toString()),
      deadline: campaign.deadline.toNumber(),
      amountCollected: ethers.formatEther(campaign.amountCollected.toString()),
      pId: i,
    }));

    return userData;
  };

  const donate = async (pId: any, amount: any) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.BrowserProvider(connection);
    const signer = provider.getSigner();
    const contract = fetchContract(signer);

    const campaignData = await contract.donateToCampaign(pId, {
      value: ethers.parseEther(amount),
    });

    await campaignData.wait();
    location.reload();

    return campaignData;
  };

  const getDonations = async (pId: any) => {
    const provider = new ethers.JsonRpcProvider();
    const contract = fetchContract(provider);

    const donations = await contract.getDonators(pId);
    const numbOfDonations = donations[0].length;

    const parsedDonations = [];
    for (let i = 0; i < numbOfDonations; i++) {
      parsedDonations.push({
        donator: donations[0][i],
        donation: ethers.formatEther(donations[1][i].toString()),
      });
    }
    return parsedDonations;
  };

  //Check id wallet is connected

  const checkIfWalletConnected = async () => {
    try {
      if (!window.ethereum) {
        return setOpenError(true), setError("Install MetaMask");

        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        if (accounts.length) {
          setCurrentAccount(accounts[0]);
        } else {
          console.log("No Account Found");
        }
      }
    } catch (error) {
      console.log("Somenthing wrong while connecting to wallet");
    }
  };

  useEffect(() => {
    checkIfWalletConnected();
  }, []);

  //---Connect wallet function

  const connectWallet = async () => {
    try {
      if (!window.ethereum) return console.log("Install Metamask");

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log("Error while connecting to wallet");
    }
  };

  return (
    <CrowdFundingContext.Provider
      value={{
        titleData,
        currentAccount,
        createCampaign,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations,
        connectWallet,
      }}
    >
      {children}
    </CrowdFundingContext.Provider>
  );
};
