import { Meteor } from "meteor/meteor";

import { Balances } from '../../api/Balances/balances';
import { BalanceHistory } from '../../api/BalanceHistory/balanceHistory';
import { getTRXBalances } from '../../../lib/tronscanapi';

const cc = require('cryptocompare');
const Coinex = require('coinex.com');
import  agent  from './apns'


Meteor.startup(() => {
        SyncedCron.add({
            name: '💵💵💵💵💵💵💵',
            schedule: function(parser) {
              // parser is a later.parse object
              return parser.text('every 15 min');
            },
            job: () => {
                const users = Meteor.users.find({}).fetch();
                for (let index = 0; index < users.length; index++) {
                    const user = users[index];
                    if(user.profile && user.profile[0] && user.profile[0].token){
                        if (user.profile.some(e => typeof(e.TRXAddress) !== 'undefined')) {
                            user.profile.map((ob) => {
                                if (typeof(ob.TRXAddress) !== 'undefined'){
                                    doTheDirty(user.profile[0].token, user._id, ob.TRXAddress)
                                }
                            });
                        }
                        else {
                            doTheDirty(user.profile[0].token, user._id)
                        }
                    }
                    else {
                        if (user.profile.some(e => typeof(e.TRXAddress) !== 'undefined')) {
                            user.profile.map((ob) => {
                                if (typeof(ob.TRXAddress) !== 'undefined'){
                                    doTheDirtyONLYTRX(user._id, ob.TRXAddress)
                                }
                            });
                        }
                    }
                }
                return 1;
            }
        });

        SyncedCron.start();
});

export const doTheDirty = (apiToken, userId, TRXAddress) => {
    if (!apiToken && TRXAddress){
        doTheDirtyONLYTRX(userId, TRXAddress);
        return;
    }
    else if (!apiToken){
        return;
    }

    const coinex = new Coinex(apiToken.apiKey, apiToken.secretKey);

    coinex.balance().then((response) => {
        let ownedCoins = [];
        balances = Object.keys(response).map((key) => {
            const availableBalance = response[key].available + response[key].frozen;
            if (availableBalance > 0){
                ownedCoins.push(key);
                return {coin: key, balance: availableBalance};
            }
            return 'null';
        });
        balances = balances.filter((obj) => (obj != 'null'));
        
        findCoinBalanceInfo(ownedCoins,balances, userId);
        if (TRXAddress){
            doTheDirtyONLYTRX(userId, TRXAddress, false, true);
        }
         
    })
    .catch(err => console.error(err.code, err.message)); 
}

export const doTheDirtyONLYTRX = (userId, TRXAddress, shouldNOTCalcDivs, hack) => {
    let ownedCoins = [];
    let balances = [];
    if (TRXAddress){
        getTRXBalances(TRXAddress).then((e) => {
            e = e.filter((coin) => coin.name === 'TRX' || coin.name === 'SEED');
            e.map((o) => {
                if (balances.some(e => e.coin === o.name)) {
                    for (let index = 0; index < balances.length; index++) {
                        const element = balances[index];
                        if (element.coin === o.name){
                            if (hack){
                                balances[index].balance = o.balance;
                            }
                            else {
                                balances[index].balance += o.balance;
                            }
                        }
                    }
                }
                else {
                    balances.push({coin: o.name, balance: o.balance});
                    ownedCoins.push(o.name)
                }    
            });

            let dta = Balances.findOne({userId: userId});
            let hackdata = [];
            let hasChanged = [];
            if (typeof(dta) !== 'undefined'){
                for (let index = 0; index < dta.balanceData.length; index++) {
                    const element = dta.balanceData[index];
                    const curr = balances.filter((e) => e.coin === element.coin);
                    if (curr[0] && element.coin === curr[0].coin){
                        hasChanged.push(element.coin);
                        if (hack){
                            dta.balanceData[index].balance = curr[0].balance;
                        }
                        else {
                            dta.balanceData[index].balance += curr[0].balance;
                        }
                    }
                }
                if (hack && hasChanged.length !== balances.length){
                    balances.map((m) => {
                        if (hasChanged.indexOf(m.coin) < 0){
                            dta.balanceData.push(m)
                        }
                    });
                }
            }
            else {
                hackdata = balances;
            }

            //findCoinBalanceInfo(ownedCoins, dta ? dta.balanceData:hackdata, userId, shouldNOTCalcDivs);
        });
    }
}

const findCoinBalanceInfo = (ownedCoins, balances, userId, shouldNOTCalcDivs) => {
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
                            balObj.ccurl = coinList.Data[balObj.coin].Url;
                            balObj.imgUrl = 'https://www.cryptocompare.com'+coinList.Data[balObj.coin].ImageUrl;
                            balObj.fullName = coinList.Data[balObj.coin].FullName;
                        }
                        return balObj;
                    }); 
                }).finally(() => {
                    let dta = Balances.findOne({userId: userId});
                    if (typeof(dta) === 'undefined'){
                        Balances.insert(
                            {   userId: userId,
                                balanceData: balances,
                                createdAt: new Date
                            }
                        );
                    }
                    else { 
                        if (!dta.balanceData || isSameBalance(dta.balanceData, balances)){
                            console.log('same or corrupt data');
                        }
                        else {
                            const divCalc = dividendCalc(dta.balanceData, balances);
                            if (!shouldNOTCalcDivs && divCalc.coinDeltas.length !== 0){
                                sendNotif(userId,divCalc);
                            }
                            
                            const user = Meteor.users.findOne(userId);
                            const balHistory = BalanceHistory.findOne({userId: userId});
                            if (balHistory && divCalc.coinDeltas.length !== 0){
                                if (shouldNOTCalcDivs) return;
                                balHistory.history.push({date: new Date, divData: divCalc})
                                BalanceHistory.update(
                                    {userId: userId},
                                    {
                                        userId: userId,
                                        history: balHistory.history,
                                        createdAt: new Date
                                    }
                                );

                            }
                            else {
                                if (shouldNOTCalcDivs || divCalc.coinDeltas.length === 0) return;
                                const history = [];
                                history.push({date: new Date, divData: divCalc});
                                BalanceHistory.insert(
                                    {   
                                        userId: userId,
                                        history: history,
                                        createdAt: new Date
                                    }
                                );
                            }

                            Balances.update(
                                {userId: userId},
                                {
                                    userId: userId,
                                    balanceData: balances,
                                    divCalc: divCalc,
                                    createdAt: new Date
                                }
                            );
                        }
                    } 
                });
            })
            .catch(console.error);
}

const isSameBalance = (foo, bar) => {
    if (foo.length !== bar.length) return false;
    for (let i = 0; i < foo.length; i++) {
        if (foo[i].balance !== bar[i].balance){
            console.log(foo[i].coin+' baL:'+foo[i].balance,bar[i].balance);
            return false;
        }
    }
    return true;
}

const dividendCalc = (old, newbal) => {
    const returner = [];
    let valueUSD = 0;

    for (let i = 0; i < newbal.length; i++) {
        const oldVal = old.find((element) => {
            return element.coin === newbal[i].coin;
        });
        if (oldVal){
            const delta = newbal[i].balance-oldVal.balance;
            if(delta > 0.00000001){
                if (newbal[i].USDprice){
                    valueUSD = valueUSD + delta * Number(newbal[i].USDprice);
                }
                else if (newbal[i].coin === 'USDT'){
                    valueUSD = valueUSD + Number(delta);
                }
                returner.push({coin: newbal[i].coin, delta: newbal[i].balance-oldVal.balance})
            }
        }
        else {
            if (newbal[i].USDprice){
                valueUSD = valueUSD + Number(newbal[i].USDvalue);
            }
            else if (newbal[i].coin === 'USDT'){
                valueUSD = valueUSD + Number(newbal[i].balance);
            }
            returner.push({coin: newbal[i].coin, delta: newbal[i].balance})
        }
    }
    return {coinDeltas: returner, USDdelta: Number(valueUSD).toFixed(8)};
}

const doParse = (e) => {
    let out = '';
    if (!e){
        return '';
    }
    e.map((o) => {
        out += o.coin + '~ ' + o.delta +'\n';
    })
    return out;
}

//'TRrmPbRy6Eeq3iTER'
const sendNotif = (userId, divCalc) => {
    const user = Meteor.users.findOne(userId);
    if (!user.pushToDevices || user.pushToDevices.length === 0) return;

    user.pushToDevices.map((device) => {
        const token = device.token;
        
        agent.createMessage()
        .set({
            extra: 123,
        })
        .device(token)
        .alert(`💵 $${divCalc.USDdelta}\n\ncoindeltas:\n${doParse(divCalc.coinDeltas)}`)
        .send(function (err) {
            if (err) { console.log(err) }
            else { console.log('APN msg sent successfully!'); }
        });
    });
}

