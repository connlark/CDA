
const tronWeb = new TronWeb(
    fullNode,
    solidityNode,
    eventServer,
    privateKey
);

export const getTRXBalances = (address) => {
    return new Promise((resolve, reject) => {
        if (!address) return;
        //const addrHEX = toHex(address)
       // console.log('HEX',addrHEX)

        getAccount(address).then((o) => {
            console.log(o);
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

    // You can also bind a `then` and `catch` method.
    
}