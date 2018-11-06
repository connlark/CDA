
/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import chai from 'chai';
import { resetDatabase } from 'meteor/xolvio:cleaner';

import { getTRXBalances } from './lib/tronscanapi';
import { doTheDirtyONLYTRX } from './imports/startup/server/cronJob'
import { Balances } from './imports/api/Balances/balances';
// NOTE: Before writing a method like this you'll want to double check
// that this file is only going to be loaded in test mode!!
Meteor.methods({
  'test.resetDatabase': () => resetDatabase(),
  'addUser': function (newUser) {
      userId = Accounts.createUser(newUser);
      return userId;
  },
  'getUser': function (email) {
      return Meteor.users.find({email: email}).fetch();
  },
  'findbal': function(id){
    return Balances.findOne({userId: id})

  },
  'Balances.setTRXAddressTEST' ({addr, _id}){
    const address = addr;
    let oldTRXAddress = null;
    console.log('SET TRX', address);
    const userId = _id;
    if (!userId || typeof(address) === 'undefined') {
        return;
    }
    let user = Meteor.users.find({_id: userId})
    user.profile = []
    user.profile.push({TRXAddress: address})
    Meteor.users.update(
        { _id: user._id }, { $set: {profile: user.profile}}
    );
    if (false){
        TRXBalances.remove({userId: userId})
        doTheDirtyONLYTRX(user._id, address, true);
    }
    else {
        doTheDirtyONLYTRX(userId, address, true);
    }
},
});

global.fetch = require("node-fetch");

describe('Endpoint Tests', function () {
    let testUser = {email: 'test@test.test', password: 'test'};

    beforeEach(function (done) {
      // We need to wait until the method call is done before moving on, so we
      // use Mocha's async mechanism (calling a done callback)
      Meteor.call('test.resetDatabase', done);
    });

    it('tests if DICKS coin === 1', async (done) => {
        const bals = await getTRXBalances('THnpUyyvzpFpGGk4fTDXtTj2K7svJx8kfn');
        bals.map((e) => {
          if (e.name === 'DICKS'){
            chai.assert.equal(e.balance, 1, 'balance.dicks equal `1`');
            done()
          }
        })
    });

    it('test DO THE DIRTY ONLY TRX', function (done){
      this.timeout(7500);

      const _id = Meteor.call('addUser', testUser)
      console.warn(_id)
      Meteor.call('Balances.setTRXAddressTEST', {addr: 'THnpUyyvzpFpGGk4fTDXtTj2K7svJx8kfn', _id})

      Meteor.setTimeout(() => {
        const _id = Meteor.call('getUser', testUser.email)
        const bbb = Balances.find({userId: _id}).fetch()
        console.log(bbb)
        bbb.map((coinObj) => {
          if (coinObj.coin === 'TRX'){
            chai.assert.equal(coinObj.fullName, 'TRON (TRX)', 'ASSERT EQUAL TRX == TRON (TRX) in coinOBJ');
            done()
          }
        })
        done()
      }, 7000);
    });
  })