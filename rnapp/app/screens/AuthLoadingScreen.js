import React, { Component } from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  StatusBar,
  StyleSheet,
  View,
  Text
} from 'react-native';
import Meteor, { createContainer } from 'react-native-meteor';
import DropdownAlert from 'react-native-dropdownalert';
import Pulse from 'react-native-pulse';

class AuthLoadingScreen extends Component {
  state = {
    loadingText: !this.props.status.connected ? '☁️ connection required!':''
  }

  componentWillReceiveProps(nextProps){
    console.log(nextProps)
    if (typeof(nextProps.loggingIn) !== 'undefined' && !nextProps.loggingIn && nextProps.status.connected && !nextProps.meteorUser){
        this.props.navigation.navigate('Auth');
    }
    else if (!nextProps.status.connected){
        this.setState({loadingText: '☁️ connection required!'});
    }
    else if (nextProps.loggingIn){
        this.setState({loadingText: '⚡ logging in ⚡'});
    }
    else if (nextProps.meteorUser && nextProps.postsReady){
        this.props.navigation.navigate('App');
    }
  }

  // Render any loading content that you like here
  render() {
    const { loadingText } = this.state;
    return (
      <View style={styles.container}>
                    <Pulse color='#01b7b7' numPulses={10} diameter={230} speed={5} duration={2000} />
                    <View style={{flex: 1, marginTop: '99%'}}>
                        <Text style={styles.text}>{loadingText}</Text>
                    </View>
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