# Muny
A nonpegged free floating decentralized monetary system

## Config

Write .env file with:
```
ETHERSCAN_API_KEY=<etherscan_api_key>
INFURA_PROJECT_ID=<infura_project_id>
RINKEBY_PVT_KEY=<rinkeby_pvt_key>
```

## Build

`npm run build`

## Deploy

`npm run deploy:rinkeby`

## Etherscan Verify

`npx buidler verify --constructor-args arguments.js <address>`