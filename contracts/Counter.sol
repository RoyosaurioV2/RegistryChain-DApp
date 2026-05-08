// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17; 

contract Counter {  

    event ValueChanged(uint oldValue, uint256 newValue); 

    // Private variable of type unsigned int to keep the number of counts 
    uint256 private count = 0; 

    // Function that increments our counter 
    function increment() public { 
        count += 1; 
        emit ValueChanged(count - 1, count); 
    } 

    // Getter to get the count value 
    function getCount() public view returns (uint256) { 
        return count; 
    } 
} 
