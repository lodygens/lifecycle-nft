# NFT life cycle

This project implements NFT lifecycle

NFT lifecycle consists of
1. being created for a user who is the 1st owner
2. potentaly, being passed / sold between users
3. register actions for that NFT
    1. the owner is the only allowed to register actions 
    2. actions are transmitted by hash; it is the owner responsibility to save actions. 
    The idea is to hide actions in the blockchain (so that actions are not readable). 
    The transaction contains the hash of the action only; this permit to prove the action without revealing it.
4. goto -2-, if needed
5. potentially destroy the NFT