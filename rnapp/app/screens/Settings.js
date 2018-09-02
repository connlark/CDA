import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View, 
  Platform, 
  ScrollView
} from 'react-native';
import codePush from "react-native-code-push";
import Meteor, { withTracker } from 'react-native-meteor';
import DropdownAlert from 'react-native-dropdownalert';
import SettingsList from 'react-native-settings-list';
import { IS_X } from '../config/styles';

import {
    SettingsDividerShort, 
    SettingsDividerLong, 
    SettingsEditText, 
    SettingsCategoryHeader, 
    SettingsSwitch, 
    SettingsPicker
} from 'react-native-settings-components';
import { Header } from 'react-native-elements';
import Analytics from 'appcenter-analytics';

class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      allowPushNotifications: false,
      gender: '',
      appVersion: '1.0',
      label: 'v1',
      isPending: false,
      isDownloading: false,
      showIsUpToDate: false,
      receivedBytes: 0, 
      totalBytes: 0,
      updateText: null,
      TRXAddress: '...'
    };
  }

  componentDidMount(){
    const { user } = this.props;
    codePush.getCurrentPackage().then((e) => {
      this.setState({
        appVersion: e.appVersion,
        label: e.label,
        isPending: e.isPending
      })
    });
    codePush.checkForUpdate().then((update) => {
      if (!update) {
        console.log("The app is up to date!");
      } 
      else {
        this.setState({
          isPending: true
        });     
      } 
    });

    if (user){
        this.getTRXAddress(user.profile);
    }
  }

  getTRXAddress = (profile) => {
      profile.map((e) => {
          if (typeof e.TRXAddress !== 'undefined'){
              this.setState({TRXAddress: e.TRXAddress})
          }
      })
  }

  componentWillReceiveProps(nextProps){
    if (nextProps.meteorUser !== this.props.meteorUser){
        this.getTRXAddress(nextProps.meteorUser.profile)
    }
  }

  updateApp = () => {
    this.setState({showIsUpToDate: false}, () => {
      codePush.sync({ updateDialog: false, installMode: codePush.InstallMode.IMMEDIATE  },
      (status) => {
          switch (status) {
              case codePush.SyncStatus.DOWNLOADING_PACKAGE:
                  this.setState({isDownloading: true, updateText: '☁️ Downloading Package ☁️'})
                  break;
              case codePush.SyncStatus.SYNC_IN_PROGRESS:
                  this.setState({updateText: '📲 Sync in Progress 📲'})
                  break;
              case codePush.SyncStatus.CHECKING_FOR_UPDATE :
                  this.setState({updateText: '📡 Checking for Update 📡'})
                  break;
              case codePush.SyncStatus.INSTALLING_UPDATE:
                  this.setState({isDownloading: false, updateText: '📲 Installing Update 📲 '})
                  break;
              case codePush.SyncStatus.UNKNOWN_ERROR:
                  this.setState({isPending: false, showIsUpToDate: true, isDownloading: false, updateText: '🚧 unknown error! 🚧'})
                  break;
              case codePush.SyncStatus.UP_TO_DATE:
                  setTimeout(() => {
                    this.setState({isPending: false, showIsUpToDate: true, updateText: null})
                  }, 1500);
                  break;
              default: 
                  setTimeout(() => {
                    this.setState({isPending: false, showIsUpToDate: true, updateText: null})
                  }, 1500);
                  break;
          }
      },
      ({ receivedBytes, totalBytes, }) => {
          this.setState({receivedBytes, totalBytes})
        }
      );
    });
  }

  logOut = () => {
    Meteor.logout((err) => {
        if (err){
            alert(JSON.stringify(err));
        }
        else {
            Analytics.trackEvent('Logged Out');
            this.props.navigation.navigate('Auth');
        }
    })
  } 
  render() {
      const { user } = this.props;
      const { appVersion, label, isPending, isDownloading, receivedBytes, totalBytes, showIsUpToDate, updateText, TRXAddress } = this.state;
      return (
        <View style={{flex: 1}}>
        <ScrollView stickyHeaderIndices={[0]} style={{flex: 1, backgroundColor: (Platform.OS === 'ios') ? colors.iosSettingsBackground : colors.white}}>
            <Header
                outerContainerStyles={{marginTop: -15, height: IS_X ? 97:70}}
                centerComponent={{ text: 'Settings', style: { color: '#fff', fontSize:20 } }}
                leftComponent={{ icon: 'eject', color: '#fff', onPress: this.logOut, underlayColor: 'transparent' }}
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
            <View style={{marginTop: 10}}/>
            <SettingsEditText
                title="TRX Address"
                dialogDescription={'Enter your username.'}
                valuePlaceholder="..."
                negativeButtonTitle={'Cancel'}
                positiveButtonTitle={'Save'}
                onSaveValue={(value) => {
                    console.log('addy:', value);
                    if (value.length !== 34){
                        this.dropdown.alertWithType('error', 'TRX Add Address Error','Please enter a valid TRX address!');
                        return
                    }
                    Meteor.call('Balances.setTRXAddress', value, (err) => {
                        if (err){
                            console.log(err) 
                            this.setState({TRXAddress: value});
                            
                        }
                    })
                }}
                value={TRXAddress}
                dialogAndroidProps={{
                    widgetColor: colors.monza,
                    positiveColor: colors.monza,
                    negativeColor: colors.monza,
                }}
            />
            <View style={{marginTop: '114%'}}/>
            { updateText ? 
                <SettingsCategoryHeader title={updateText} titleProps={{onPress: this.updateApp}} titleStyle={{color:'blue', fontFamily: 'Avenir', fontSize: 17, fontWeight: '400'}}/>
                :null
            }

            { isPending ?
                <SettingsCategoryHeader title={isDownloading ? `( ${receivedBytes} / ${totalBytes})`:`New Update Available!`} titleProps={{onPress: this.updateApp}} titleStyle={{color:'red', fontFamily: 'Avenir', fontSize: 17, fontWeight: '400'}}/>
                :null
            }
            <SettingsCategoryHeader title={`App Version: ${appVersion} ( ${label} )`} titleProps={{onPress: this.updateApp}}/>
        
            </ScrollView>
        <DropdownAlert ref={ref => this.dropdown = ref} closeInterval={850} />
        </View>
        );
    }
    
}

export default withTracker(params => {
    return {
      user: Meteor.user()
    };
})(Settings);
 
const colors = {
  iosSettingsBackground: 'rgb(235,235,241)',
  white: '#FFFFFF',
  monza: '#C70039',
  switchEnabled: (Platform.OS === 'android') ? '#C70039' : null,
  switchDisabled: (Platform.OS === 'android') ? '#efeff3' : null,
  switchOnTintColor: (Platform.OS === 'android') ? 'rgba(199, 0, 57, 0.6)' : null,
  blueGem: '#27139A',
};