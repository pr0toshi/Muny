module.exports = async ({
  getNamedAccounts,
  deployments
}) => {
  const { deployer } = await getNamedAccounts();
  console.log('Deploying Muny...');
  const MunyDeployment = await deployments.deploy('Muny', {
    from: deployer,
    gas: 4000000,
    args: [
      'Muny',
      'MUNY',
      '0x9d31e30003f253563ff108bc60b16fdf2c93abb5',
      '0x9d31e30003f253563ff108bc60b16fdf2c93abb5'
    ]
  });
  console.log(`Deployed Muny to ${MunyDeployment.address}`);
};