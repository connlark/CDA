import React, { Component, PropTypes } from 'react'
import { StyleSheet, StatusBar, Platform} from 'react-native'
import { Text, View } from 'react-native-animatable'
import { Button, SocialIcon } from 'react-native-elements'

import CustomButton from '../../components/CustomButton'
import metrics from '../../config/metrics'
import Loading from '../../../../components/loading'
export default class Opening extends Component {

  render () {
    if(this.props.isLoading){
      return (
        <View style={styles.container}>
        <View>
          <Loading/>
        </View>
        </View>
      )
    }
    if (Platform.OS !== 'android'){
      return (
        <View style={styles.container}>
        <StatusBar
         hidden
        />
          <View animation={'zoomIn'} delay={600} duration={400}>
            <CustomButton
              text={'Create Account'}
              onPress={this.props.onCreateAccountPress}
              buttonStyle={styles.createAccountButton}
              textStyle={styles.createAccountButtonText}
            />
          </View>
          <View style={styles.separatorContainer} animation={'zoomIn'} delay={700} duration={400}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorOr}>{'🆚'}</Text>
            <View style={styles.separatorLine} />
          </View>
          <View animation={'zoomIn'} delay={800} duration={400}>
            <CustomButton
              accessible={true}
              accessibilityLabel={"login"}
              testID="23135thisisit"
              text={'Sign In'}
              onPress={this.props.onSignInPress}
              buttonStyle={styles.signInButton}
              textStyle={styles.signInButtonText}
            />
          </View>
          <View style={styles.separatorContainer} animation={'zoomIn'} delay={700} duration={400}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorOr}>{'🆚'}</Text>
            <View style={styles.separatorLine} />
          </View>
          <View animation={'zoomIn'} delay={800} duration={400}>
        
            <SocialIcon
              title='Continue With Google'
              button
              type='google-plus-official'
              onPress={this.props.onGoogleSignInPress}
              style={{ marginBottom: 10, borderRadius:9, height: 52,}}
          />
          </View>
        </View>
      )
    }
    else {
      return (
        <View style={styles.container}>
        <StatusBar
         hidden
        />
          <View animation={'zoomIn'} delay={600} duration={400}>
            <CustomButton
              text={'Create Account'}
              onPress={this.props.onCreateAccountPress}
              buttonStyle={styles.createAccountButton}
              textStyle={styles.createAccountButtonText}
            />
          </View>
          <View style={styles.separatorContainer} animation={'zoomIn'} delay={700} duration={400}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorOr}>{'🆚'}</Text>
            <View style={styles.separatorLine} />
          </View>
          <View animation={'zoomIn'} delay={800} duration={400}>
            <CustomButton
              accessible={true}
              accessibilityLabel={"login"}
              testID="23135thisisit"
              text={'Sign In'}
              onPress={this.props.onSignInPress}
              buttonStyle={styles.signInButton}
              textStyle={styles.signInButtonText}
            />
          </View>
        </View>
      )
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: metrics.DEVICE_WIDTH * 0.1,
    justifyContent: 'center'
  },
  createAccountButton: {
    backgroundColor: '#9B9FA4'
  },
  createAccountButtonText: {
    color: 'white'
  },
  separatorContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: 20
  },
  separatorLine: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    height: StyleSheet.hairlineWidth,
    borderColor: '#9B9FA4'
  },
  separatorOr: {
    color: '#9B9FA4',
    marginHorizontal: 8
  },
  signInButton: {
    backgroundColor: '#1976D2'
  },
  signInButtonText: {
    color: 'white'
  }
})
