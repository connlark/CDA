
import React from 'react';

import Ionicons from 'react-native-vector-icons/Ionicons';
import { createBottomTabNavigator, createSwitchNavigator, createStackNavigator} from 'react-navigation';

import Home from '../screens/Home';
import HistoryScreen from '../lib/historyHoc';
import Settings from '../screens/Settings';
import Stats from '../screens/Stats';
import Login from '../screens/Login';
import AuthLoadingScreen from '../screens/AuthLoadingScreen';

const AuthStack = createStackNavigator({ Login });



const AppStack = createBottomTabNavigator(
    {
      Home: Home,
      History: HistoryScreen,
      Settings: Settings,
    },
    {
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
          return <Ionicons name={iconName} size={25} color={tintColor} />;
        },
      }),
      tabBarOptions: {
        activeTintColor: 'tomato',
        inactiveTintColor: 'gray',
      },
    }
  );

  export const AppNavigator =  createSwitchNavigator(
    {
      AuthLoading: AuthLoadingScreen,
      App: AppStack,
      Auth: AuthStack,
    },
    {
      initialRouteName: 'AuthLoading',
    }
  );