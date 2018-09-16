import { Meteor } from "meteor/meteor";
import { Accounts } from 'meteor/accounts-base';
import { Random } from 'meteor/random'

import {Balances} from '../../api/Balances/balances';
import {BalanceHistory} from '../../api/BalanceHistory/balanceHistory';
import  agent  from './apns'
import {findCoinBalanceInfo} from './cronJob'
const SEND_APN_MSG = 'notifications.send.APNMsg';

Meteor.startup(()=> {
    const cc = require('cryptocompare')
 
// Usage:
    cc.coinList().then(coinList => {
        const coinDatas = coinList.Data//.sort((a,b) => Number(b.SortOrder)-Number(a.SortOrder) ).splice(0,200);
        const coinTickerListER = Object.keys(coinDatas);
        let coinTickerList = [];
        coinTickerListER.map((key) => {
            if (Number(coinDatas[key].SortOrder) < 50){
                coinTickerList.push(key)
            }
        })
        
        console.log(coinTickerList)
        coinTickerList = ['BTC', 'ETH','EOS','LTC','USDT','CET','XMR', 'ADA', 'TRX','VET','NANO','CDY','DASH','DOGE']
        const divNumber = [3,8,6,3,5,12,9]
    

        const user = Meteor.users.findOne({username: 'seed'});

        if (!user){
            Accounts.createUser({
                username: 'seed',
                password: 'seed',
            });

            const coins = ['BCH', 'BTC', 'USDT', 'CET', 'ETH', 'NANO', 'LTC', 'NEO', 'ETC', 'EOS']
            let history = [];



            for (let index = 0; index < 90; index++) {
                let coinDeltas = [];
                let divData = {};
                const numberOfDeltas = Random.choice(divNumber);
                for (let index = 0; index < numberOfDeltas; index++) {
                    const coin = Random.choice(coinTickerList);
                    const delta = Math.floor(Math.random() * 1000) + 1;
                    const valueUSD = Math.floor(Math.random() * 1000) + 1;

                    coinDeltas.push({coin, delta, valueUSD});
                    
                }

                divData.USDdelta = Math.floor(Math.random() * 1000) + 1;
                divData.coinDeltas = coinDeltas;

                history.push({
                    date: new Date(+(new Date()) - Math.floor(Math.random()*10000000000)),
                    divData
                });           
            }




            const user = Meteor.users.findOne({username: 'seed'});
            const userId = user._id;

            BalanceHistory.insert(
                {   
                    userId: userId,
                    history: history,
                    createdAt: new Date
                }
            );

            let balances = [];
            const balanceTickers = [];
            for (let index = 0; index < coinTickerList.length; index++) {
                const coin = coinTickerList[index];
                balanceTickers.push(coin);
                balances.push({
                    coin,
                    balance: Math.floor(Math.random() * 1000) + 1,
                });   
            }
            console.log(balanceTickers)
            findCoinBalanceInfo(balanceTickers,balances,userId)

        }
    });



    /*user.pushToDevices.forEach(device => {
      const token = device.token;
      console.log(token)
      setTimeout(() => {
        agent.createMessage()
        .set({
          extra: 123,
        })
        .device(token)
        .alert('This is an alert')
        .send(function (err) {
          if (err) { console.log(err) }
          else { console.log('APN msg sent successfully!'); }
        });
      }, 1000);     
    });*/



    if (Meteor.users.find().count() === 0) {
        console.log('Seeding Accounts DB...');
        var users = [
            {username:'user',password:'user' },
            {username:'dev',password:'dev' },
        ];
        _.each(users, (user) => {
            Accounts.createUser({
                username: user.username,
                password: user.password,
                profile: {
                    balanceHistory: []
                }
            });
        });  
    }
})
