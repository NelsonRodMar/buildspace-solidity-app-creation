// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;


contract WavePortal {
    uint private totalWaves;
    address private owner;

    constructor(){
        owner = msg.sender;
    }

    function wave() public {
        require(msg.sender == owner, "Only owner of the contract can wave");
        totalWaves += 1;
    } 

    function setNewOwner(address _owner) public {
        require(msg.sender == owner, "Only actual owner can set a new owner");
        owner = _owner;
    }

    function getTotalWaves() public view returns (uint256) {
        return totalWaves;
    }

    function getActualOwner() public view returns (address) {
        return owner;
    }
}
