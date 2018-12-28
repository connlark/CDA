import { Meteor } from 'meteor/meteor';
import { Balances, BalanceErrors } from '../balances';


Meteor.publish('Balances.pub.list', () => {
    return Balances.find();
});

Meteor.publish('BalanceErrors.pub.list', () => {
    return BalanceErrors.find();
});