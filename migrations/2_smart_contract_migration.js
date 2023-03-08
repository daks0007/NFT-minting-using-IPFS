const SmartContract = artifacts.require("MyTokenMinter");

module.exports = function (deployer) {
  deployer.deploy(SmartContract);
};
