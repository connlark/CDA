import React, { Component } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import SwiperR from 'react-native-swiper';

import HistoryScreen from '../screens/History';
import Stats from '../screens/Stats';

export default class  extends Component {
    state = {
        showsButtons: true
    }
    componentDidMount(){
        setTimeout(() => {
            this.setState({showsButtons: false});
        }, 400);
    }
    render() {
        return (
            <SwiperR index={0} loop={false} showsButtons={false} removeClippedSubview automaticallyAdjustContentInsets>
                <HistoryScreen/>
                <Stats/>
            </SwiperR>
        );
    }
}

const styles = StyleSheet.flatten({});