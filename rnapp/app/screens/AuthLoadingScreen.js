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
import Meteor, { createContainer } from 'react-native-meteor';
import DropdownAlert from 'react-native-dropdownalert';
import Pulse from 'react-native-pulse';
import DeviceInfo from 'react-native-device-info';
import LottieView from 'lottie-react-native';
import codePush from "react-native-code-push";

class AuthLoadingScreen extends Component {
  state = {
    loadingText: !this.props.status.connected ? '☁️ connection required!':'⏳'
  }

  componentDidMount(){
      codePush.sync({ updateDialog: false, installMode: codePush.InstallMode.IMMEDIATE });

      setTimeout(() => {
        if (this.props.meteorUser){
            this.props.navigation.navigate('App');
        }
          
      }, 1000);
  }

  componentWillReceiveProps(nextProps){
    if (typeof(nextProps.loggingIn) !== 'undefined' && !nextProps.loggingIn && nextProps.status.connected && !nextProps.meteorUser){
        this.props.navigation.navigate('Auth');
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