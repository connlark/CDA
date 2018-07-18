import { Meteor } from "meteor/meteor";
import { Accounts } from 'meteor/accounts-base';

import  agent  from './apns'

const SEND_APN_MSG = 'notifications.send.APNMsg';

Meteor.startup(()=> {
    const user = Meteor.users.findOne('TRrmPbRy6Eeq3iTER');
    /*user.pushToDevices.forEach(device => {
      const token = device.token;
      console.log(token)
      setTimeout(() => {
        agent.createMessage()
        .set({
          extra: 123,
        })
        .device(token)
        .alert('This is an alert')
        .send(function (err) {
          if (err) { console.log(err) }
          else { console.log('APN msg sent successfully!'); }
        });
      }, 1000);     
    });*/



    if (Meteor.users.find().count() === 0) {
        console.log('Seeding Accounts DB...');
        var users = [
            {username:'user',password:'user' },
            {username:'dev',password:'dev' },
        ];
        _.each(users, (user) => {
            Accounts.createUser({
                username: user.username,
                password: user.password,
                profile: {
                    balanceHistory: []
                }
            });
        });  
    }
})
