//import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { BigNumber, ContractTransaction, ethers, Transaction, Wallet } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import nftJson from '../assets/contracts/LifeCycleNFT.json'
import lifecycleMgrJson from '../assets/contracts/LifeCycleManager.json'
import { environment } from "../environments/environment";
import { bufferToggle } from 'rxjs';
import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings";

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
  nftIds: Uint8Array[] | undefined;
  currentToken: Uint8Array | undefined;


  hiddens = [
    false, // 0 : home
    true,  // 1 : history
    true,  // 2 : doSomething
    true   // 3 : about
  ]

  currentPage = "home";

  getPageIndex(what: string) {
    switch (what) {
      case "home": return 0;
      case "history": return 1;
      case "dosomething": return 2;
      case "about": return 3;
      default: return 0;
    }
  }

  /**
   * This shows/hides an element
   * @param what is the name of the element to show
   * @returns 
   */
  toggle(what: string) {
    if (what == this.currentPage)
      return;

    const element = document.getElementById(what);
    if (!element)
      throw new Error("element not found " + what)

    const currentElement = document.getElementById(this.currentPage);
    if (!currentElement)
      return;

    currentElement.style.visibility = 'hidden';
    this.hiddens[this.getPageIndex(this.currentPage)] = true;
    this.hiddens[this.getPageIndex(what)] = false;

    if (this.hiddens[this.getPageIndex(what)] == false) {
      element.style.visibility = 'visible';
    }

    this.currentPage = what;
  }
  /** 
   * This calls toggle("home") 
   */
  toggleHome() {
    this.toggle("home");
  }
  /** 
   * This calls toggle("history") 
   */
  toggleHistory(id: Uint8Array) {
    const what = "history";
    this.currentToken = id;
    this.toggle(what);
  }
  /** 
   * This prepares "dosomething" element and calls toggle("dosomething") 
   * @param id is saved in currentToken
   */
  toggleDoSomething(id: Uint8Array) {
    const what = "dosomething";
    this.currentToken = id;
    this.toggle(what);
  }
  /** 
   * This calls toggle("about") 
   */

  toggleAbout() {
    this.toggle("about");
  }


  toggleSavingAction(){
    const what ="savingAction";
    console.log('[toggleSavingAction]');

    const elementSaving = document.getElementById(what) as HTMLInputElement;
    if (!elementSaving)
      throw new Error("element not found " + what)

      const currentVisibility = elementSaving.style.visibility;
      if (currentVisibility == "visible")
        elementSaving.style.visibility = "hidden";
      else
        elementSaving.style.visibility = "visible";
    }

  //constructor(private http: HttpClient) {
  constructor() {
    const provider = detectEthereumProvider();

    this.lifeCycleMgrAddr = environment.LIFECYCLEMGR_ADDR;
    this.nftContractAddr = environment.NFT_ADDR;

    if (!provider)
      throw new Error('Please install MetaMask!');

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
          this.nftIds = ids;
          for (let i = 0; i < ids.length; i++) {
            console.log("[getNFTList] nftIds[" + i + "] = " + this.nftIds[i]);
          }
        }
        else {
          console.log("[getNFTList() ] aucun NFT ");
        }
      })
    })
  }
  /**
    * This retreives NFT history from the backend
    */
  getNFTHistory(id: Uint8Array) {
    this.toggleHistory(id);
  }

  /**
    * This registers an action on the blockchain; potentialy saves it to the backend
    * @param id : the tokenid
    * @param message: the action message
    * @param save: if true, the message is sent to the backend
    */
  //doSomething(id : Uint8Array, message : string, save : boolean) {
  doSomething() {
    const signer = this.provider.getSigner();

    if (!this.currentToken) {
      console.log("[doSomething] currentToken not set");
      return;
    }

    console.log("[doSomething] tokenId " + this.currentToken);

    let what = "doSomethingMessage";
    let element = document.getElementById(what) as HTMLInputElement;
    if (!element)
      throw new Error("element not found " + what)

    const message = element.value as string;
    console.log("[doSomething] message " + message);

    what = "doSomethingSave";
    element = document.getElementById(what) as HTMLInputElement;
    if (!element)
      throw new Error("element not found " + what)

    const save = element.checked as boolean;
    console.log("[doSomething] save " + save);

    what = "doSomethingPrivacy";
    element = document.getElementById(what) as HTMLInputElement;
    if (!element)
      throw new Error("element not found " + what)

    const privacy = element.checked as boolean;
    console.log("[doSomething] privacy " + privacy);

    signer.getAddress().then((adresse) => {
      if (!this.lifeCycleMgrContract)
        throw new Error("LifeCycle Mgr Contract not found");

      let msg = message;
      if (privacy)
        msg = keccak256(toUtf8Bytes(message));

        console.log("[doSomething] " + msg);

      this.lifeCycleMgrContract.connect(signer)['doSomething'](this.currentToken, msg).then((tx : ContractTransaction) => {
        tx.wait().then((receipt) => {
          console.log("[doSomething] " + receipt.transactionHash);
        })
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

