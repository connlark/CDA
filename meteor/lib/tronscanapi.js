export const getTRXBalances = (address) => {
    return new Promise((resolve, reject) => {
        if (!address) return;
        HTTP.get(`https://api.tronscan.org/api/account/${address}`, (error, result) => {
            console.log(`TRX RESULT ADDR: ${address} status code: ${result.statusCode}`);
            if (error || result.statusCode !== 200 || !result.data.balances){
                console.log('TRX ERR', error)
                resolve([]);
            }
            //console.log(typeof result.data.balances)
            if (result.data == null || typeof result.data.balances === 'undefined') {
                console.log('TRX bal ERR', error)
                resolve([]);
            }
            else if (!result.data.balances || !result.data.balances.map || !Array.isArray(result.data.balances)){
                console.log('TRX bal ERR NONE FOUND')
                resolve([]);
            }

            try {
                if (!result.data.balances.map){
                    resolve([]);
                }
                else {
                    result.data.balances.map((bal) => {
                        if (bal.name === 'TRX'){
                            bal.balance += (result.data.frozen.total / 1000000)
                        }
                    });
                }
            } catch (error) {
                console.log('TRX ERR', error)
                resolve([]);
            }

            resolve(result.data.balances)
        });
    });
};