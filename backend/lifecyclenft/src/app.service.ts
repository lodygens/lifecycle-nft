import { Injectable } from '@nestjs/common';
import { ethers } from "ethers";
import { HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as dotenv from "dotenv";

import * as tokenJson from "./assets/MyToken.json";
import * as ballotJson from "./assets/TokenizedBallot.json";

const TOKEN_ADDR = "0xd5BFf3786212Be9E95F35036Dc82F07c5eb5Df85"
const TOKENIZEDBALLOT_ADDR = "0x89Eb37734C49e3478D55cF8EEcb4bD225A79C57B";
const TEST_MINT_VALUE = ethers.utils.parseEther("10");


@Injectable()
export class AppService {

  tokenContract: ethers.Contract | undefined;
  ballotContract: ethers.Contract | undefined;
  wallet: ethers.Wallet | undefined;
  provider: ethers.providers.Provider;

  constructor() {

    this.provider = new ethers.providers.AlchemyProvider("goerli", process.env.ALCHEMY_API_KEY);

    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY).connect(this.provider);

    this.tokenContract = new ethers.Contract(TOKEN_ADDR,
      tokenJson.abi,
      this.wallet);
    this.ballotContract = new ethers.Contract(TOKEN_ADDR,
      ballotJson.abi,
      this.wallet);
  }

  getTokenAddress() {
    return { result: TOKEN_ADDR };
  }

  getBallotAddress() {
    return { result: TOKENIZEDBALLOT_ADDR };
  }

  async claimTokens(address: string) {
    const mintTx = await this.tokenContract.mint(address, TEST_MINT_VALUE);
    const receipt = await mintTx.wait();
    return { result: receipt.transactionHash };
  }
}
