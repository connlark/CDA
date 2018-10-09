import { Meteor } from "meteor/meteor";

import { Balances, TRXBalances, CoinExBalances } from '../../api/Balances/balances';
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
              return parser.text('every 5 min');
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
            doTheDirtyONLYTRX(userId, TRXAddress, false);
        }
         
    })
    .catch(err => console.error(err.code, err.message)); 
}

export const doTheDirtyONLYTRX = (userId, TRXAddress, shouldNOTCalcDivs) => {
    let ownedCoins = [];
    let balances = [];

    if (TRXAddress){
        getTRXBalances(TRXAddress).then((e) => {
            e = e.filter((coin) => coin.name === 'TRX' || coin.name === 'SEED');
            e.map((o) => {
                    balances.push({coin: o.name, balance: o.balance});
                    ownedCoins.push(o.name)
                }    
            );

            findCoinBalanceInfoTRX(ownedCoins, balances, userId, shouldNOTCalcDivs);
        });
    }
}

export const findCoinBalanceInfoTRX = (ownedCoins, balances, userId, shouldNOTCalcDivs) => {
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
                    let dta = TRXBalances.findOne({userId: userId});
                    if (typeof(dta) === 'undefined'){

                        TRXBalances.insert(
                            {   userId: userId,
                                balanceData: balances,
                                createdAt: new Date
                            }
                        );
                        mergeBalances(userId)
                    }
                    else { 
                        if (!dta.balanceData || isSameBalance(dta.balanceData, balances)){
                            console.log('same or corrupt data');
                        }
                        else {
                            const divCalc = dividendCalc(dta.balanceData, balances);
                            const divId = String(Math.random()).substring(2);
                            const balHistory = BalanceHistory.findOne({userId: userId});

                            if (!shouldNOTCalcDivs && divCalc.coinDeltas.length !== 0){
                                sendNotif(userId,divCalc,divId);
                            }

                            TRXBalances.update(
                                {userId: userId},
                                {
                                    userId: userId,
                                    balanceData: balances,
                                    divCalc: divCalc,
                                    createdAt: new Date
                                }
                            );
                            mergeBalances(userId)
                            
                            if (balHistory && divCalc.coinDeltas.length !== 0){
                                if (shouldNOTCalcDivs) return;
                                balHistory.history.push({date: new Date, divData: divCalc, divId: divId})
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
                                history.push({date: new Date, divData: divCalc, divId: divId});
                                BalanceHistory.insert(
                                    {   
                                        userId: userId,
                                        history: history,
                                        createdAt: new Date
                                    }
                                );
                            }
                        }
                    } 
                });
            })
            .catch(console.error);
}

export const findCoinBalanceInfo = (ownedCoins, balances, userId, shouldNOTCalcDivs) => {
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
                    let dta = CoinExBalances.findOne({userId: userId});
                    if (typeof(dta) === 'undefined'){
                        CoinExBalances.insert(
                            {   userId: userId,
                                balanceData: balances,
                                createdAt: new Date
                            }
                        );
                        mergeBalances(userId);
                    }
                    else { 
                        if (!dta.balanceData || isSameBalance(dta.balanceData, balances)){
                            console.log('same or corrupt data');
                        }
                        else {
                            const divCalc = dividendCalc(dta.balanceData, balances);
                            const divId = String(Math.random()).substring(2);
                            const balHistory = BalanceHistory.findOne({userId: userId});

                            if (!shouldNOTCalcDivs && divCalc.coinDeltas.length !== 0){
                                sendNotif(userId,divCalc,divId);
                            }
                            
                            if (balHistory && divCalc.coinDeltas.length !== 0){
                                if (shouldNOTCalcDivs) return;
                                balHistory.history.push({date: new Date, divData: divCalc, divId: divId})
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
                                history.push({date: new Date, divData: divCalc, divId: divId});
                                BalanceHistory.insert(
                                    {   
                                        userId: userId,
                                        history: history,
                                        createdAt: new Date
                                    }
                                );
                            }

                            CoinExBalances.update(
                                {userId: userId},
                                {
                                    userId: userId,
                                    balanceData: balances,
                                    divCalc: divCalc,
                                    createdAt: new Date
                                }
                            );
                            mergeBalances(userId);
                        }
                    } 
                });
            })
            .catch(console.error);
}

const mergeBalances = (userId) => {
    Meteor.setTimeout(() => {
        let dtaTRX = TRXBalances.findOne({userId: userId});
        let dtaCX = CoinExBalances.findOne({userId: userId});
        let currBal = Balances.findOne({userId: userId});
        let theMerged = [];

        if (dtaTRX && dtaCX) {
            theMerged = dtaCX.balanceData;
            dtaTRX.balanceData.map((item) => {
                let isDup = false;
                theMerged.map((other) => {
                    if (item.coin === other.coin){
                        isDup = true;
                        other.balance += item.balance;
                        other.USDvalue = Number(item.USDvalue) + Number(other.USDvalue)
                    }
                });
                if (!isDup){
                    theMerged.push(item)
                }
            });

            if (currBal){
                Balances.update(
                    {userId: userId},
                    {
                        userId: userId,
                        balanceData: theMerged,
                        createdAt: new Date
                    }
                );
                console.log('UPDATE BALANCES BOTH')

                return;
            }
            console.log('ADDING BALANCES BOTH')
            Balances.insert(
                {userId: userId},
                {
                    userId: userId,
                    balanceData: theMerged,
                    createdAt: new Date
                }
            );
        }
        else if (dtaTRX){
            if (currBal){
                Balances.update(
                    {userId: userId},
                    {
                        userId: userId,
                        balanceData: dtaTRX.balanceData,
                        createdAt: new Date
                    }
                );
                console.log('UPDATE BALANCES JUST TRX')

                return;
            }
            console.log('ADDING BALANCES JUST TRX')
            Balances.insert(
                {userId: userId},
                {
                    userId: userId,
                    balanceData: dtaTRX.balanceData,
                    createdAt: new Date
                }
            );
        }
        else if (dtaCX){
            if (currBal){
                Balances.update(
                    {userId: userId},
                    {
                        userId: userId,
                        balanceData: dtaCX.balanceData,
                        createdAt: new Date
                    }
                );
                console.log('UPDATE BALANCES JUST COINEX')

                return;
            }
            console.log('ADDING BALANCES JUST COINEX')
            Balances.insert(
                {userId: userId},
                {
                    userId: userId,
                    balanceData: dtaCX.balanceData,
                    createdAt: new Date
                }
            );
        }
    }, 2000)
    
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
    let shouldChange = false;

    for (let i = 0; i < newbal.length; i++) {
        const oldVal = old.find((element) => {
            return element.coin === newbal[i].coin;
        });
        if (oldVal){
            const delta = newbal[i].balance-oldVal.balance;
            let deltaUSD = 0;

            if(delta > 0.00000001){
                if (newbal[i].USDprice){
                    valueUSD = valueUSD + delta * Number(newbal[i].USDprice);
                    deltaUSD += delta * Number(newbal[i].USDprice);
                }
                else if (newbal[i].coin === 'USDT'){
                    valueUSD = valueUSD + Number(delta);
                    deltaUSD += Number(delta);
                }
                returner.push({coin: newbal[i].coin, delta: newbal[i].balance-oldVal.balance, valueUSD: deltaUSD})
            }
            if(delta < 0){
                shouldChange = true;
            }
        }
        else {
            let deltaUSD = 0;
            const delta = newbal[i].balance;

            if (newbal[i].USDprice){
                valueUSD = valueUSD + Number(newbal[i].USDvalue);
                deltaUSD += delta * Number(newbal[i].USDprice);
            }
            else if (newbal[i].coin === 'USDT'){
                valueUSD = valueUSD + Number(newbal[i].balance);
                deltaUSD += Number(newbal[i].balance);
            }
            returner.push({coin: newbal[i].coin, delta: newbal[i].balance, valueUSD: deltaUSD})
        }
    }
    return {coinDeltas: returner, USDdelta: Number(valueUSD).toFixed(8), shouldChange};
}

const doParse = (e) => {
    let out = '';
    if (!e){
        return '';
    }
    e.map((o) => {
        if (o.coin.match(/BTC|BCH|ETH/)){
            out += o.coin + ' ~ ' + Number(o.delta).toFixed(8) +`\t💲 ${Number(o.valueUSD).toFixed(3)}\n`;
        }
        else {
            out += o.coin + ' ~ ' + Number(o.delta).toFixed(3) +`\t💲 ${Number(o.valueUSD).toFixed(3)}\n`;
        }
    })
    return out;
}

//'TRrmPbRy6Eeq3iTER'
const sendNotif = (userId, divCalc, divId) => {
    const user = Meteor.users.findOne(userId);
    if (!user.pushToDevices || user.pushToDevices.length === 0) return;

    const params = {
        sendToUserId: userId, 
        message: `💵 $${Number(divCalc.USDdelta).toFixed(3)}\n\n𝚫:\n\n${doParse(divCalc.coinDeltas)}`, 
        type: 'BalanceChange', 
        extraData: { divId:  divId }
    }

    Meteor.call('notifications.send.APNMsg', params);
}

