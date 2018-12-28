import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View, 
  Platform, 
  ScrollView,
  Image,
  Alert,
  Linking
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
import Modal from "react-native-modal";
import ReactNativeHaptic from 'react-native-haptic';
import Crashes from 'appcenter-crashes';
import { GoogleSignin, statusCodes } from 'react-native-google-signin';
import DeviceInfo from 'react-native-device-info';

import { PricingCard } from 'react-native-elements'
import Analytics from 'appcenter-analytics';
import * as RNIap from 'react-native-iap';

import { storeItem, retrieveItem } from '../../lib'


const itemSkus = Platform.select({
  ios: [
    'tip99',
    'tip_1.99'
  ],
  android: [
    'com.example.coins100'
  ]
});


class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      allowPushNotifications: false,
      gender: '',
      appVersion: '1.1.1',
      label: 'v0',
      isPending: false,
      isDownloading: false,
      showIsUpToDate: false,
      receivedBytes: 0, 
      totalBytes: 0,
      updateText: null,
      TRXAddress: null,
      switchValue: true,
      rated: false,
      username: '',
      isModalVisiblePAY: false,
      buildNumber: DeviceInfo.getBuildNumber(),
      modalVisible: true
    };
  }

  async componentDidMount(){
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

    retrieveItem('is_first_login').then((obj) => {
        if (obj){
            storeItem('is_first_login', false).then(() => {
                this.mymodal.setModalVisible(true)
            });
        }
    });  

    try {
        const products = await RNIap.getProducts(itemSkus);
        this.setState({ products });
      } catch(err) {
        console.warn(err); // standardized err.code and err.message available
      }
  }

  componentWillUnmount() {
    RNIap.endConnection();
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
                this.GOOGsignOut().finally((E) => {
                });
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

  GOOGsignOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      this.setState({ user: false }); // Remember to remove the user from your app's state as well
    } catch (error) {
      console.error(error);
    }
  };

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
        Analytics.trackEvent('handleTip clicked');

        const to = ['connor.larkin1@gmail.com'] // string or array of email addresses
        email(to, {
            // Optional additional arguments
            cc: [], // string or array of email addresses
            subject: '☀️ Regarding something about Crypto Dividend Tracker hopefully not a bug, if so, sorry ☀️',
            body: '🔥🔥🔥 \n\n Your message to me here! \n\n 🔥🔥🔥'
        }).catch(console.error)
    }

    onPayButtonPress = (qty) => {
        Analytics.trackEvent('handleTip clicked');

        if (Platform.OS !== 'android') {
            const titleIOS = qty === 1 ? 'tip99':'tip_1.99';
            RNIap.buyProductWithQuantityIOS(titleIOS,1).then(purchase => {
                const title = 'BOUGHT '+purchase.productId;
                const info = { 
                    transactionDate: Date(purchase.transactionDate).toString(), 
                    transactionId: String(purchase.transactionId)
                };
                ReactNativeHaptic.generate('notificationSuccess')
                this.dropdown.alertWithType('success', 'Thank You!','☻ ☻ ☻ ');
    
                Analytics.trackEvent(title, info);
            }).finally(() => {
                this.setState({isModalVisiblePAY: false})
            });
        }
        else {
            this.setState({isModalVisiblePAY: false})

            alert('not available right now :) THANKS THO ')
        }
    }

    onHelpPress = () => {
        Alert.alert('Help with assets',
        'Try following these links to solve issues or contact me if these dont help. Note that this app will count transactions as dividends. \n\nAlso, coinex balance won\'t show unless the corrent IP is put in the whitelist.',
        [
            {text: 'CoinEx: dividend allocation plan', onPress: () => {
                Linking.openURL('https://www.coinex.com/announcement/detail?id=76&lang=en_US')
            }},
            {text: 'TRON: How to vote & get dividends', onPress: () => {
                Linking.openURL('https://medium.com/tron-foundation/how-to-vote-for-super-representatives-d81d14d9743d')
            }},
            {text: 'Cancel', onPress: () => {
            }}          
        ],{ cancelable: true });
    }

    closeModal = () => this.setState({modalVisible: false})

    render() {
        const { appVersion, label, isPending, isDownloading, receivedBytes, totalBytes, showIsUpToDate, updateText, TRXAddress, CoinExKeys, username, isModalVisiblePAY, buildNumber } = this.state;
        var bgColor = '#DCE3F4';
        const usernm = this.props.meteorUser
        console.log(usernm)
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
                  title={` ❓   Help`}
                //  titleInfo={`Help`}
                  onPress={this.onHelpPress}
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
                  titleInfo={` ${appVersion}b${buildNumber} (${label})`}
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
                    title={' 😃    Rate App'} 
                    onPress={this.rateApp}
                    hasNavArrow={true}
                />
                <SettingsList.Item
                    title={' 📲    Contact Developer'} 
                    onPress={this.handleEmail}
                    onLongPress={() => Crashes.generateTestCrash()}
                    hasNavArrow={true}
                />
                { username !== 'seed' && 
                    <SettingsList.Item
                        title={' 🍯    Tip Jar'} 
                        onPress={() => this.setState({isModalVisiblePAY: true})}
                        hasNavArrow={false}
                    />
                }
                
              </SettingsList>
              <AddCredentialsModal ref={component => this.mymodal = component} onRequestClose={this.closeModal} isModalVisible={this.state.modalVisible} {...this.props}/>
            </View>
            <DropdownAlert ref={ref => this.dropdown = ref} closeInterval={1500} />
            <Modal isVisible={isModalVisiblePAY} useNativeDriver onBackdropPress={() => this.setState({isModalVisiblePAY: false})} onSwipe={() => this.setState({isModalVisiblePAY: false})} backdropOpacity={0.4} hideModalContentWhileAnimating>
                <View style={{ flex: 1, alignItems: 'center',  justifyContent: 'center' }}>
                    <PricingCard
                        color='steelblue'
                        title='Basic Support'
                        price='$0.99'
                        info={['will pay for 15 days of server life', '💙💙💙']}
                        button={{ title: 'Tip', icon: 'payment' }}
                        onButtonPress={() =>this.onPayButtonPress(1)}
                        containerStyle={{width: '90%'}}
                    />
                    <PricingCard
                        color='lightblue'
                        title='Premium Support'
                        price='$1.99'
                        containerStyle={{width: '90%'}}
                        info={['Month of server life!', '💙❤️💙']}
                        button={{ title: 'Tip', icon: 'payment' }}
                        onButtonPress={() =>this.onPayButtonPress(2)}
                    />
                </View>
            </Modal>
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
      meteorUser: Meteor.user()
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