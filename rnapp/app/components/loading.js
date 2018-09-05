import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import Pulse from 'react-native-pulse';

export default Loading = ({color}) => {
  return (
    <View style={styles.container}>
      <Pulse color={color ? color : '#01b7b7'} numPulses={10} diameter={230} speed={5} duration={2000} />
    </View>
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
