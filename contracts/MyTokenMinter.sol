// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyTokenMinter is ERC721 {
    constructor() ERC721("MyTokenMinter","MTM"){}
    using Counters for Counters.Counter;
    using Strings for uint256;
    Counters.Counter _tokenId;
    mapping(uint256 => string) _tokenURIs;
    struct RenderToken {
uint256 id;
string uri;
    }

    function _setTokenURI(uint256 id, string memory tokenURI)internal{
_tokenURIs[id] =tokenURI;
    } 
    function tokenURI(uint256 tokenId)public view virtual override returns(string memory){
require(_exists(tokenId));
string memory _tokenURI = _tokenURIs[tokenId];
return _tokenURI;

    }

    function getAlltokens() public view returns (RenderToken[] memory){
uint256 latestId = _tokenId.current();
uint256 counter =0;
RenderToken[] memory result = new RenderToken[](latestId);
for(uint256 i=0;i<latestId;i++){
    if(_exists(counter)){
string memory uri = tokenURI(counter);
result[counter] =RenderToken(counter,uri);
    }
    counter++;
}
return result;
    }
    function mint (address recipient ,string memory uri)public returns (uint256){
        uint256 newId =_tokenId.current();
        _mint(recipient,newId);
        _setTokenURI(newId,uri);
        
        _tokenId.increment();
    }



}