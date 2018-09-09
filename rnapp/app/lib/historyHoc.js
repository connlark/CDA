import React, { Component } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import SwiperR from 'react-native-swiper';

import HistoryScreen from '../screens/History';
import Stats from '../screens/Stats';

class APP extends Component {
    state = {
        showsButtons: true
    }
    componentDidMount(){
        setTimeout(() => {
            this.setState({showsButtons: false});
        }, 400);
    }
    render() {
        return (
            <SwiperR index={0} loop={false} showsButtons={false} removeClippedSubview automaticallyAdjustContentInsets>
                <HistoryScreen/>
                <Stats/>
            </SwiperR>
        );
    }
}
APP.navigationOptions = {
    tabBarTestIDProps: {
      testID: 'TEST_ID_HOME',
      accessibilityLabel: 'TEST_ID_HOME_ACLBL',
    },
   // tabBarLabel: 'Home',
   /* tabBarIcon: ({ tintColor, focused }) => (
      <Ionicons
        name={focused ? 'ios-home' : 'ios-home-outline'}
        size={26}
        style={{ color: tintColor }}
      />
    ),*/
  };

const styles = StyleSheet.flatten({});

export default APP;
