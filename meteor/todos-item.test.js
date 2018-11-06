
/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import chai from 'chai';
import { resetDatabase } from 'meteor/xolvio:cleaner';

import { getTRXBalances } from './lib/tronscanapi';


// NOTE: Before writing a method like this you'll want to double check
// that this file is only going to be loaded in test mode!!
Meteor.methods({
  'test.resetDatabase': () => resetDatabase(),
});


describe('Endpoint Tests', function () {
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
  })