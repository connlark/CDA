import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View, 
  Platform, 
  ScrollView
} from 'react-native';
import Meteor, { withTracker } from 'react-native-meteor';

import {
    SettingsDividerShort, 
    SettingsDividerLong, 
    SettingsEditText, 
    SettingsCategoryHeader, 
    SettingsSwitch, 
    SettingsPicker
} from 'react-native-settings-components';
import { Header } from 'react-native-elements';

export default class App extends Component {
 
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      allowPushNotifications: false,
      gender: '',
    };
  }
  logOut = () => {
    Meteor.logout((err) => {
        alert(err)
    })
  } 
  render() {
      const { user } = this.props;
      return (
 
    <ScrollView stickyHeaderIndices={[0]} style={{flex: 1, backgroundColor: (Platform.OS === 'ios') ? colors.iosSettingsBackground : colors.white}}>
        <Header
            centerComponent={{ text: 'Settings', style: { color: '#fff', fontSize:20 } }}
            leftComponent={{ icon: 'eject', color: '#fff', onPress: this.logOut }}
            />
        <SettingsCategoryHeader title={'My Account'} textStyle={(Platform.OS === 'android') ? {color: colors.monza} : null}/>
 
        <SettingsSwitch
            title={'Allow Push Notifications'}
            onSaveValue={(value) => {
                console.log('allow push notifications:', value);
                this.setState({
                    allowPushNotifications: value
                });
            }}
            value={this.state.allowPushNotifications}
            thumbTintColor={(this.state.allowPushNotifications) ? colors.switchEnabled : colors.switchDisabled}
        />
     
        </ScrollView>
        );
    }
    
 
}
 
const colors = {
  iosSettingsBackground: 'rgb(235,235,241)',
  white: '#FFFFFF',
  monza: '#C70039',
  switchEnabled: (Platform.OS === 'android') ? '#C70039' : null,
  switchDisabled: (Platform.OS === 'android') ? '#efeff3' : null,
  switchOnTintColor: (Platform.OS === 'android') ? 'rgba(199, 0, 57, 0.6)' : null,
  blueGem: '#27139A',
};