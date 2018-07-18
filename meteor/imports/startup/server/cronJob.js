import { Meteor } from "meteor/meteor";
import { Balances } from '../../api/Balances/balances';
const cc = require('cryptocompare');
const Coinex = require('coinex.com');
import  agent  from './apns'

Meteor.startup(() => {
    const coinex = new Coinex('BCD13880BF124F15810CC95516B9687F','175DB51424B342EF827C0F03DEC658AB6A2FF4E78200C904');
        let balances = [];

        SyncedCron.add({
            name: '💵💵💵💵💵💵💵',
            schedule: function(parser) {
              // parser is a later.parse object
              return parser.text('every 15 sec');
            },
            job: () => {
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
                                const dta = Balances.findOne({userId:'hifff'});
                                if (typeof(dta) === 'undefined'){
                                    Balances.insert(
                                        {   userId: 'hifff',
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
                                        sendNotif('TRrmPbRy6Eeq3iTER',divCalc);
    
                                        Balances.update(
                                            {userId: 'hifff'},
                                            {
                                                userId: 'hifff',
                                                balanceData: balances,
                                                divCalc: divCalc,
                                                createdAt: new Date
                                            });
                                    }
                                } 
                            });
                        })
                        .catch(console.error);
                })
                .catch(err => console.error(err.code, err.message)); 
                return 1;
            }
        });

        SyncedCron.start();
});

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
                valueUSD = valueUSD + newbal[i].USDprice;
            }
            returner.push({coin: newbal[i].coin, change: newbal[i].balance})
        }
    }
    return {coinDeltas: returner, USDdelta: valueUSD};
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

