import { utils } from './../node_modules/@ethereumjs/rlp/src/index';
import { Provider } from './../node_modules/ethers/src.ts/providers/provider';

import React, { useState, useEffect } from 'react';
import Wenb3Modal from "web3modal";
import { ethers, parseUnits }from 'ethers'

//Internal import
import { CrowdFundingABI, CrowdFundingAddress } from './constants'

//--Fetch Smart contract

const fetchContract = (signerOrProvider: any) =>
    new ethers.Contract(CrowdFundingAddress, CrowdFundingABI, signerOrProvider)

export const CrowdFundingContext = React.createContext(0);

export const CrowdFundingProvider = ({ children }: any) => {
    const titleData = "Crowd Funding Contract";
    const [currentAccount, setCurrentAccount] = useState<string>("");

    const createCampaign = async (campaign: any) => {
        const { title, description, amount, deadline } = campaign;
        const web3modal = new Wenb3Modal();
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
            console.log(" contract call success", transaction)
        } catch (error) {
            console.log("contract call failure", error);
        }
    }
}

const getCampaigns = async () => {
    const provider =  new ethers.JsonRpcProvider();
    const contract = fetchContract(provider);

    const campaigns = await contract.getCampaigns();

    const parsedCampaings = campaigns.map((campaign: any, i: any) => ({
        owner: campaign.owner,
        title: campaign.title,
        description: campaign.description,
        target: ethers.formatEther(campaign.toString()),
        deadline: campaign.deadline.toNumber(),
        amountCollected: ethers.formatEther(
            campaign.amountCollected.toString()
        ),
        pId: i,
    }))

    return parsedCampaings;
}

const getUserCampaigns = async () =>{
    const provider = new ethers.JsonRpcProvider();
    const contract = fetchContract(provider);

    const allCampaigns = await contract.getCampaigns();

    const accounts = await window.ethereum.request({
        method: "eth_accounts",
    });

    const currentUser = accounts[0];

    const filterCampaigns = allCampaigns.filter(
        (campaign: any) =>
            campaign.owner === "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    );
}