// //SPDX-License-Identifier:MIT
// pragma solidity ^0.8.18;

// contract Marvel721{

//     string private _name;
//     string private _symbol;
//     address private _Contractowner;

//     mapping (tokenId => address) private owners;
//     mapping (address => uint256) private balances;
//     mapping (toeknId => address) private tokenApproval;

//     constructor(){
//         _name = "Marvels";
//         _symbol = "MVL";
//         _Contractowner = msg.sender;
//     }

//     function name () public view returns(string memory){
//         return _name;
//     }

//     function symbol() public view returns(string memory){
//         return _symbol;
//     }

//     function owner() public view returns(){
//         return _Contractowner;
//     }

//     function baseURI() public view returns(string memory){
//         return "";
//     }
// }