//import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ethers, Wallet } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'lifecyclenft';
  metamask = false;

  provider: ethers.providers.Web3Provider;

  //constructor(private http: HttpClient) {
  constructor() {
    const provider = detectEthereumProvider();

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
    //this.provider.send("eth_requestAccounts", []);
    const signer = this.provider.getSigner();
    console.log(signer);
    signer.getAddress().then((adresse) => {
      console.log(adresse)
    });
    window.ethereum.request({ method: 'eth_requestAccounts' });
  }
}
