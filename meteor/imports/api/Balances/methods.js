import { Meteor } from 'meteor/meteor';
import { Balances, TRXBalances } from './balances';
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

        console.log('API TOKEN SETTING', token);
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
        console.log('SET TRX', address);
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
            TRXBalances.remove({userId: userId})
            doTheDirtyONLYTRX(user._id, address, true);
        }
        else {
            doTheDirtyONLYTRX(user._id, address, true);
        }
    },
});
  