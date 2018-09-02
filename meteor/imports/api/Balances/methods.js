import { Meteor } from 'meteor/meteor';
import { Balances } from './balances';
import { doTheDirty, doTheDirtyONLYTRX } from '../../startup/server/cronJob';
import { getTRXBalances } from '../../../lib/tronscanapi';

const cc = require('cryptocompare')
Coinex = require('coinex.com');

Meteor.methods({
    'Balances.setAPI' (token){
        const user = Meteor.user();
        if (!user.profile){
            user.profile = [];
        }

        console.log(token);
        const userId = this.userId;
        if (!userId || typeof(token) === 'undefined') {
            return;
        }
        user.profile.push({token: token})
        Meteor.users.update(
            { _id: user._id }, { $set: {profile: user.profile}}
          );
        doTheDirty(user.profile[0].token,user._id);
    },
    'Balances.checkForNewBalance' (token){
        const user = Meteor.user();
        let TRXAddress = null;

        if (user && user.profile && user.profile.some(e => typeof(e.TRXAddress) !== 'undefined')) {
            user.profile.map((ob) => {
                if (typeof(ob.TRXAddress) !== 'undefined'){
                    TRXAddress = ob.TRXAddress;
                }
            });
        }

        doTheDirty(user.profile[0].token,user._id, TRXAddress);
    },
    'Balances.setTRXAddress' (address){
        const user = Meteor.user();
        let oldTRXAddress = null;
        console.log(address);
        const userId = this.userId;
        if (!userId || typeof(address) === 'undefined') {
            return;
        }

        user.profile = user.profile.filter((e) => {
            if (typeof e.TRXAddress !== 'undefined'){
                oldTRXAddress = e.TRXAddress;
                return false;
            }
            return true;
        });

        user.profile.push({TRXAddress: address})
        Meteor.users.update(
            { _id: user._id }, { $set: {profile: user.profile}}
        );
        if (oldTRXAddress){
            removeTRXBalances(address, user._id).then(() => {
                doTheDirtyONLYTRX(user._id, address, true);
            });
        }
        else {
            doTheDirtyONLYTRX(user._id, address, true);
        }
    },
});

const removeTRXBalances = (address, userId) => {
    return new Promise((resolve, reject) => {
        getTRXBalances(address).then((bally) => {
            bally = bally.filter((coin) => coin.name === 'TRX' || coin.name === 'SEED');

            let dta = Balances.findOne({userId: userId});
            if (typeof(dta) !== 'undefined'){
                for (let index = 0; index < dta.balanceData.length; index++) {
                    const element = dta.balanceData[index];
                    const curr = bally.filter((e) => e.coin === element.coin);
                    if (curr[0] && element.name === curr[0].coin){
                        dta.balanceData[index].balance -= curr[0].balance;
                    }
                }
                Balances.update(
                    {userId: userId},
                    {
                        userId: userId,
                        balanceData: dta.balanceData,
                        divCalc: dta.divCalc,
                        createdAt: new Date
                    }
                );
            }
            resolve(true);
        })
    });
};

  