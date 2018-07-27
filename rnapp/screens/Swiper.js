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

var PushNotification = require('react-native-push-notification');
var Spinner = require('react-native-spinkit')

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'center',
    marginTop: '30%',
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
  }
})



export default class Swiper extends Component {
  constructor(props){
      super(props)
      this.state = {
          loading: true,
      }
      setTimeout(() => {
          this.setState({loading: false})
      }, 1000);
  }
  componentDidMount(){
    console.log(PushNotification)
  }
  render(){
    const { user, status } = this.props;

    if (status.connected) {
      if (user !== null && user.username){
        return (
          <SwiperR style={styles.wrapper} index={1} showsButtons={false}>
            <Home/>
            <History user={user}/>
            <Settings user={user}/>
         
          </SwiperR>
        );
      }
      return (
        <SwiperR style={styles.wrapper} index={0} showsButtons={false}>
          <Login/>
        </SwiperR>
      );
    }
    return (
      <SwiperR style={styles.wrapper} index={1} showsButtons={false}>
         <Spinner size={200} type='Bounce' color='blue'/>
      </SwiperR>
    );

    }
}