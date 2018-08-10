import { Meteor } from 'meteor/meteor';
import { Balances } from './balances';
import { doTheDirty } from '../../startup/server/cronJob';
const cc = require('cryptocompare')
Coinex = require('coinex.com');

Meteor.methods({
    'Balances.setAPI' (token){
        const user = Meteor.user();
        user.profile = [];

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
        doTheDirty(user.profile[0].token,user._id);
    },
  });