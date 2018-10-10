import React, { Component } from 'react';
import {  StyleSheet, Text, View, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import Meteor, { withTracker, Accounts } from 'react-native-meteor';
import DropdownAlert from 'react-native-dropdownalert';
import OAuthManager from 'react-native-oauth';
import { Button, SocialIcon } from 'react-native-elements'

import { storeItem, retrieveItem } from '../lib';
const { width } = Dimensions.get('window');

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
    };
  }

  isValid() {
    const { email, password } = this.state;
    let valid = false;

    if (email.length > 0 && password.length > 0) {
      valid = true;
    }

    if (email.length === 0) {
      this.dropdown.alertWithType('warn', 'Error', 'You must enter a username');
    } else if (password.length === 0) {
      this.dropdown.alertWithType('warn', 'Error', 'You must enter a password');
    }

    return valid;
  }

  onSignIn = () => {
    const { email, password } = this.state;
    if (this.isValid()) {
      Meteor.loginWithPassword(email, password, (error) => {
        if (error) {
          this.dropdown.alertWithType('error', 'Error', error.reason);
        }
        else {
          retrieveItem('notificationsPushToken').then((data) => {
            if (data && data.token){
              Meteor.call('notifications.set.pushToken', data, err => {
                //if (err) { alert(`notifications.set.pushToken: ${err.reason}`); }
                this.props.navigation.navigate('App')
              });
            }
          });
          this.props.navigation.navigate('App');
        }
      });
    }
  }

  onCreateAccount = () => {
    const { email, password } = this.state;

    if (this.isValid()) {
      Accounts.createUser({ username: email, password }, (error) => {
        if (error) {
          this.dropdown.alertWithType('error', 'Error', JSON.stringify(error));
        } else {
            this.onSignIn();
        }
      });
    }
  }

  oAuthLogin = (type) => {
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
          this.onCreateAccount();
          setTimeout(() => {
            this.onSignIn();
          }, 500);
          
        })
      }
    }).catch(err => {
      this.dropdown.alertWithType('error', 'Error', JSON.stringify(err));
      console.log(err)
    });
  }

  render() {
    
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          onChangeText={(email) => this.setState({email})}
          placeholder="Username"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          onChangeText={(password) => this.setState({password})}
          placeholder="Password"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={true}
        />
        <Text style={styles.error}>{this.state.error}</Text>

        <Button
          raised
          icon={{name: 'person'}}
          borderRadius={25}
          onPress={this.onSignIn}
          title='Sign In'
          backgroundColor='darkblue'
          containerViewStyle={{width: '90%', marginBottom: 10,}}
        />

        <Button
          raised
          icon={{name: 'add-circle'}}
          borderRadius={25}
          onPress={this.onCreateAccount}
          title='Create Account'
          backgroundColor='purple'
          containerViewStyle={{width: '90%', marginBottom: 50,}}
        />

        { Platform.OS !== 'android' ?
          <SocialIcon
            title='Continue With Google'
            button
            type='google-plus-official'
            onPress={() => this.oAuthLogin('google')}
            style={{width: '90%', marginBottom: 10,}}
          />:null
        
        }


        <DropdownAlert ref={ref => this.dropdown = ref} />
      </View>
    );
  }
}

const ELEMENT_WIDTH = width - 40;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  input: {
    width: ELEMENT_WIDTH,
    fontSize: 16,
    height: 36,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderColor: '#888888',
    borderWidth: 1,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#3B5998',
    width: ELEMENT_WIDTH,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 16,
  }
});

export default Login;