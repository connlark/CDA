import { Meteor } from "meteor/meteor";
import { Balances } from '../../api/Balances/balances';
import { BalanceHistory } from '../../api/BalanceHistory/balanceHistory';

const cc = require('cryptocompare');
const Coinex = require('coinex.com');
import  agent  from './apns'


Meteor.startup(() => {
        let balances = [];

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
                        doTheDirty(user.profile[0].token, user._id)
                    }
                }
                
                return 1;
            }
        });

        SyncedCron.start();
});

export const doTheDirty = (apiToken, userId) => {
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
                            balObj.ccurl = coinList.Data[balObj.coin].Url;
                            balObj.imgUrl = 'https://www.cryptocompare.com'+coinList.Data[balObj.coin].ImageUrl;
                            balObj.fullName = coinList.Data[balObj.coin].FullName;
                        }
                        return balObj;
                    }); 
                }).finally(() => {
                    const dta = Balances.findOne({userId: userId});
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
                            sendNotif(userId,divCalc);

                            const user = Meteor.users.findOne(userId);
                            const balHistory = BalanceHistory.findOne({userId: user._id});

                            if (balHistory){
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
    })
    .catch(err => console.error(err.code, err.message)); 
}

const isSameBalance = (foo, bar) => {
    if (foo.length !== bar.length) return false;
    for (let i = 0; i < foo.length; i++) {
        if (foo[i].balance !== bar[i].balance){
            console.log(foo[i].balance,bar[i].balance);
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
                    valueUSD = valueUSD + delta * newbal[i].USDprice;
                    console.log(delta * newbal[i].USDprice);
                    console.log(newbal[i].USDprice)
                    console.log(delta)
                }
                returner.push({coin: newbal[i].coin, delta: newbal[i].balance-oldVal.balance})
            }
        }
        else {
            if (newbal[i].USDprice){
                valueUSD = valueUSD + newbal[i].USDvalue;
            }
            returner.push({coin: newbal[i].coin, change: newbal[i].balance})
        }
    }
    return {coinDeltas: returner, USDdelta: Number(valueUSD).toFixed(8)};
}

//'TRrmPbRy6Eeq3iTER'
const sendNotif = (userId, divCalc) => {
    const user = Meteor.users.findOne(userId);
    user.pushToDevices.forEach(device => {
        const token = device.token;
        
        agent.createMessage()
        .set({
            extra: 123,
        })
        .device(token)
        .alert(`💵${divCalc.USDdelta} # of coins: ${divCalc.coinDeltas.length}`)
        .send(function (err) {
            if (err) { console.log(err) }
            else { console.log('APN msg sent successfully!'); }
        });
    });

}

