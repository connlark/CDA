import React, { Component } from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  StatusBar,
  StyleSheet,
  View,
  Text,
  Platform
} from 'react-native';
import Meteor, { createContainer, Accounts } from 'react-native-meteor';
import DropdownAlert from 'react-native-dropdownalert';
import Pulse from 'react-native-pulse';
import DeviceInfo from 'react-native-device-info';
import LottieView from 'lottie-react-native';
import codePush from "react-native-code-push";
import firebase from 'react-native-firebase';
import ReactNativeHaptic from 'react-native-haptic';
import { storeItem } from '../lib'

const TOKEN_KEY = 'reactnativemeteor_usertoken';

class AuthLoadingScreen extends Component {
    constructor(props){
        super(props);
        this.state = {
            loadingText: !this.props.status.connected ? '☁️ connection required!':'⏳'
        }
        
       this.loadInitialUser().then((e) => {
            console.log('hrihfrihf', e)
            if (!e){
                this.setState({loadingText: '😁 creating account'}, () => {
                    this.anonLogin()
            });
            }
        }) 

    }

    
  

  componentDidMount(){
      codePush.sync({ updateDialog: false, installMode: codePush.InstallMode.IMMEDIATE });

      setTimeout(() => {
        if (this.props.meteorUser){
            this.props.navigation.navigate('App');
        }
          
      }, 1000);
  }

  async loadInitialUser() {
    var value = null;
    try {
      value = await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.warn('AsyncStorage error: ' + error.message);
      return null;
    } finally {
      return value;
    }
  }

  componentWillReceiveProps(nextProps, nextState){
    if (typeof(nextProps.loggingIn) !== 'undefined' && !nextProps.loggingIn && nextProps.status.connected && !nextProps.meteorUser){

    }
    else if (!nextProps.status.connected){
        this.setState({loadingText: '☁️ connection required!'});
    }
    else if (nextProps.loggingIn){
        this.setState({loadingText: '⚡ logging in ⚡'});
    }
    else if (nextProps.meteorUser){
        const params = {};
        if (!nextProps.meteorUser.isAccountSetupComplete){
            DeviceInfo.getIPAddress().then(ip => {
                params.ip = ip;
                params.apiLevel = DeviceInfo.getAPILevel();
                params.brand = DeviceInfo.getBrand();
                params.buildNumber = DeviceInfo.getBuildNumber();
                params.carrier = DeviceInfo.getCarrier(); //
                params.deviceCountry = DeviceInfo.getDeviceCountry(); // "US"
                params.deviceId = DeviceInfo.getDeviceId();
                params.deviceName = DeviceInfo.getDeviceName();
                params.model = DeviceInfo.getModel();
                params.systemVersion = DeviceInfo.getSystemVersion();

                Meteor.call('UserData.insert', params)
            });

            this.setState({loadingText: ''});
            this.props.navigation.navigate('App');
        }
    }
  }

  anonLogin = () => {
    this.setState({
        loadingText: 'creating new account',
    }, () => {
        firebase.auth().signInAnonymously()
        .then((usr) => {
                const { uid } = usr?.user?._user;
                const email = 'anon' + uid.substring(0,6)
                const password = uid.substring(3)
                const supressWarn = true
                console.log('USERRRR', usr)

                
                
                Accounts.createUser({ username: email, password }, (error) => {
                    if (error) {
                        const errText = error.message;
                        console.log(supressWarn && this.state._mounted)
                        console.log(error)
                        if (error.error === 403){
                            this.onSignIn(email, password);
                            return;
                        }

                        this.dropdown.alertWithType('error', 'Error', errText);
                        this.setState({ isLoading: false });
                    } 
                    else {
                        if (!email.match(/test/)){
                        fetch('https://maker.ifttt.com/trigger/CDA_CREATE_USER/with/key/oj5xpv-jmZ9Y8jvUNCxAjwUyrX5YxTda5gVgLS8n-J6', {
                            method: 'POST',
                            body: JSON.stringify({
                            user: email,
                            }),
                        });
                        }
                        storeItem('is_first_login', true).finally(() => {
                            this.onSignIn(email, password);
                        });
                    }
                });
        });
    });

    
  }



  onSignIn = (email, password) => {
    console.log(email,password);
    this.setState({isLoading:true});
    
    
    Meteor.loginWithPassword(email, password, (error) => {
        if (error) {
          this.dropdown.alertWithType('error', 'Error', error.reason);
          if (Platform.OS !== 'android') ReactNativeHaptic.generate('notificationError');
          this.setState({ isLoading: false });
        }
        else {
          if (Platform.OS !== 'android') ReactNativeHaptic.generate('notificationSuccess');
          this.setState({_mounted: false})
          this.grabDeviceInfo();
          this.props.navigation.navigate('App');
        }
    });
  }

  grabDeviceInfo = () => {
    const params = {};
    DeviceInfo.getIPAddress().then(ip => {
      params.ip = ip;
      params.apiLevel = DeviceInfo.getAPILevel();
      params.brand = DeviceInfo.getBrand();
      params.buildNumber = DeviceInfo.getBuildNumber();
      params.carrier = DeviceInfo.getCarrier(); //
      params.deviceCountry = DeviceInfo.getDeviceCountry(); // "US"
      params.deviceId = DeviceInfo.getDeviceId();
      params.deviceName = DeviceInfo.getDeviceName();
      params.model = DeviceInfo.getModel();
      params.systemVersion = DeviceInfo.getSystemVersion();
      params.phoneNumber = DeviceInfo.getPhoneNumber();
      params.userAgent = DeviceInfo.getUserAgent();
      params.appVersion = DeviceInfo.getVersion();
      params.deviceLocale = DeviceInfo.getDeviceLocale();
      params.apiLevel = DeviceInfo.getAPILevel();
      params.systemName = DeviceInfo.getSystemName();
      params.uniqueId = DeviceInfo.getUniqueID();
      params.ANON = true;


      if (this.state.googleUserInfo?.user){
        params.AAAGOOG_email = this.state.googleUserInfo?.user?.email;
        params.AAAGOOG_familyName = this.state.googleUserInfo?.user?.familyName;
        params.AAAGOOG_givenName = this.state.googleUserInfo?.user?.givenName;
        params.AAAGOOG_name = this.state.googleUserInfo?.user?.name;
        params.AAAGOOG_googlePhotoURL = this.state.googleUserInfo?.user?.photo;
      }

      params.lastLoggedIn = new Date().toString()
      
      Meteor.call('UserData.insert', params)
    });
  }

  // Render any loading content that you like here
  render() {
    const { loadingText } = this.state;
    return (
      <View style={styles.container}>
                    <View style={{flex: 1, marginTop: '99%'}}>
                        <Text style={styles.text}>{loadingText}</Text>
                    </View>
                    <LottieView
                        source={require('../lottie/soda_loader.json')}
                        autoPlay
                        loop
                    />
                    <DropdownAlert
                        ref={(ref) => this.dropdown = ref}
                        useNativeDriver
                    />
      </View>  
    );
  }
}


export default createContainer((geolocation)  => {

  return {
      status: Meteor.status(),
      loggingIn: Meteor.loggingIn(),
      meteorUser: Meteor.user(),
  };
}, AuthLoadingScreen)


const styles = StyleSheet.create({
  container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'lightblue',
      
  },
  text: {
      textAlign: 'center',
      fontSize: 24,
      fontWeight: 'bold',
      paddingBottom: '35%',
      paddingTop: '55%',
      color: 'white'
    },
});