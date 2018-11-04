import React, { Component } from 'react';
import { View, Text, StyleSheet, Modal, Alert, Linking, Clipboard, AppState, Platform, Image } from 'react-native';
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
import ModalMe from 'react-native-modalbox';
import LottieView from 'lottie-react-native';
import { material, human, iOSUIKit, iOSColors} from 'react-native-typography'

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
            secretKey: '',
            isDisabled: false,
            infoModalOpen: false,
            infoModalTest:'',
            isScanQR: false
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
            setTimeout(() => {
                Alert.alert('TRX Address Detected', 'Would you like to use this address for your account?', [
                    { text: 'cancel', onPress: () => true },
                    { text: 'set', onPress: () => { this.setTRX(clipboardContent); if (Platform.OS !== 'android') ReactNativeHaptic.generate('notificationSuccess'); }},
                ]);
    
    
                this.setState({TRXaddress: clipboardContent}, () => {
                    if (Platform.OS !== 'android') ReactNativeHaptic.generate('notificationSuccess');
                });
            }, 1000);
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
                    if (Platform.OS !== 'android') ReactNativeHaptic.generate('notificationSuccess');
                    this.toggleConfetti(true);
                    this.setState({infoModalTest: 'TRX Address Added!'}, () => {
                        this.setState({infoModalOpen: true})
                    })
                });
            }
            
        });
    }

    setCoinExAPI = (token) => {
        Meteor.call('Balances.setAPI', token, (err, resp) => {
            if (err){
                console.log(err)
                setTimeout(() => {
                    if (this.scanner){
                        this.scanner.reactivate();
                    }
                }, 500);
                this.dropdown.alertWithType('error', err.reason,'');
                if (Platform.OS !== 'android') ReactNativeHaptic.generate('notificationError'); 
                return;
            }
            else {
                this.dropdown.alertWithType('success', 'CoinEx API Data Added!','');
                if (Platform.OS !== 'android') ReactNativeHaptic.generate('notificationSuccess');
                this.toggleConfetti(true);
                this.setState({infoModalTest: 'CoinEx Keys Added!'}, () => {
                    this.setState({infoModalOpen: true})
                })
            }
        })
    }

    onRead = (token) => {
        try {
            token = JSON.parse(token.data);
            this.setCoinExAPI(token);
        } catch (error) {
            this.dropdown.alertWithType('error', 'TRX Add Address Error','wrong qr type');
            if (Platform.OS !== 'android') ReactNativeHaptic.generate('notificationError'); 
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
                if (Platform.OS !== 'android') ReactNativeHaptic.generate('notificationError'); 
                setTimeout(() => {
                    this.TRXscanner.reactivate();
                }, 500); 
                return
            }
            this.setTRX(TRXADDY)
        } catch (error) {
            this.dropdown.alertWithType('error', 'TRX Add Address Error','wrong qr type');
            if (Platform.OS !== 'android') ReactNativeHaptic.generate('notificationError'); 
            setTimeout(() => {
                this.TRXscanner.reactivate();
            }, 500); 
        }
    }

    handleSubmit = () => {
        const { TRXaddress } = this.state;

        if ( TRXaddress.length !== 34){
            this.dropdown.alertWithType('error', 'TRX Add Address Error','Please enter a valid TRX address!');
            if (Platform.OS !== 'android') ReactNativeHaptic.generate('notificationError'); 
            return
        }

        this.setTRX(TRXaddress)
    }

    handleSubmitCoinEx = () => {
        const { apiKey, secretKey } = this.state;

        if ( apiKey.length === 0 || secretKey.length === 0){
            this.dropdown.alertWithType('error', 'CoinEx Add API Data Error','Please both your API key and secret key!');
            if (Platform.OS !== 'android') ReactNativeHaptic.generate('notificationError'); 
            return
        }
        this.setCoinExAPI({apiKey, secretKey});
    }

    renderTRXScreen = () => {
        const { readFromQrTRX, helpTRX } = this.state;
        return (
            <View style={{flex: 1, alignItems: 'center', alignContent: 'center'}}>
                { readFromQrTRX ? 
                            <QRCodeScanner
                                ref={component => this.TRXscanner = component}
                                onRead={this.onReadTRX}
                                reactivateTimeout={4}
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
                                    <View style={{zIndex: 100}}>
                                        <Text onPress={() => Linking.openURL('https://tronscan.org/#/account')} style={styles.centerText}>
                                            Go to tronscan.org and click the button 'show QR code' located next to your address (left click on desktop)
                                        </Text>
                                    </View>
                                }
                            />
                    :   
                        <>
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
                        { this.state.helpTRX && 
                            <>
                            <Image
                                source={require('../images/trxShow.png')}
                                style={{marginTop: 40, width: '80%', height:'20%'}}
                            />
                            <Text> Go to tronscan.org and login to your TRX account. Then, come back and input your address</Text>

                            </>
                        }
                        </>
                }
                
                <View style={{top: readFromQrTRX ? '-11%': helpTRX ? '57%':'87%'}} flexDirection={'row'}>

            
                <Button
                    color={'white'}
                    backgroundColor={'#9bc2cf'}
                    borderRadius={9}             
                    icon={{name: readFromQrTRX ? 'add':'camera', type: 'ionicons'}}
                    title={readFromQrTRX ?'Manually Add':'Read From QR'}
                    onPress={() => {
                        this.setState({readFromQrTRX: !readFromQrTRX}, () => {
                            if (!this.state.hasShownQR){
                                this.setState({isScanQR: true}, () => {
                                    this.setState({infoModalOpen: true, hasShownQR: true})
                                })
                            }
                        });
                    }}
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
                <Button
                    color={'white'}
                    backgroundColor={'#9bc2cf'}
                    borderRadius={9}             
                    icon={{name: 'help', type: 'ionicons'}}
                    title={'Help'}
                    onPress={() => this.setState({helpTRX: !this.state.helpTRX})}
                />
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
                            topViewStyle={{
                                    height: 140,
                                    margin: 5
                            }}
                            cameraStyle={{
                                    marginTop: '10%',
                                    width: '70%',
                                    height: '70%',
                                    marginLeft: '15%',
                                    marginBottom: '-10%',
                                    borderRadius: 9
                                }}
                            containerStyle={{
                                borderRadius: 9
                            }}
                            topContent={
                                <>
                                <Text style={[styles.centerText, styles.infoText]}>
                                    Go to <Text style={styles.textBold}>https://www.coinex.com/apikey</Text> on your computer and scan the QR code for an API key.
                                </Text>
                                <View style={{marginTop: 10}}/>
                                <Text style={[styles.centerTextRed,styles.infoREDText]}>
                                    NOTE: You must add <Text style={styles.textBoldRed}>104.154.43.177</Text> to your IP White List
                                </Text>
                                </>
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
        if (Platform.OS !== 'android') ReactNativeHaptic.generate('impactLight'); 

        this.toggleConfetti(false);
        this.setState({
            readFromQrTRX: false
        });

        if (!this.state.hasShownQR){
            this.setState({isScanQR: true}, () => {
                this.setState({infoModalOpen: true, hasShownQR: true})
            })
        }
    }

    render() {
        const { isScanQR } = this.state;
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
                        steps={['Tron Wallet', 'CoinEx Account']}
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
                    <Confetti size={2} confettiCount={200} ref={(node) => this._confettiView = node}/>
                    <ModalMe onClosed={() => this.setState({infoModalOpen: false, isScanQR: false})} style={[styles.modal]} backdropOpacity={0.23} position={"center"} ref={"modal3"} isOpen={this.state.infoModalOpen}>
                        <View style={{flex: 1, alignItems: 'center'}}>   
                            <LottieView
                                source={isScanQR ? require('../lottie/scan_qr_code_success.json'):require('../lottie/check_animation.json')}
                                autoPlay
                                loop={isScanQR}
                                style={{height: 300, width: 300, marginLeft: isScanQR? 15:0, marginTop: isScanQR? -3:0}}
                            />
                            <Text style={[{marginTop: isScanQR ? -280:-295},styles.infoText]}>{isScanQR ? 'Scan QR to add assets automatically':this.state.infoModalTest}</Text>


                        </View>
                    </ModalMe>
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
        zIndex: 100
    },
    centerText: {
        fontWeight: 'bold',
        fontSize: 12,
        zIndex: 100
    },
    centerTextRed: {
        fontWeight: 'bold',
        fontSize: 12,
        color: 'red',
        zIndex: 100
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
    },
    modal: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 300,
        width: 300,
        borderRadius: 50
    },
    infoText: {
        ...iOSUIKit.footnoteEmphasizedObject,
        color: iOSColors.gray
      },
      infoREDText: {
        ...iOSUIKit.footnoteEmphasizedObject,
        color: iOSColors.red
      }
  })