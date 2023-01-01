//import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ethers, Wallet } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import nftJson from '../assets/contracts/LifeCycleNFT.json'
import lifecycleMgrJson from '../assets/contracts/LifeCycleManager.json'
import { environment } from "../environments/environment";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'lifecyclenft';
  metamask = false;
  connected = false;

  provider: ethers.providers.Web3Provider;
  nftContract: ethers.Contract | undefined;
  nftContractAddr: string;
  lifeCycleMgrContract: ethers.Contract | undefined;
  lifeCycleMgrAddr: string;

  //constructor(private http: HttpClient) {
  constructor() {
    const provider = detectEthereumProvider();

    this.lifeCycleMgrAddr = environment.LIFECYCLEMGR_ADDR;
    this.nftContractAddr = environment.NFT_ADDR;

    if (!provider) {
      throw new Error('Please install MetaMask!');
    }

    console.log(provider);
    this.provider = new ethers.providers.Web3Provider(window.ethereum);
    console.log(this.provider);
    if (typeof window.ethereum == 'undefined') {
      console.log('MetaMask is not installed!');
      throw new Error('MetaMask is installed!');
    }
    this.metamask = true;

  }

  /**
   * This connects metamask wallet to this dapp
   */
  connect() {
    const signer = this.provider.getSigner();
    console.log(signer);
    window.ethereum.request({ method: 'eth_requestAccounts' }).then(() => {
      signer.getAddress().then((adresse) => {
        console.log("[connect] " + adresse)

        this.nftContract = new ethers.Contract(this.nftContractAddr,
          nftJson.abi,
          signer);
        this.lifeCycleMgrContract = new ethers.Contract(this.lifeCycleMgrAddr,
          lifecycleMgrJson.abi,
          signer);
        this.connected = true;
      })
    })
  }
  /**
   * This retreives NFT list
   */
  getNFTList() {
    const signer = this.provider.getSigner();

    signer.getAddress().then((adresse) => {
      console.log("[getNFTList] " + adresse);
      if (!this.lifeCycleMgrContract)
        throw new Error("LifeCycle Mgr Contract not found");

      const nftids = this.lifeCycleMgrContract.connect(signer)['getIds']().then((ids: BigInteger[]) => {
        if (ids) {
          for (let i = 0; i < ids.length; i++) {
            console.log("[getNFTList] " + ids[i]);
          }
        }
        else {
          console.log("[getNFTList() ] aucun NFT ");
        }
      })
    })
  }

  /**
   * This mints a new  NFT
   */
  mintNFT() {
    const signer = this.provider.getSigner();

    signer.getAddress().then((adresse) => {
      if (!this.lifeCycleMgrContract)
        throw new Error("LifeCycle Mgr Contract not found");

      console.log("[mintNFT] " + adresse);

      this.lifeCycleMgrContract.connect(signer)['mintNFT']().then(() => {
        console.log("[mintNFT] done");
      })
    })
  }
}

