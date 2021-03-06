// https://github.com/sc-forks/solidity-coverage
module.exports = {
  norpc: true,
  testCommand: 'node --max-old-space-size=4096 ../node_modules/.bin/truffle test --network coverage',
  compileCommand: 'node --max-old-space-size=4096 ../node_modules/.bin/truffle compile --network coverage',
  copyPackages: ['openzeppelin-solidity'],
  skipFiles: [
    'misc/Migrations.sol',
    'mocks',
    'RayonTokenCrowdsaleFlattened.sol',
    'RayonTokenFlattened.sol'
  ]
};
