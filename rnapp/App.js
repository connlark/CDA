import React, { Component } from 'react';
import PushNotification from 'react-native-push-notification';
import Meteor, { createContainer } from 'react-native-meteor';
import { createStore, applyMiddleware } from 'redux';
import { Provider, connect } from 'react-redux';
import {addNavigationHelpers} from 'react-navigation';
import {
  reduxifyNavigator,
  createReactNavigationReduxMiddleware,
  createNavigationReducer,
} from 'react-navigation-redux-helpers';
import {
  createStackNavigator,
} from 'react-navigation';

import store from './config/store';
import Swiper from './screens/Swiper';
import {AppNavigator} from './config/router';

let METEOR_URL = 'ws://192.168.8.230:3000/websocket';
//let METEOR_URL = 'ws://192.168.8.230:3000/websocket';
//let METEOR_URL = 'wss://jbum.meteorapp.com/websocket';
if (process.env.NODE_ENV === 'production') {
  METEOR_URL = 'ws://73.246.190.116:3000/websocket'; // your production server
}

Meteor.connect(METEOR_URL);

const App = reduxifyNavigator(AppNavigator, "root");

const mapStateToProps = (state) => ({
  state: state.nav,
});

const AppWithNavigation = connect(mapStateToProps)(App);




const RNApp = (props) => {
  const { status, user, loggingIn } = props;

  if (user && user.username) {
    PushNotification.configure({
        // (optional) Called when Token is generated (iOS and Android)
        onRegister(data) {
          Meteor.call('notifications.set.pushToken', data, err => {
            if (err) { console.log(`notifications.set.pushToken: ${err.reason}`); }
          });
        },
    
        // (required) Called when a remote or local notification is opened or received
        onNotification(notification) {
          alert(`onNotification ${React.Platform.OS}`);
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
  }
  return  <Provider store={store}>
            <AppWithNavigation
            />
          </Provider>
};




export default RNApp;
