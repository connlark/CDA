import { Meteor } from 'meteor/meteor';
import agent from '../../startup/server/apns'
const SET_PUSH_TOKEN = 'notifications.set.pushToken';
const SEND_APN_MSG = 'notifications.send.APNMsg';

Meteor.methods({
  'notifications.set.pushToken'({token, os}) {
    const userId = this.userId;
    if (!userId) {
      throw new Meteor.Error(SET_PUSH_TOKEN, 'Must be logged in to set push notification token.');
    }

    Meteor.users.update(userId, {
      $addToSet: { pushToDevices: { token, os } },
    });
  },
  'notifications.send.APNMsg'({sendToUserId}) {
    const user = Meteor.users.findOne(sendToUserId);
    user.pushToDevices.map((device) => {
      const token = device.token;
      
      agent.createMessage()
        .set({
          extra: 123,
        })
        .device(token)
        .alert('This is an alert')
        .send(function (err) {
          if (err) { throw new Meteor.Error(SEND_APN_MSG, err.message); }
          else { console.log('APN msg sent successfully!'); }
        });
    })
  },
  'notifications.send.APNMsg.TOALL'() {
    const users = Meteor.users.find();
    users.map((user) => {
      user.pushToDevices.map((device) => {
        const token = device.token;
        
        agent.createMessage()
          .set({
            extra: 123,
          })
          .device(token)
          .alert('This is an alert')
          .send(function (err) {
            if (err) { throw new Meteor.Error(SEND_APN_MSG, err.message); }
            else { console.log('APN msg sent successfully!'); }
          });
      });
    });
  },
});