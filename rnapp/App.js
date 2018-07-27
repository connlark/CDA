import React, { Component } from 'react';

import Swiper from './screens/Swiper';
import PushNotification from 'react-native-push-notification';
import Meteor, { createContainer } from 'react-native-meteor';

Meteor.connect('ws://192.168.8.230:3000/websocket');


const RNApp = (props) => {
  const { status, user, loggingIn } = props;

  if (user && user.username) {
    PushNotification.configure({
        // (optional) Called when Token is generated (iOS and Android)
        onRegister(data) {
          Meteor.call('notifications.set.pushToken', data, err => {
            if (err) { alert(`notifications.set.pushToken: ${err.reason}`); }
          });
        },
    
        // (required) Called when a remote or local notification is opened or received
        onNotification(notification) {
          alert(`onNotification ${React.Platform.OS}`);
        },
    
        // IOS ONLY (optional): default: all - Permissions to register.
        permissions: {
          alert: true,
          badge: true,
          sound: true,
        },
    
        // Should the initial notification be popped automatically
        // default: true
        popInitialNotification: true,
    
        /**
          * IOS ONLY: (optional) default: true
          * - Specified if permissions will requested or not,
          * - if not, you must call PushNotificationsHandler.requestPermissions() later
          */
        requestPermissions: true,
      });   
  }
  return (<Swiper status={status} user={user}/>)
};

const MyApp = createContainer(() => {
              return {
                status: Meteor.status(),
                user: Meteor.user(),
                loggingIn: Meteor.loggingIn(),
              };
            }, RNApp);




export default MyApp;
