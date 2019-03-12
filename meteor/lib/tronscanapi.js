const TronWeb = require('tronweb')

// This provider is optional, you can just use a url for the nodes instead
const HttpProvider = TronWeb.providers.HttpProvider;
const fullNode = new HttpProvider('https://api.trongrid.io'); // Full node http endpoint
const solidityNode = new HttpProvider('https://api.trongrid.io'); // Solidity node http endpoint
const eventServer = new HttpProvider('https://api.trongrid.io'); // Contract events http endpoint

const privateKey = 'da146374a75310b9666e834ee4ad0866d6f4035967bfc76217c5a495fff9f0d0';

const tronWeb = new TronWeb(
    fullNode,
    solidityNode,
    eventServer,
    privateKey
);

export const getTRXBalances = (address) => {
    return new Promise((resolve, reject) => {
        if (!address) return;

        getAccount(address).then((o) => {
            if (o && o.balance){
                resolve(o)
            }


        }).catch((e) => {
            reject();
        });
    });
};


async function getAccount(address) {


    // The majority of the function calls are asynchronus,
    // meaning that they cannot return the result instantly.
    // These methods therefore return a promise, which you can await.
    const account = await tronWeb.trx.getAccount(address)
    return account;    
}