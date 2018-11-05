import React, { Component } from 'react'
import { Platform } from 'react-native'
import { View, StatusBar } from 'react-native-animatable';
import Meteor, { Accounts } from 'react-native-meteor';
import DropdownAlert from 'react-native-dropdownalert';
import ReactNativeHaptic from 'react-native-haptic';
import DeviceInfo from 'react-native-device-info';
import { GoogleSignin, statusCodes } from 'react-native-google-signin';

import AuthScreen from './containers/AuthScreen'
import HomeScreen from './containers/HomeScreen'
import { storeItem } from '../../lib'
/**
 * The root component of the application.
 * In this component I am handling the entire application state, but in a real app you should
 * probably use a state management library like Redux or MobX to handle the state (if your app gets bigger).
 */
export class LoginAnimation extends Component {
  state = {
    isLoggedIn: false, // Is the user authenticated?
    isLoading: false, // Is the user loggingIn/signinUp?
    isAppReady: false // Has the app completed the login animation?
  }

  componentDidMount() { 
    this.setState({_mounted: true})
  }
  
  componentWillUnmount() {
    this.setState({_mounted: false})
  }
  
  isValid = (email, password) => {
    let valid = false;

    if (email.length > 0 && password.length > 0) {
      valid = true;
    }

    if (email.length === 0) {
      this.dropdown.alertWithType('warn', 'Error', 'You must enter a username');
      if (Platform.OS !== 'android') ReactNativeHaptic.generate('notificationWarning');
    } else if (password.length === 0) {
      this.dropdown.alertWithType('warn', 'Error', 'You must enter a password');
      if (Platform.OS !== 'android') ReactNativeHaptic.generate('notificationWarning');
    }
    if (!valid){
      this.setState({ isLoading: false });
    }

    return valid;
  }

  onSignIn = (email, password) => {
    console.log(email,password);
    this.setState({isLoading:true});
    if (this.isValid(email, password)) {
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
  }

  onCreateAccount = (email, password, supressWarn) => {
    this.setState({isLoading:true});

    if (this.isValid(email, password)) {
      Accounts.createUser({ username: email, password }, (error) => {
        if (error) {
          const errText = error.message;
          console.log(supressWarn && this.state._mounted)
          if (supressWarn && this.state._mounted){
            setTimeout(() => {
              if (this.state._mounted){
                this.dropdown.alertWithType('error', 'Error', errText);
                this.setState({ isLoading: false });
              }
              
            }, 1000);
          }
          else {
            this.dropdown.alertWithType('error', 'Error', errText);
            this.setState({ isLoading: false });
          }
        
        } else {
            storeItem('is_first_login', true).finally(() => {
              this.onSignIn(email, password);
            });
        }
      });
    }
  }


  /**
   * Two login function that waits 1000 ms and then authenticates the user succesfully.
   * In your real app they should be replaced with an API call to you backend.
   */
  _simulateLogin = (username, password) => {
    this.setState({ isLoading: true });
    this.onSignIn(username, password);
  }

  _simulateSignup = (username, password, fullName) => {
    this.setState({ isLoading: true });
    this.onCreateAccount(username, password);
  }

  onGoogleSignInPress = () => {
    this.oAuthLogin('google')
  }

  oAuthLogin = (type) => {
    let config =  {
      google: {
        callback_url: `com.googleusercontent.apps.612930134863-p1uf37bh1n4lj2696gm1q0o141msm5kq:/google`,
        client_id: '612930134863-p1uf37bh1n4lj2696gm1q0o141msm5kq.apps.googleusercontent.com'
      }
    }
    GoogleSignin.configure({
      webClientId: '612930134863-b5mc9pgu56sjl7fn6qlmsqf98og1c4j9.apps.googleusercontent.com', // client ID of type WEB for your server (needed to verify user ID and offline access)
    });
    GoogleSignin.configure();

    this.signInGOOG()

   /* const manager = new OAuthManager('firestackexample')
    manager.configure(config);

    manager.savedAccounts()
      .then(resp => {
        console.log('account list: ', resp.accounts);
      })


    manager.authorize(type, {scopes: 'email'}).then(resp => {
      
      resp = resp.response;
      console.log(resp);
      if (resp.authorized){
        this.setState({email: resp.credentials.accessToken.substring(7,17), password: resp.credentials.accessToken.substring(17,27)}, () => {
          console.log(this.state.email, this.state.password)
          this.onCreateAccount(this.state.email, this.state.password, true);
          this.onSignIn(this.state.email, this.state.password);
        })
      }
    }).catch(err => {
      this.dropdown.alertWithType('error', 'Error', JSON.stringify(err));
      this.setState({isLoading:false});
      console.log(err)
    });*/
  }

  signInGOOG = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const googleUserInfo = await GoogleSignin.signIn();
      this.setState({ googleUserInfo });

      if (googleUserInfo?.user?.email){
        const email = googleUserInfo?.user?.email;
        this.setState({email: String(email).substring(0,email.indexOf('@')), password: String(googleUserInfo?.user?.id)}, () => {
          console.log(this.state.email, this.state.password)
          this.onCreateAccount(this.state.email, this.state.password, true);
          this.onSignIn(this.state.email, this.state.password);
        })
      }
      

      console.log(googleUserInfo)
    } catch (error) {
      console.log(error)
      this.dropdown.alertWithType('error', 'Error', JSON.stringify(error));
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (f.e. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
      }
    }
  };

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

  /**
   * Simple routing.
   * If the user is authenticated (isAppReady) show the HomeScreen, otherwise show the AuthScreen
   */
  render () {
    if (this.state.isAppReady) {
      return (
        <HomeScreen
          logout={() => this.setState({ isLoggedIn: false, isAppReady: false })}
        />
      )
    } else {
      return (
        <View style={{flex: 1}}>
          <AuthScreen
            login={this._simulateLogin}
            signup={this._simulateSignup}
            isLoggedIn={this.state.isLoggedIn}
            isLoading={this.state.isLoading}
            onGoogleSignInPress={this.onGoogleSignInPress}
            onLoginAnimationCompleted={() => this.setState({ isAppReady: true })}
          />
          <DropdownAlert ref={ref => this.dropdown = ref} />
        </View>
      )
    }
  }
}

export default LoginAnimation
