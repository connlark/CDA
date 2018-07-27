import { Meteor } from 'meteor/meteor';
import {BalanceHistory } from '../balanceHistory';

Meteor.publish('BalanceHistory.pub.list', () => {
  return BalanceHistory.find();
});