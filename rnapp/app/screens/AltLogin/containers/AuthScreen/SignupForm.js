import React, { Component } from 'react'
import { StyleSheet, StatusBar } from 'react-native'
import { Text, View } from 'react-native-animatable'
import { withNavigation } from 'react-navigation';

import CustomButton from '../../components/CustomButton'
import CustomTextInput from '../../components/CustomTextInput'
import metrics from '../../config/metrics'

class SignupForm extends Component {
  state = {
    email: '',
    password: '',
    fullName: ''
  }

  hideForm = async () => {
    if (this.buttonRef && this.formRef && this.linkRef) {
      await Promise.all([
        this.buttonRef.zoomOut(200),
        this.formRef.fadeOut(300),
        this.linkRef.fadeOut(300)
      ])
    }
  }

  anon = () => {
    this.props.navigation.navigate('AuthLoading')
  }

  render () {
    const { email, password, fullName } = this.state
    const { isLoading, onLoginLinkPress, onSignupPress } = this.props
    const isValid = email !== '' && password !== '' && fullName !== ''
    return (
      <View style={styles.container}>
        <StatusBar
        hidden
        />
        <View style={styles.form} ref={(ref) => this.formRef = ref}>
          <CustomTextInput
            ref={(ref) => this.emailInputRef = ref}
            placeholder={'Username'}
            keyboardType={'email-address'}
            editable={!isLoading}
            returnKeyType={'next'}
            blurOnSubmit={false}
            withRef={true}
            onSubmitEditing={() => this.passwordInputRef.focus()}
            onChangeText={(value) => this.setState({ email: value })}
            isEnabled={!isLoading}
          />
          <CustomTextInput
            ref={(ref) => this.passwordInputRef = ref}
            placeholder={'Password'}
            editable={!isLoading}
            returnKeyType={'done'}
            secureTextEntry={true}
            withRef={true}
            onChangeText={(value) => this.setState({ password: value })}
            isEnabled={!isLoading}
          />
        </View>
        <View style={styles.footer}>

          <View animation={'bounceIn'} duration={600} delay={400}>
            <CustomButton
              onPress={this.anon}
              isEnabled={isValid}
              isLoading={isLoading}
              buttonStyle={styles.createAccountButton}
              textStyle={styles.createAccountButtonText}
              text={'Sign in Anonymously'}
            />
          </View>
          <View ref={(ref) => this.buttonRef = ref} style={{marginTop: 10}} animation={'bounceIn'} duration={600} delay={400}>
            <CustomButton
              onPress={() => onSignupPress(email, password, fullName)}
              isEnabled={isValid}
              isLoading={isLoading}
              buttonStyle={styles.createAccountButton}
              textStyle={styles.createAccountButtonText}
              text={'Create Account'}
            />
          </View>
          
          <Text
            ref={(ref) => this.linkRef = ref}
            style={styles.loginLink}
            onPress={onLoginLinkPress}
            animation={'fadeIn'}
            duration={600}
            delay={400}
          >
            {'Already have an account?'}
          </Text>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: metrics.DEVICE_WIDTH * 0.1
  },
  form: {
    marginTop: 20,
    marginBottom:70,
  },
  footer: {
    height: 100,
    marginBottom: 40,
    marginTop: -30,
    justifyContent: 'center'
  },
  createAccountButton: {
    backgroundColor: 'white'
  },
  createAccountButtonText: {
    color: '#3E464D',
    fontWeight: 'bold'
  },
  loginLink: {
    color: 'rgba(255,255,255,0.6)',
    alignSelf: 'center',
    padding: 20
  }
})


export default withNavigation(SignupForm);