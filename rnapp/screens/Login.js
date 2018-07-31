import React, { Component } from 'react';
import {  StyleSheet, Text, View, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import Meteor, { withTracker, Accounts } from 'react-native-meteor';
import DropdownAlert from 'react-native-dropdownalert';

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
          this.dropdown.alertWithType('success', 'Logged In','');
        }
      });
    }
  }

  onCreateAccount = () => {
    const { email, password } = this.state;

    if (this.isValid()) {
      Accounts.createUser({ email, password }, (error) => {
        if (error) {
          this.dropdown.alertWithType('error', 'Error', error.reason);
        } else {
         /* setTimeout(() => {
            Meteor.loginWithPassword(email, password, (error) => {
              if (error) {
                this.dropdown.alertWithType('error', 'Error', error.reason);
              }
              else {
                this.dropdown.alertWithType('success', 'Logged In','');
              }
            });
          }, 700);*/
        }
      });
    }
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
        <TouchableOpacity style={styles.button} onPress={this.onSignIn}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={this.onCreateAccount}>
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>

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