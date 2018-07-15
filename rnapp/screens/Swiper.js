import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';
import SwiperR from 'react-native-swiper';
import Home from './Home';
var Spinner = require('react-native-spinkit')

const styles = StyleSheet.create({
  wrapper: {
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
  render(){
        return (
            <SwiperR style={styles.wrapper} index={3} showsButtons={false}>
              <View style={styles.slide2}>
                <Text style={styles.text}>Beautiful</Text>
              </View>
              <View style={styles.slide3}>
                <Text style={styles.text}>And simple</Text>
              </View>
              <Home/>
            </SwiperR>
          );
    }
    
  
}