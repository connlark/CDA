export const getTRXBalances = (address) => {
    return new Promise((resolve, reject) => {
        HTTP.get(`https://api.tronscan.org/api/account/${address}`, (error, result) => {
            if (error || result.statusCode !== 200 || !result.data.balances){
                reject(error);
            }
            //console.log(typeof result.data.balances)
            if (result.data == null || typeof result.data.balances === 'null') resolve([]);

            result.data.balances.map((bal) => {
                if (bal.name === 'TRX'){
                    bal.balance += (result.data.frozen.total / 1000000)
                }
            })

            resolve(result.data.balances)
        });
    });
};