import React, { Component } from 'react';
import { View, Text, StyleSheet, Modal, Alert, Linking, Clipboard, AppState } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import Stepper from 'react-native-js-stepper'
import NavigationBar from 'react-native-navbar';
import { Sae } from 'react-native-textinput-effects';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Button } from 'react-native-elements'
import ReactNativeHaptic from 'react-native-haptic';
import DropdownAlert from 'react-native-dropdownalert';
import Meteor, { withTracker } from 'react-native-meteor';
import Confetti from 'react-native-confetti';

import { IS_X } from '../lib'

export default class componentName extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false,
            TRXaddress: '',
            appState: AppState.currentState,
            readFromQrTRX: false,
            readFromQrCoinEx: true, 
            apiKey: '',
            secretKey: ''
        };
    }

    componentDidMount(){
        AppState.addEventListener('change', this._handleAppStateChange);
    }

    _handleAppStateChange = (nextAppState) => {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            console.log('App has come to the foreground!');
            this.readFromClipboard();
        }
        this.setState({appState: nextAppState});
    }

    componentWillUnmount(){
        AppState.removeEventListener('change', this._handleAppStateChange);
    }

    setModalVisible(visible) {
        this.setState({modalVisible: visible}, () => {
            if (visible){
                this.readFromClipboard();
            }
        });
    }

    toggleConfetti = (active) => {
        if(active && this._confettiView) {
            this._confettiView.startConfetti();
        }
        else if (this._confettiView){
                this._confettiView.stopConfetti();
        }
    }
    readFromClipboard = async () => { 
        if (!this.state.modalVisible) return;  
        const clipboardContent = await Clipboard.getString();  
        if (clipboardContent.length === 34){
            Alert.alert('TRX Address Detected', 'Would you like to use this address for your account?', [
                { text: 'cancel', onPress: () => true },
                { text: 'set', onPress: () => { this.setTRX(clipboardContent); ReactNativeHaptic.generate('notificationSuccess'); }},
            ]);


            this.setState({TRXaddress: clipboardContent}, () => {
                ReactNativeHaptic.generate('notificationSuccess');
            });
        } 
    }

    setTRX = (address) => {
        Meteor.call('Balances.setTRXAddress', address, (err) => {
            if (err){
                console.log(err) 
                this.dropdown.alertWithType('error', 'TRX Add Address Error',err.reason);
            }
            else {
                this.setState({TRXAddress: address}, () => {
                    this.dropdown.alertWithType('success', 'TRX Address Added!','');
                    ReactNativeHaptic.generate('notificationSuccess');
                    this.toggleConfetti(true);
                });
            }
            
        });
    }

    setCoinExAPI = (token) => {
        Meteor.call('Balances.setAPI', token, (err) => {
            if (err){
                console.log(err)
                setTimeout(() => {
                    this.scanner.reactivate();
                }, 500);
                ReactNativeHaptic.generate('notificationError'); 
                return;
            }
            else {
                this.dropdown.alertWithType('success', 'CoinEx API Data Added!','');
                ReactNativeHaptic.generate('notificationSuccess');
                this.toggleConfetti(true);
            }
            
        })
    }

    onRead = (token) => {
        try {
            token = JSON.parse(token.data);
            this.setCoinExAPI(token);
        } catch (error) {
            this.dropdown.alertWithType('error', 'TRX Add Address Error','wrong qr type');
            ReactNativeHaptic.generate('notificationError'); 
            setTimeout(() => {
                this.scanner.reactivate();
            }, 500); 
        }
    }

    onReadTRX = (address) => {
        const TRXADDY = address.data;
        try {
            if (TRXADDY.length !== 34){
                this.dropdown.alertWithType('error', 'TRX Add Address Error','Please enter a valid TRX address!');
                ReactNativeHaptic.generate('notificationError'); 
                setTimeout(() => {
                    this.TRXscanner.reactivate();
                }, 500); 
                return
            }
            this.setTRX(TRXADDY)
        } catch (error) {
            this.dropdown.alertWithType('error', 'TRX Add Address Error','wrong qr type');
            ReactNativeHaptic.generate('notificationError'); 
            setTimeout(() => {
                this.TRXscanner.reactivate();
            }, 500); 
        }
    }

    handleSubmit = () => {
        const { TRXaddress } = this.state;

        if ( TRXaddress.length !== 34){
            this.dropdown.alertWithType('error', 'TRX Add Address Error','Please enter a valid TRX address!');
            ReactNativeHaptic.generate('notificationError'); 
            return
        }

        this.setTRX(TRXaddress)
    }

    handleSubmitCoinEx = () => {
        const { apiKey, secretKey } = this.state;

        if ( apiKey.length === 0 || secretKey.length === 0){
            this.dropdown.alertWithType('error', 'CoinEx Add API Data Error','Please both your API key and secret key!');
            ReactNativeHaptic.generate('notificationError'); 
            return
        }
        this.setCoinExAPI({apiKey, secretKey});
    }

    renderTRXScreen = () => {
        const { readFromQrTRX } = this.state;
        return (
            <View style={{flex: 1, alignItems: 'center', alignContent: 'center'}}>
                { readFromQrTRX ? 
                            <QRCodeScanner
                                ref={component => this.TRXscanner = component}
                                onRead={this.onReadTRX}
                                reactivateTimeout={3}
                                topViewStyle={{
                                    height: 140,
                                    margin: 5
                                }}
                                cameraStyle={{
                                    marginTop: '10%',
                                    width: '70%',
                                    height: '70%',
                                    marginLeft: '15%',
                                    borderRadius: 9
                                }}
                                topContent={
                                    <View style={{}}>
                                        <Text onPress={() => Linking.openURL('https://tronscan.org/#/account')} style={styles.centerText}>
                                            Go to tronscan.org and click the button 'show QR code' located next to your address (left click on desktop)
                                        </Text>
                                    </View>
                                }
                            />
                    :
                        <Sae
                            label={'TRX Wallet Address'}
                            iconClass={Ionicons}
                            iconName={'ios-key'}
                            iconColor={'grey'}
                            // TextInput props
                            style={{ width: '90%'}}
                            inputStyle={{color: 'black'}}
                        //https://tronscan.org/#/wallet/new
                            autoCapitalize={'none'}
                            labelStyle={{ color: 'grey' }}
                            onChangeText={(text) => { this.setState({TRXaddress: text}) }}
                            autoCorrect={false}   
                            onSubmitEditing={this.handleSubmit}
                            value={this.state.TRXaddress}
                        />
                
                }
                
                <View style={{top: readFromQrTRX ? '-11%':'87%'}} flexDirection={'row'}>

            
                <Button
                    color={'white'}
                    backgroundColor={'#9bc2cf'}
                    borderRadius={9}             
                    icon={{name: readFromQrTRX ? 'add':'camera', type: 'ionicons'}}
                    title={readFromQrTRX ?'Manually Add':'Read From QR'}
                    onPress={() => this.setState({readFromQrTRX: !readFromQrTRX})}
                />
                <Button
                    color={'white'}
                    backgroundColor={'#9bc2cf'}
                    borderRadius={9}             
                    icon={{name: 'create', type: 'ionicons'}}
                    title={'Create Wallet'}
                    onPress={() => Linking.openURL('https://tronscan.org/#/wallet/new')}
                />
                </View>

            </View>
        );
    }

    renderQRScreen = () => {
        const { readFromQrCoinEx } = this.state;
        return (
            <View style={{flex: 1, alignItems: 'center', alignContent: 'center'}}>
                { readFromQrCoinEx ? 
                    <QRCodeScanner
                            ref={component => this.scanner = component}
                            onRead={this.onRead}
                            reactivateTimeout={3}
                            /*containerStyle={{
                                alignItems: 'center', 
                                alignContent: 'center'
                            }}*/
                            cameraStyle={{
                                alignItems: 'center', 
                                marginTop: '10%',
                                width: '70%',
                                height: '70%',
                                marginLeft: '15%',
                                borderRadius: 9,
                                marginBottom: '-10%'
                            }}
                            topContent={
                                <Text style={styles.centerText}>
                                    Go to <Text style={styles.textBold}>https://www.coinex.com/apikey</Text> on your computer and scan the QR code for an API key.
                                </Text>
                            }
                            bottomContent={null}
                    />

                :   
                    <>
                        <Sae
                            label={'API Key'}
                            iconClass={Ionicons}
                            iconName={'ios-key'}
                            iconColor={'grey'}
                            // TextInput props
                            style={{ width: '90%'}}
                            inputStyle={{color: 'black'}}
                        //https://tronscan.org/#/wallet/new
                            autoCapitalize={'none'}
                            labelStyle={{ color: 'grey' }}
                            onChangeText={(text) => { this.setState({apiKey: text}) }}
                            autoCorrect={false}   
                            value={this.state.apiKey}
                           // onSubmitEditing={this.handleSubmitCoinEx}
                        />
                        <Sae
                            label={'API Secret'}
                            iconClass={Ionicons}
                            iconName={'ios-key'}
                            iconColor={'grey'}
                            // TextInput props
                            style={{ width: '90%'}}
                            inputStyle={{color: 'black'}}
                        //https://tronscan.org/#/wallet/new
                            autoCapitalize={'none'}
                            labelStyle={{ color: 'grey' }}
                            onChangeText={(text) => { this.setState({secretKey: text}) }}
                            autoCorrect={false}   
                            onSubmitEditing={this.handleSubmitCoinEx}
                            value={this.state.secretKey}
                        />
                    </>
                }

                <View style={{marginBottom: '3.5%', height: 70, marginTop: readFromQrCoinEx ? 0:'70%'}} flexDirection={'row'}>
                                <Button
                                    color={'white'}
                                    backgroundColor={'#9bc2cf'}
                                    borderRadius={9}   
                                    buttonStyle={{height: 43}}          
                                    icon={{name: readFromQrCoinEx ? 'add':'camera', type: 'ionicons'}}
                                    title={readFromQrCoinEx ?'Manually Add':'Read From QR'}
                                    onPress={() => this.setState({readFromQrCoinEx: !readFromQrCoinEx})}
                                />
                                <Button
                                    color={'white'}
                                    backgroundColor={'#9bc2cf'}
                                    borderRadius={9}  
                                    buttonStyle={{height: 43}}          
                                    icon={{name: 'send', type: 'ionicons'}}
                                    title={'Go To CoinEx'}
                                    onPress={() => Linking.openURL('https://www.coinex.com/apikey')}
                                />
                            </View> 
             </View>
        )
    }

    cleanup = () => {
        ReactNativeHaptic.generate('impactLight');
        this.toggleConfetti(false);
        this.setState({
            readFromQrTRX: false
        });
    }

    render() {
        const leftButtonConfig = {
            title: 'Back',
            handler: () => this.setModalVisible(false),
        };

        return (
            <View style={{flex: 1}}>
                <Modal
                    hardwareAccelerated
                    animationType="slide"
                    transparent={false}
                    visible={this.state.modalVisible}
                    presentationStyle={'overFullScreen'}
                    onRequestClose={this.props.onRequestClose}
                    onShow= {() => {}}
                >
                    <NavigationBar
                        leftButton={leftButtonConfig}
                        style={{marginBottom: -20, marginTop: IS_X ? 10:0}}
                    />
                    <Stepper
                        ref={component => this.stepper = component}
                        validation={false}
                        onPressNext={this.cleanup}
                        onPressBack={this.cleanup}
                        onScrollPage={this.cleanup}
                        activeDotStyle={styles.activeDot}
                        inactiveDotStyle={styles.inactiveDot}
                        showTopStepper={true}
                        showBottomStepper={true}
                        steps={['TRX Wallet', 'CoinEx Keys']}
                        backButtonTitle=""
                        nextButtonTitle=""
                        activeStepStyle={styles.activeStep}
                        inactiveStepStyle={styles.inactiveStep}
                        activeStepTitleStyle={styles.activeStepTitle}
                        inactiveStepTitleStyle={styles.inactiveStepTitle}
                        activeStepNumberStyle={styles.activeStepNumber}
                        inactiveStepNumberStyle={styles.inactiveStepNumber}>
                            {[this.renderTRXScreen(), this.renderQRScreen()]}
                    </Stepper>
                    <Confetti ref={(node) => this._confettiView = node}/>
                    <DropdownAlert ref={ref => this.dropdown = ref} closeInterval={1000} />

                </Modal>
            </View>
        );
    }
}




const styles = StyleSheet.create({
    activeDot: {
      backgroundColor: 'grey'
    },
    centerText: {
        fontWeight: 'bold',
        fontSize: 12,
    },
    inactiveDot: {
      backgroundColor: '#ededed'
    },
    activeStep: {
      backgroundColor: 'grey'
    },
    inactiveStep: {
      backgroundColor: '#ededed'
    },
    activeStepTitle: {
      fontWeight: 'bold'
    },
    inactiveStepTitle: {
      fontWeight: 'normal'
    },
    activeStepNumber: {
      color: 'white'
    },
    inactiveStepNumber: {
      color: 'black'
    }
  })