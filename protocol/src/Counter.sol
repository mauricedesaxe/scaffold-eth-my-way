// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract Counter {
    uint256 public number;

    event NumberSet(uint256 newNumber, address indexed by);

    function increment() public {
        number++;
        emit NumberSet(number, msg.sender);
    }
}
