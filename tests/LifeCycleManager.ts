import { ConstructorFragment } from "@ethersproject/abi";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import exp from "constants";
import { AnyTxtRecord } from "dns";
import { BigNumber, ContractReceipt, ContractTransaction } from "ethers";
import { ethers } from "hardhat";
import { execPath } from "process";
import { LifeCycleManager, LifeCycleManager__factory } from "../typechain-types";
import { LifeCycleNFT, LifeCycleNFT__factory } from "../typechain-types";
import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings";


describe("LifeCycle Manager", async () => {
  let accounts: SignerWithAddress[];
  let lifecycleContract: LifeCycleManager;
  let nftContract: LifeCycleNFT;

  beforeEach(async function () {
    accounts = await ethers.getSigners();

    const nftFactory = new LifeCycleNFT__factory(accounts[0]);
    nftContract = await nftFactory.deploy() as LifeCycleNFT;
    await nftContract.deployed();

    const mgrFactory = new LifeCycleManager__factory(accounts[0]);
    lifecycleContract = await mgrFactory.deploy(nftContract.address) as LifeCycleManager;
    await lifecycleContract.deployed();

    const MINTERROLE = await nftContract.MINTER_ROLE();
    const giveMintRoleTx = await nftContract.grantRole(MINTERROLE, lifecycleContract.address);
    await giveMintRoleTx.wait();

    const BURNERROLE = await nftContract.BURNER_ROLE();
    const giveBurnRoleTx = await nftContract.grantRole(BURNERROLE, lifecycleContract.address);
    await giveBurnRoleTx.wait();
  });

  describe("When the contract is deployed", async () => {
    it("uses a valid NFT token", async () => {
      const nftAddress = await lifecycleContract.nftContract();
      const mgrFactory = new LifeCycleManager__factory(accounts[0]);
      const nftContract = mgrFactory.attach(nftAddress);
      await expect(nftContract.address).to.eq(nftAddress);
    });

    describe("When a user gets an NFT from the contract", async () => {

      let initialBalance: BigNumber;
      let mintingGasCost: BigNumber;
      let balanceAfterMinting: BigNumber;

      beforeEach(async () => {
        initialBalance = await accounts[1].getBalance();
        //      console.log("balanceBefore = " + ethers.utils.formatEther(balanceBefore));
        const tx = await lifecycleContract.connect(accounts[1]).mintNFT();
        const txReceipt = await tx.wait();
        const gasUsage = txReceipt.gasUsed;
        const gasPrice = txReceipt.effectiveGasPrice;
        mintingGasCost = gasUsage.mul(gasPrice);
        balanceAfterMinting = await accounts[1].getBalance();
      });

      it("gives an NFT", async () => {
        const balance = await nftContract.balanceOf(accounts[1].address);
        expect(balance).to.eq(1);
      });

      it("gives the first NFT", async () => {
        const nftids = await lifecycleContract.connect(accounts[1]).getIds();
        expect(nftids[0]).to.eq(0);
      });

      it("dispends some gas", async () => {
        expect(balanceAfterMinting).to.eq(initialBalance.sub(mintingGasCost));
      });

      describe("When a user does an action with the NFT", async () => {

        let doSomethingTx : ContractTransaction;
        let doSomethingReceipt : ContractReceipt;
        const BLABLA="blabla";
        
        const SIGNATURE = keccak256(toUtf8Bytes(BLABLA));
        
        beforeEach(async () => {
          const nftids = await lifecycleContract.connect(accounts[1]).getIds();

          doSomethingTx = await lifecycleContract.connect(accounts[1]).doSomething(BigNumber.from(nftids[0]), SIGNATURE);
          doSomethingReceipt = await doSomethingTx.wait();         
        });

        it("the action is recorded in a transaction", async () => {
          const decodedData = lifecycleContract.interface.parseTransaction( {data:doSomethingTx.data, value:doSomethingTx.value});
          expect(SIGNATURE).to.eq(decodedData.args.message);
        });

      });

      describe("When a user burns the NFT", async () => {

        let balanceAfterBurning: BigNumber;
        let burningGasCost: BigNumber;
        let allowGasCost: BigNumber;

        beforeEach(async () => {
          const nftids = await lifecycleContract.connect(accounts[1]).getIds();


          const allowTx = await nftContract
            .connect(accounts[1])
            .approve(lifecycleContract.address, nftids[0]);
          const receiptAllow = await allowTx.wait();
          let gasUsage = receiptAllow.gasUsed;
          let gasPrice = receiptAllow.effectiveGasPrice;
          allowGasCost = gasUsage.mul(gasPrice);

          const tx = await lifecycleContract.connect(accounts[1]).burnNFT(BigNumber.from(nftids[0]));
          const txReceipt = await tx.wait();
          gasUsage = txReceipt.gasUsed;
          gasPrice = txReceipt.effectiveGasPrice;
          burningGasCost = gasUsage.mul(gasPrice);
          balanceAfterBurning = await accounts[1].getBalance();
          
        });

        it("takes an NFT out", async () => {
          const balance = await nftContract.balanceOf(accounts[1].address);
          expect(balance).to.eq(0);
        });

        it("dispends some gas", async () => {
          expect(balanceAfterBurning).to.eq(balanceAfterMinting.sub(allowGasCost).sub(burningGasCost));
        });

      });

    });

  });

});