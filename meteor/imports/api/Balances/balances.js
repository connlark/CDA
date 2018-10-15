import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';

BalancesSchema = new SimpleSchema({
    userId: {
        type: String
    },
    balanceData:{
        type: Array
    },
    'balanceData.$': {
        type: Object
    },
    createdAt: {
        type: Date,
        label: "Date Balance Added to System",
        autoValue: function() {
        if ( this.isInsert ) {
            return new Date;
        }
        },
        optional: true,
    }
});

export const Balances = new Mongo.Collection('balances');
export const CoinExBalances = new Mongo.Collection('coinexbalances');
export const TRXBalances = new Mongo.Collection('trxbalances');
export const BalanceErrors = new Mongo.Collection('balanceerrors');

//Balances.attachSchema( BalancesSchema );

