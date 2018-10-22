import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View, 
  Platform, 
  ScrollView,
  Image,
  Alert
} from 'react-native';
import codePush from "react-native-code-push";
import Meteor, { withTracker } from 'react-native-meteor';
import DropdownAlert from 'react-native-dropdownalert';
import SettingsList from 'react-native-settings-list';
import { IS_X } from '../../config/styles';
import AddCredentialsModal from '../../components/addCredentialsModal'
import {connect, createProvider} from 'react-redux'
import Rate, { AndroidMarket } from 'react-native-rate'
import email from 'react-native-email'

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
      TRXAddress: null,
      switchValue: true,
      rated: false,
      username: ''
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

  static getDerivedStateFromProps(props, state) {
    // Any time the current user changes,
    // Reset any parts of state that are tied to that user.
    // In this simple example, that's just the email.
    const users = props.users;
    let user = users[Object.keys(users)[0]];
    let TRX = null;
    let CoinEx = null;

    if (users && user){
        user.profile.map((e) => {
            if (typeof e.TRXAddress !== 'undefined'){
                TRX = e.TRXAddress;
            }
            if (typeof e.token !== 'undefined'){
                CoinEx = e.token;
            }
        });
        console.log(TRX)

        return {
            TRXAddress: TRX,
            CoinExKeys: CoinEx,
            username: user.username
        };
    }

    
    return null;
    }

  getTRXAddress = (profile) => {
      if (!profile) return;
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
                  Analytics.trackEvent('📲 Installing Update 📲 ');
                  this.setState({isDownloading: false, updateText: '📲 Installing Update 📲 '})
                  break;
              case codePush.SyncStatus.UNKNOWN_ERROR:
                  this.setState({isPending: false, showIsUpToDate: true, isDownloading: false, updateText: '🚧 unknown error! 🚧'})
                  break;
              case codePush.SyncStatus.UP_TO_DATE:
                  Analytics.trackEvent('📲 UP TO DATE 📲 ');
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

        Alert.alert('You are about to log out!',
        null,
        [
            {text: 'Cancel', onPress: () => (null)},
            {text: 'Ok', onPress: () => {
                Meteor.call('notifications.remove.pushToken', err => {
                    if (err) { console.log(`notifications.rm.pushToken: ${err.reason}`); }
                    Meteor.logout((err) => {
                    if (err){
                        alert(JSON.stringify(err));
                    }
                    else {
                        Analytics.trackEvent('Logged Out');
                        this.props.navigation.navigate('Auth');
                    }
                    })
                });
            }}        
        ],{ cancelable: false });
  } 

    onValueChange = (value) => {
        this.setState({switchValue: value});
    }
    _onRefresh = () => {
        Analytics.trackEvent('Refreshing Data');
        this.setState({refreshing: true});

        Meteor.call('Balances.checkForNewBalance', (err) => {
            if (err){
                console.log(err) 
                const { dropdown } = this;
                dropdown.alertWithType('error', 'Error', err.reason);
            }
            else {
                this.dropdown.alertWithType('success', 'Refreshed Sucessfully','☻ ☻ ☻ ☻ ☻ ☻ ☻');
            }
            this.setState({refreshing: false})
        })
    }
    rateApp = () => {
            let options = {
                AppleAppID:"1424173972",
                GooglePackageName:"com.connorlarkin.cda",
                AmazonPackageName:"com.mywebsite.myapp",
                OtherAndroidURL:"http://www.randomappstore.com/app/47172391",
                preferredAndroidMarket: AndroidMarket.Google,
                preferInApp:true,
                openAppStoreIfInAppFails:true,
                fallbackPlatformURL:"http://cda.connorlarkin.com",
            }
            Rate.rate(options, (success)=>{
                if (success) {
                    // this technically only tells us if the user successfully went to the Review Page. Whether they actually did anything, we do not know.
                    this.setState({rated:true})
                }
            });
    }

    handleEmail = () => {
        const to = ['connor.larkin1@gmail.com'] // string or array of email addresses
        email(to, {
            // Optional additional arguments
            cc: ['clswimmer411@me.com'], // string or array of email addresses
            subject: '☀️ Regarding something about Crypto Dividend Tracker ☀️',
            body: '🔥🔥🔥 Your message to me here! 🔥🔥🔥'
        }).catch(console.error)
    }

    render() {
        const { appVersion, label, isPending, isDownloading, receivedBytes, totalBytes, showIsUpToDate, updateText, TRXAddress, CoinExKeys, username } = this.state;
        var bgColor = '#DCE3F4';
        return (
          <View style={{backgroundColor:'#EFEFF4',flex:1}}>
            <View style={{borderBottomWidth:1, backgroundColor:'#f7f7f8',borderColor:'#c8c7cc'}}>
              <Text style={{alignSelf:'center',marginTop:30,marginBottom:10,fontWeight:'bold',fontSize:16}}>Settings</Text>
            </View>
            <View style={{backgroundColor:'#EFEFF4',flex:1}}>
              <SettingsList borderColor='#c8c7cc' defaultItemSize={50}>
                <SettingsList.Header headerStyle={{marginTop:15}}/>
                <SettingsList.Item
                  icon={<Image style={styles.imageStyle} source={require('./images/notifications.png')}/>}
                  hasSwitch={true}
                  switchState={this.state.switchValue}
                  switchOnValueChange={this.onValueChange}
                  hasNavArrow={false}
                  title='Notifications'
                />
                <SettingsList.Header headerStyle={{marginTop:15}}/>
                <SettingsList.Item
                  icon={<Image style={styles.imageStyle} source={require('./images/coinex.png')}/>}
                  title={`Coinex Key`}
                  titleInfo={`\t${CoinExKeys ? CoinExKeys.apiKey.substring(0,3) + '......' + CoinExKeys.apiKey.substring(CoinExKeys.apiKey.length-3): 'Tap To Set!'}`}
                  onPress={() => this.mymodal.setModalVisible( true)}
                />
                <SettingsList.Item
                  icon={<Image style={styles.imageStyle} source={require('./images/tron.png')}/>}
                  title={`TRX Wallet`}
                  titleInfo={`${TRXAddress ? TRXAddress.substring(0,3) + '......' + TRXAddress.substring(TRXAddress.length-3): 'Tap To Set!'}`}
                  onPress={() => this.mymodal.setModalVisible( true)}
                />
                <SettingsList.Item
                  icon={<Image style={styles.imageStyle} source={require('./images/refresh.png')}/>}
                  title={`Refresh Assets`}
                  onPress={this._onRefresh}
                />
                
                <SettingsList.Header headerStyle={{marginTop:15}}/>
                <SettingsList.Item
                  icon={<Image style={styles.imageStyle} source={require('./images/general.png')}/>}
                  title={`App Version`} 
                  titleInfo={` ${appVersion} (${label})`}
                  onPress={this.updateApp}
                  hasNavArrow={false}
                />

                { isPending ?
                    <SettingsList.Item
                        icon={<Image style={styles.imageStyle} source={require('./images/control.png')}/>}
                        title={isDownloading ? `( ${receivedBytes} / ${totalBytes})`:`New Update Available!`} 
                        onPress={this.updateApp}
                    />
                    :null
                }
                { updateText ? 
                    <SettingsList.Item
                        title={updateText} 
                        onPress={this.updateApp}
                        hasNavArrow={false}
                    />
                    :null
                }
                <SettingsList.Header headerStyle={{marginTop:15}}/>

                <SettingsList.Item
                  icon={<Image style={styles.imageStyle} source={require('./images/user.png')}/>}
                  title={`Log Out: ${username}`}
                  onPress={this.logOut}
                />
                <SettingsList.Item
                    title={'😃 Rate App 😃'} 
                    onPress={this.rateApp}
                    hasNavArrow={true}
                />
                <SettingsList.Item
                    title={'Contact Developer'} 
                    onPress={this.handleEmail}
                    hasNavArrow={true}
                />
              </SettingsList>
              <AddCredentialsModal ref={component => this.mymodal = component} onRequestClose={this.state.closeModal} isModalVisible={this.state.modalVisible} {...this.props}/>

            </View>
            <DropdownAlert ref={ref => this.dropdown = ref} closeInterval={850} />

          </View>
        );
      }
    
}

function mapStateToProps(state, ownProps) {
    if (state.meteorData.users){
        return { users: state.meteorData.users, user: state.meteorData.users[0] }
    }
    else {
        return { users: {}, user: {profile: null} }

    }
  }
const connetedSettings = connect(mapStateToProps)(Settings)

export default withTracker(params => {
    return {
      //user: Meteor.user()
      connected: Meteor.status().connected,
    };
})(connetedSettings);
 

const styles = StyleSheet.create({
    imageStyle:{
      marginLeft:15,
      alignSelf:'center',
      height:30,
      width:30
    },
    titleInfoStyle:{
      fontSize:16,
      color: '#8e8e93'
    }
});

  
const colors = {
  iosSettingsBackground: 'rgb(235,235,241)',
  white: '#FFFFFF',
  monza: '#C70039',
  switchEnabled: (Platform.OS === 'android') ? '#C70039' : null,
  switchDisabled: (Platform.OS === 'android') ? '#efeff3' : null,
  switchOnTintColor: (Platform.OS === 'android') ? 'rgba(199, 0, 57, 0.6)' : null,
  blueGem: '#27139A',
};