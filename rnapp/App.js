import React, { Component } from 'react';
import { NativeModules, Text } from 'react-native';
import PushNotification from 'react-native-push-notification';
import Meteor, { createContainer } from 'react-native-meteor';
import { createStore, applyMiddleware } from 'redux';
import { Provider, connect } from 'react-redux';
import {
  createStackNavigator,
} from 'react-navigation';
import codePush from "react-native-code-push";

import store from './app/config/store';
import {AppNavigator} from './app/config/router';
import { recieveNotification } from './app/Actions/notificationLogic'
import { recieveData } from './app/Actions/meteorData';

import { storeItem, retrieveItem } from './app/lib';

if (Text.defaultProps == null) Text.defaultProps = {};
Text.defaultProps.allowFontScaling = false;
//let METEOR_URL = 'ws://104.154.43.177:3000/websocket';
//let METEOR_URL = 'ws://192.168.8.230:3000/websocket';
//let METEOR_URL = 'wss://singularityllc.meteorapp.com/websocket';
let METEOR_URL = 'ws://localhost:3000/websocket';

const ADDED = 'ddp/added';
const CHANGED  = 'ddp/changed';
const REMOVED = 'ddp/removed';

if (__DEV__) {
  process.env.REACT_NAV_LOGGING = false
  NativeModules.DevSettings.setIsDebuggingRemotely(true);
  NativeModules.DevSettings.setHotLoadingEnabled(true)
}

if (process.env.NODE_ENV === 'production') {
  //METEOR_URL = 'ws://73.246.190.116:3000/websocket'; 
  METEOR_URL = 'ws://104.154.43.177:3000/websocket'
}

Meteor.connect(METEOR_URL);

Meteor.ddp.on('added', (payload) => {
  store.dispatch(recieveData({type: ADDED, payload }));
});

Meteor.ddp.on('changed', (payload) => {
  store.dispatch(recieveData({type: CHANGED, payload }));
});

Meteor.ddp.on('removed', (payload) => {
  store.dispatch(recieveData({type: REMOVED, payload }));
});

PushNotification.configure({
  // (optional) Called when Token is generated (iOS and Android)
  onRegister(data) {
    setTimeout(() => {
      retrieveItem('notificationsPushToken').then((e) => {
        if (!e || e.token !== data.token){
          storeItem('notificationsPushToken', data);
        }
      });
      Meteor.call('notifications.set.pushToken', data, err => {
        //if (err) { alert(`notifications.set.pushToken: ${err.reason}`); }
      });
    }, 500);
  },

  // (required) Called when a remote or local notification is opened or received
  onNotification(notification) {
    alert('ss')
    store.dispatch(recieveNotification(notification))
  },

  // IOS ONLY (optional): default: all - Permissions to register.
  permissions: {
    alert: true,
    badge: false,
    sound: false,
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





const RNApp = (props) => {
  const { status, user, loggingIn } = props;
  return  <Provider store={store}>
            <AppNavigator // persistenceKey={"HELLO"} 
            />
          </Provider>
};


let codePushOptions = { updateDialog: true, checkFrequency: codePush.CheckFrequency.ON_APP_RESUME };


export default codePush(RNApp);
