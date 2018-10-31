
import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import ReactNativeHaptic from 'react-native-haptic';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createBottomTabNavigator, createSwitchNavigator, createStackNavigator} from 'react-navigation';
import {createMaterialBottomTabNavigator} from 'react-navigation-material-bottom-tabs';

import Home from '../screens/Home';
import HistoryScreen from '../lib/historyHoc';
import Settings from '../screens/Settings';
import Stats from '../screens/Stats';
import AltHome from '../screens/AltHome';
import AltLogin from '../screens/AltLogin/app';
import Login from '../screens/Login';
import AuthLoadingScreen from '../screens/AuthLoadingScreen';
import DivInfo from '../screens/DivInfo';

const AuthStack = createStackNavigator({ AltLogin }, {headerMode: 'none'});


const HistoryStack = createStackNavigator({
  History: HistoryScreen,
  Details: DivInfo,
}, { headerMode: 'none'});



const AppTabs = createMaterialBottomTabNavigator(
    {
      Home: AltHome,
      History: HistoryScreen,
      Settings: Settings,
    },
    {
      shifting: true,
      initialRouteName: 'History',
      barStyle: {
        backgroundColor: '#f8f7f9',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderStyle: 'solid',
        borderColor: '#d0cfd0',
        borderTopLeftRadius: 9,
        borderTopRightRadius: 9
      },
      routes: [
        { key: 'Home', routeName: 'Home' }, { key: 'History', routeName: 'History' }, { key: 'Settings', routeName: 'Settings' },
      ],
      navigationOptions: ({ navigation }) => ({
        tabBarIcon: ({ focused, tintColor }) => {
          const { routeName } = navigation.state;
          let iconName;
          if (routeName === 'Home') {
            iconName = "ios-home-outline";
          } else if (routeName === 'Settings') {
            iconName = `ios-options${focused ? '' : '-outline'}`;
          }
          else if (routeName === 'History') {
            iconName = 'ios-trending-up';
          }

          // You can return any component that you like here! We usually use an
          // icon component from react-native-vector-icons
          return <Ionicons accessible={true} testID={'TEST_ID_Hfuck'} accessibilityLabel={'TEST_ID_fuck'}  name={iconName} size={25} color={tintColor} />;
        },
        header: null,
      }),
      tabBarOptions: {
        activeTintColor: '#f0edf6',
        inactiveTintColor: '#3e2465',
        labelStyle: {
          fontSize: 12,
        },
        inactiveTintColor: 'gray',
          barStyle: { backgroundColor: 'blue' },

      },
    }
);
const Stack = createStackNavigator({ AppTabs: AppTabs, Details: DivInfo }, {headerMode: 'none'});


  export const AppNavigator =  createSwitchNavigator(
    {
      AuthLoading: AuthLoadingScreen,
      App: Stack,
      Auth: AuthStack,
    },
    {
      initialRouteName: 'AuthLoading',
    }
  );