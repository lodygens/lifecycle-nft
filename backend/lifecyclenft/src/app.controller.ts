import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { ethers } from "ethers";
import { hashMessage } from 'ethers/lib/utils';

export class claimTokenDto {
  address: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}


  @Get("tokenaddress")
  getTokenAddress() {
    return this.appService.getTokenAddress();
  }

  @Get("ballotaddress")
  getBallotAddress() {
    return this.appService.getBallotAddress();
  }
  
  @Post("claimtokens")
  async claimTokens(@Body() body: claimTokenDto)  {
    console.log("app.controller body = ", body);
    await this.appService.claimTokens(body.address).then(result => {
      console.log("app.controller result = ", result);
      return result;
      });
  }

}
