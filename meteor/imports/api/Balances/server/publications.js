import { Meteor } from 'meteor/meteor';
import { Balances } from '../balances';


Meteor.publish('Balances.pub.list', () => {
    return Balances.find();
  });
