import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import Pulse from 'react-native-pulse';
import LottieView from 'lottie-react-native';

export default Loading = ({color}) => {
  return (
      <LottieView
          source={require('../lottie/waterload.json')}
          autoPlay
          loop
      />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'lightblue',
  },
});
