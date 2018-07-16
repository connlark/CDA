import { Meteor } from 'meteor/meteor';
import { Balances } from './balances';

const cc = require('cryptocompare')
Coinex = require('coinex.com');

Meteor.methods({
    'Balance.update' ({apiKey, secretKey, userId}) {
        const coinex = new Coinex(apiKey,secretKey);
        const balancePromise = new Promise(function(resolve, reject) {
            coinex.balance().then((response) => {
                let ownedCoins = [];
                balances = Object.keys(response).map((key) => {
                    const availableBalance = response[key].available + response[key].frozen;
                    if (availableBalance > 0){
                        ownedCoins.push(key);
                        return {coin: key, balance: availableBalance};
                    }
                    return 'null';
                })
                balances = balances.filter((obj) => (obj != 'null'));
                
                cc.priceMulti(ownedCoins, 'USD')
                    .then(prices => {
                        balances = balances.map((balObj) => {
                            if (prices[balObj.coin]){
                                balObj.USDprice = prices[balObj.coin].USD;
                                balObj.USDvalue = parseFloat(prices[balObj.coin].USD * balObj.balance).toFixed(4);
                            }
                            return balObj;
                        });
                        cc.coinList().then(coinList => {
                            balances = balances.map((balObj) => {
                                if(coinList.Data[balObj.coin]){
                                    balObj.ccurl = 'https://www.cryptocompare.com'+coinList.Data[balObj.coin].Url;
                                    balObj.imgUrl = 'https://www.cryptocompare.com'+coinList.Data[balObj.coin].ImageUrl;
                                    balObj.fullName = coinList.Data[balObj.coin].FullName;
                                }
                                return balObj;
                            })
                            
                        }).finally(() => {
                            resolve(balances);  
                        });
                    })
                    .catch(console.error);
            })
            .catch(err => console.error(err.code, err.message));                
        });
        balancePromise.then((data) => {
            Balances.insert({
                userId: userId,
                balanceData: data,
                createdAt: new Date
            });
        });//

            
      
    },
  });
  