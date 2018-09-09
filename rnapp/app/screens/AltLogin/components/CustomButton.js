import React from 'react'
import { ActivityIndicator, StyleSheet, Text } from 'react-native'
import { View } from 'react-native-animatable'

import TouchableView from './TouchableView'

const CustomButton = ({ testcID, accessibfilityLabel, onPress, isEnabled, isLoading, text, buttonStyle, textStyle, ...otherProps }) => {
  //const onButtonPress = isEnabled && !isLoading ? onPress : () => null

  return (
    <View  {...otherProps}>
      <TouchableView accessible={true} accessibilityLabel={"logdin-dddbutton"} testID={"logdin-button"} onPress={onPress} style={[styles.button, buttonStyle]}>
        {(isLoading) && <ActivityIndicator style={styles.spinner} color={'grey'} />}
        {(!isLoading) && <Text style={[styles.text, textStyle]}>{text}</Text>}
      </TouchableView>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    height: 42,
    borderWidth: 1,
    borderRadius: 9,
    alignSelf: 'stretch',
    justifyContent: 'center',
    borderColor: 'rgba(0, 0, 0, 0.1)'
  },
  spinner: {
    height: 26
  },
  text: {
    textAlign: 'center',
    fontWeight: '400',
    color: 'white'
  }
})

export default CustomButton
