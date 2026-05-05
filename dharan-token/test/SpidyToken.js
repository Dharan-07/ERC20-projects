const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('SpidyToken',()=>{
    let SpidyToken, spidyToken, owner, addr1, addr2;

    beforeEach(async()=>{
        SpidyToken = await ethers.getContractFactory('SpidyToken');
        spidyToken = await SpidyToken.deploy();
        [owner,addr1,addr2,_] = await ethers.getSigners();
    })
});