import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';
import SwiperR from 'react-native-swiper';
import MeteorListView from '../node_modules/react-native-meteor/src/components/ComplexListView';
import Meteor, { withTracker } from 'react-native-meteor';
import Home from './Home';
import Login from './Login';
import Settings from './Settings';
import History from './History';
import Stats from './Stats';

import { IS_X } from '../config/styles';
var PushNotification = require('react-native-push-notification');
var Spinner = require('react-native-spinkit')

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  slide1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9DD6EB',
  },
  slide2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#97CAE5',
  },
  slide3: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#92BBD9',
  },
  text: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  loadingView: {
    height: '40%',
    justifyContent: 'center',
    alignItems: 'center',
  }
})



export default class Swiper extends Component {
  constructor(props){
      super(props)
      this.state = {
          color: 'blue',
          colorIndex: 0,
      }

      setTimeout(() => {
          this.setState({color: 'purple'})
      }, 1500);
  }
  componentDidMount(){
    console.log(PushNotification)
  }
  render(){
    const status = Meteor.status().connected;
    const user = Meteor.user();

    if (status.connected) {
      if (user !== null && user.username){
        return (
     
            <Home/> 
        
        );
      }
      return (
        
          <Login/>
      
      );
    }
    return (
      <SwiperR index={1} showsButtons={false}>
         <View style={styles.loadingView}>
           <Spinner size={200} type='9CubeGrid' color={this.state.color}/>
         </View>
      </SwiperR>
    );

    }
}