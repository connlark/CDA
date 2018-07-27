import { Meteor } from 'meteor/meteor';
import { Balances, BalanceHistory } from '../balances';


Meteor.publish('Balances.pub.list', () => {
    return Balances.find();
});