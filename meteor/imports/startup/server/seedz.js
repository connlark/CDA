import { Meteor } from "meteor/meteor";
import { Accounts } from 'meteor/accounts-base';

import { Balances } from '../../api/Balances/balances';
const cc = require('cryptocompare');
const Coinex = require('coinex.com');
var schedule = require('node-schedule');

// Warn if overriding existing method
if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});


Meteor.startup(()=> {
    if (Meteor.users.find().count() === 0) {
        console.log('Seeding Accounts DB...');
        var users = [
            {username:'user',password:'user', uri: 'https://s3.us-east-2.amazonaws.com/verbindung/user.png', phone: '1234567890'},
            {username:'dev',password:'dev',  uri: 'https://s3.us-east-2.amazonaws.com/verbindung/seedz/AppLOGOVector.png', phone: '1234567890'},
            {username:'Carla',password:'carla',  uri: 'https://s3.us-east-2.amazonaws.com/verbindung/seedz/+carla.jpg', phone: '1234567890'},
            {username:'Marisa',password:'marisa',uri: 'https://s3.us-east-2.amazonaws.com/verbindung/seedz/marisa.jpg', phone: '1234567890'},
            {username:'Samuel',password:'samuel',  uri: 'https://s3.us-east-2.amazonaws.com/verbindung/seedz/samuel.jpg', phone: '1234567890'},
            {username:'Ryan',password:'ryan',  uri: 'https://s3.us-east-2.amazonaws.com/verbindung/seedz/ryan.jpg', phone: '1234567890'},
            {username:'Connor',password:'connor',  uri: 'https://s3.us-east-2.amazonaws.com/verbindung/seedz/connor.jpg', phone: '1234567890'},
            {username:'George',password:'george',  uri: 'https://s3.us-east-2.amazonaws.com/verbindung/seedz/george.jpg', phone: '1234567890'},
            {username:'Adrian',password:'adrian',  uri: 'https://s3.us-east-2.amazonaws.com/verbindung/seedz/adrian.jpg', phone: '1234567890'},
            {username:'Raven',password:'raven',  uri: 'https://s3.us-east-2.amazonaws.com/verbindung/seedz/raven.jpg', phone: '1234567890'},
            {username:'Tatiana',password:'tatiana',  uri: 'https://s3.us-east-2.amazonaws.com/verbindung/seedz/tatiana.jpg', phone: '1234567890'},
            {username:'Jay_Wen',password:'jay_wen',  uri: 'https://s3.us-east-2.amazonaws.com/verbindung/seedz/jay+wen.jpg', phone: '1234567890'},
            {username:'Esther',password:'esther',  uri: 'https://s3.us-east-2.amazonaws.com/verbindung/seedz/esther.jpg', phone: '1234567890'},

        ];
        _.each(users, (user) => {
            Accounts.createUser({
                username: user.username,
                password: user.password,
                profile: {
                  uri: user.uri,
                  phone: user.phone,
                  shared: []
                }

            });
        });


       
    }
    if (Balances.find().count() > -1){
        console.log('Seeding Balances DB...');
        
        const coinex = new Coinex('B2A0B5726FA6465F98014352A865380F','0AC5F30B3089448C8B0F319451DECFCDB051E52BCE6565E6');
        let balances = [];

        SyncedCron.add({
            name: '💵💵💵💵💵💵💵',
            schedule: function(parser) {
              // parser is a later.parse object
              return parser.text('every 10 sec');
            },
            job: function() {
                recursiveFun()
                return 1;
            }
          });

        SyncedCron.start();

        const recursiveFun = () => {
            console.log(new Date);

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
                                if (isSameBalance(dta.balanceData, balances)){
                                    console.log('same')
                                }
                                else {
                                    const divCalc = dividendCalc(dta.balanceData, balances);

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
        }
    }
    const params = {
        apiKey: 'ff',
        secretKey: 'dd',
        userId: 'ss'
    }
})

const isSameBalance = (foo, bar) => {
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
    for (let i = 0; i < newbal.length; i++) {
        const oldVal = old.find((element) => {
            return element.coin === newbal[i].coin;
        });
        if (oldVal){
            const delta = newbal[i].balance-oldVal.balance;
            if(delta > 0.00000001){
                returner.push({coin: newbal[i].coin, change: newbal[i].balance-oldVal.balance})
            }
        }
        else {
            returner.push({coin: newbal[i].coin, change: newbal[i]})
        }
    }
    return returner;
}
