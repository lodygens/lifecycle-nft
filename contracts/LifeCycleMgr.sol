// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;


interface ILifeCycleNFT{
    function safeMint(address to) external;
    function safeBurn(uint256 tokenId) external;
    function ownerOf(uint256 tokenId) external returns (address);    
    function getCurrentId() external returns (uint256);
}

contract LifeCycleManager {

    event Action (
        uint256 tokenId,
        string message
    );

    ILifeCycleNFT public nftContract;
    mapping(address => uint256[]) private tokenIds;

    constructor(address _nftContract){
        nftContract = ILifeCycleNFT(_nftContract);
    }

    function getIds() external view returns (uint256 [] memory tabs){
        tabs = tokenIds[msg.sender];
    }

    function mintNFT() external{
        nftContract.safeMint(msg.sender);
        tokenIds[msg.sender].push(nftContract.getCurrentId() - 1);
    }

    function burnNFT(uint256 tokenId) external{
        nftContract.safeBurn(tokenId);
    }

    function doSomething(uint256 tokenId, string memory message) external returns (bool) {
        require(nftContract.ownerOf(tokenId) == msg.sender);
        emit Action(tokenId, message);
        return true;
    }
} 