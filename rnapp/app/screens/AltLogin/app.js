import React, { Component } from 'react'
import { View, StatusBar } from 'react-native-animatable';
import Meteor, { Accounts } from 'react-native-meteor';
import DropdownAlert from 'react-native-dropdownalert';
import OAuthManager from 'react-native-oauth';

import AuthScreen from './containers/AuthScreen'
import HomeScreen from './containers/HomeScreen'

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
    } else if (password.length === 0) {
      this.dropdown.alertWithType('warn', 'Error', 'You must enter a password');
    }
    if (!valid){
      this.setState({ isLoading: false });
    }

    return valid;
  }

  onSignIn = (email, password) => {
    console.log(email,typeof email);
    if (this.isValid(email, password)) {
      Meteor.loginWithPassword(email, password, (error) => {
        if (error) {
          this.dropdown.alertWithType('error', 'Error', error.reason);
          this.setState({ isLoading: false });
        }
        else {
          this.setState({_mounted: false})
          this.props.navigation.navigate('App');
        }
      });
    }
  }

  onCreateAccount = (email, password, supressWarn) => {
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
            this.onSignIn(email, password);
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
    this.setState({isLoading:true});

    const config =  {
      google: {
        callback_url: `com.googleusercontent.apps.394080947164-6pghdmlp08sodorous0phumqthuk975r:/google`,
        client_id: '394080947164-6pghdmlp08sodorous0phumqthuk975r.apps.googleusercontent.com'
      }
    }

    const manager = new OAuthManager('firestackexample')
    manager.configure(config);


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
      console.log(err)
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
