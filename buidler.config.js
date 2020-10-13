usePlugin("buidler-ethers-v5");

module.exports = {
  solc: {
    version: "0.6.8",
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
};