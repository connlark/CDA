import React, { Component } from 'react';
import { Text, StyleSheet, View, TouchableHighlight, TouchableOpacity, WebView, StatusBar,Alert, Platform,ScrollView, AppState, Modal } from 'react-native';
import Meteor, { withTracker } from 'react-native-meteor';
import DeviceInfo from 'react-native-device-info';
import {Avatar, Header, Icon, Badge} from 'react-native-elements';
import DropdownAlert from 'react-native-dropdownalert';
import Grid from 'react-native-grid-component';
import ReactNativeHaptic from 'react-native-haptic';
import AddCredentialsModal from '../components/addCredentialsModal'
import * as Animatable from 'react-native-animatable';
import AwesomeAlert from 'react-native-awesome-alerts';
import PushNotification from 'react-native-push-notification';
import store from '../config/store';
import { recieveBalanceData, recieveCoinData } from '../Actions/meteorData'
import { connect } from 'react-redux';
import { material, human, iOSUIKit, iOSColors} from 'react-native-typography'
import moment from 'moment';
import NumberTicker from 'react-native-number-ticker';
import Ticker from "react-native-ticker";

import { numberWithCommas } from '../lib'
import Loading from '../components/loading'
import NeedData from '../components/needData'
import { IS_X } from '../config/styles';
import { storeItem, retrieveItem } from '../lib';

const backgColors = JSON.parse('{"https://www.cryptocompare.com/media/30002253/coinex.png":"#9bfefb","https://www.cryptocompare.com/media/19633/btc.png":"#febe5a","https://www.cryptocompare.com/media/1383919/12-bitcoin-cash-square-crop-small-grn.png":"#C4E0A6","https://www.cryptocompare.com/media/1383672/usdt.png":"#57dfb4","https://www.cryptocompare.com/media/34477776/xrp.png":"#cbcdcf","https://www.cryptocompare.com/media/20646/eth_logo.png":"#B9C5F5","https://www.cryptocompare.com/media/33842920/dash.png":"#7DC3F2","https://www.cryptocompare.com/media/19782/litecoin-logo.png":"#d3d3d3","https://www.cryptocompare.com/media/1383652/eos_1.png":"#d3d3d3","https://www.cryptocompare.com/media/1383858/neo.jpg":"#ddfbaf","https://www.cryptocompare.com/media/33752295/etc_new.png":"#cef3ce","https://banner2.kisspng.com/20180330/wgw/kisspng-bitcoin-cryptocurrency-monero-initial-coin-offerin-bitcoin-5abdfe6b87dad3.2673609815224008755565.jpg":"#ca9658","https://www.cryptocompare.com/media/20084/btm.png":"#a993ce","https://www.cryptocompare.com/media/27010814/bcy.jpg":"#fe7dbc","https://www.cryptocompare.com/media/12318137/hsr.png":"#b2a8d9","https://www.cryptocompare.com/media/34477813/card.png":"#20329d","https://www.cryptocompare.com/media/34477783/olt.jpg":"#bff0f5","https://www.cryptocompare.com/media/351360/zec.png":"#8e773b","https://www.cryptocompare.com/media/19684/doge.png":"#eed67c","https://www.cryptocompare.com/media/34477805/trx.jpg":"#fd1a1a","https://pbs.twimg.com/profile_images/1013352125361819648/z2fvUNDq_400x400.jpg":"#cbca06"}');
let ws;
var assert = require('assert');

class AltHome extends Component {
    constructor(props){
        super(props);
        this.state = { 
            refreshing: false,
            showUSDValue: false,
            cryptoObj: {},
            showWebView: false,
            appState: AppState.currentState,
            connected: false,
            showingCoins: [],
            modalVisible: false,
            loadingTimePassed: false,
            isConnectedToWS: false
        };

        const { cryptoObj } = this.state;
        this.setUpWS();
        /*PushNotification.localNotificationSchedule({
            //... You can use all the options from localNotifications
            message: "My Notification Message", // (required)
            date: new Date(Date.now() + (5 * 1000)) // in 60 secs
          });*/

          
        setTimeout(() => {this.setState({loadingTimePassed: true})}, 1000)
    }

    componentWillUnmount(){
        if (ws && ws.readyState !== ws.CLOSED) {
            ws.close()
        }

        AppState.removeEventListener('change', this._handleAppStateChange);
    }

    static getDerivedStateFromProps(props, state) {
        const { balancesReady, balances } = props;

        if (balancesReady && Array.isArray(balances?.[0]?.balanceData) && balances?.[0]?.balanceData.length > 0 && props.balances !== state.prevBalance) {
            console.log('getDerivedStateFromProps');
            store.dispatch(recieveBalanceData(props.balances[0]))
            return {
                prevBalance: props.balances,
            };
        }
        
        return null;
    }

    _handleAppStateChange = (nextAppState) => {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
          console.log('App has come to the foreground!')
        
          this.setUpWS();
        }
        else if (ws) {
            ws.close()
        }
        this.setState({appState: nextAppState});
    }

    refreshBalances = () => {
        Meteor.call('Balances.checkForNewBalance', (err) => {
            if (err){
                console.log(err) 
            }
        })
    }

    setUpWS = () => {
        if (ws && ws.readyState !== ws.CLOSED) return;
        ws = new WebSocket('wss://socket.coinex.com/');

        ws.onopen = () => {
            // connection opened
            console.log("I openend the connection without troubles!");
            if (Platform.OS !== 'android') ReactNativeHaptic.generate('notificationSuccess')
            // First step is to try subscribe to the proper channel

            let payload = {
                "method": "state.subscribe",
                "params": [],
                "id": parseInt(Math.random()*10000)                
            }
            let subscribe_command = JSON.stringify(payload)
            if (ws){
                ws.send(subscribe_command); // send a message
            }
            else {
                setTimeout(() => {
                    this.setUpWS()
                }, 600);
            }
        };

        ws.onmessage = (e) => {
            let data_received = JSON.parse(e.data).params;
            if (typeof data_received === 'object'){
                const o = data_received[0];
                const newobjm = {};
                Object.keys(o).map((e) => {
                    if ((e.substring(e.length-3,e.length) === 'SDT' || e.substring(e.length-3,e.length) === 'BCH') && typeof o[e] !== 'undefined'){
                        newobjm[e] = o[e].last;
                    }
                })

                const newObj = Object.assign(this.state.cryptoObj, newobjm);
                const me = {...this.state.cryptoObj, ...newobjm };

                if (me !== this.state.cryptoObj){
                    this.setState({cryptoObj: newObj}, () => {
                        const { cryptoObj } = this.state;
                        const { cryptoObjRexux, balanceDataRedux } = this.props;
                        const pairs = [];
                        const needed = Object.keys(cryptoObj)?.map((val) => {
                            balanceDataRedux?.balanceData?.balanceData.map((e) => {
                                if(e.coin === val.substring(0,e.coin.length)){
                                    const f = cryptoObj[val]
                                    pairs.push({pair: val, price: f});
                                }
                            })
                        });
                        if (cryptoObjRexux?.[0] !== pairs[0] ){
                            store.dispatch(recieveCoinData(pairs))
                        }
                    });
                } 
            }
        }
        
        ws.onclose = (e) => {
            this.setState({cryptoObj: {}});
        };
    }

    _keyExtractor = (item, index) => item.coin;

    _renderHeader = () => {
        const { cryptoObj } = this.state;
        return (
            <View style={styles.headerView}> 
                <Text style={styles.date}>       {moment(new Date).format("MMMM Do")} {Object.keys(cryptoObj).length > 0 || '  🔴 '}</Text>
                <Text onPress={() => this.setState({showUSDValue: !this.state.showUSDValue})} style={styles.headerText}>  Balances </Text> 
            </View>
        )
    }
    componentDidMount(){
        AppState.addEventListener('change', this._handleAppStateChange);
        retrieveItem('notificationsPushToken').then((data) => {
            if (data && data.token){
              Meteor.call('notifications.set.pushToken', data, err => {
                //if (err) { alert(`notifications.set.pushToken: ${err.reason}`); }
              });
            }
          });
    }

    sortData = (data) => {
        if (!data) return;
        data = data.filter((e) => typeof e.USDvalue !== 'undefined')
        return data.sort( (a,b) => {
            if (a.USDvalue && b.USDvalue){

                return b.USDvalue-a.USDvalue;
            }
            else if (b.USDvalue) {
                return true;
            }
            return false;
        });
    }
    refreshData = () => {
        this.setState({refreshing: true});

        Meteor.call('Balances.checkForNewBalance', (err) => {
            if (err){
                console.log(err) 
                this.dropdown.alertWithType('error', 'Error', err.reason);
            }
            else {
                this.dropdown.alertWithType('success', 'Refreshed Sucessfully','☻ ☻ ☻ ☻ ☻ ☻ ☻');
            }
            this.setState({refreshing: false})
        })
    }

    _renderGridItem = (item, i) => {
        const { hasPNG, color, formattedBalance, formattedUSDBalance, formattedName, imagePNG, imgUrl} = item;
        let bal = 0;
        if (this.state.cryptoObj[`${item.coin}USDT`]){
            bal = Number(item.balance) * Number(this.state.cryptoObj[`${item.coin}USDT`])
        }
        else if (this.state.cryptoObj[`${item.coin}BCH`]){
            bal = Number(item.balance) * Number(this.state.cryptoObj[`BCHUSDT`]) * Number(this.state.cryptoObj[`${item.coin}BCH`])
        }
        else if (item.coin === 'SEED' && this.state.cryptoObj[`TRXBCH`]){
            bal = Number(item.balance) * Number(this.state.cryptoObj[`BCHUSDT`]) * Number(this.state.cryptoObj[`TRXBCH`])
        }
        
        return (
        <View style={[{ backgroundColor: color ? color:'white', alignItems: 'center', borderRadius: 9 }, styles.item]} key={i}>
            <View style={{marginTop: 10, marginBottom: 10}}>
                <Text adjustsFontSizeToFit style={{fontSize: 12}} numberOfLines={1}> {formattedName} </Text>
            </View>
            { hasPNG ? 
                    <Avatar
                    rounded
                    large
                    //title={String(item.fullName).substring(0,2)}
                   // source={imagePNG}
                   source={imagePNG}
                //source={require('../../node_modules/cryptocurrency-icons/128/color/btc.png')} 
                onPress={() => {
                        this.setState({selectedCoinObj: {
                            url:'https://www.cryptocompare.com'+item.ccurl,
                            name: item.fullName
                        }}, () => {
                            this.setState({showWebView: true});
                        });
                    }}
                    activeOpacity={0.4}
                    containerStyle={{ backgroundColor: 'transparent'}}
                    overlayContainerStyle={{backgroundColor: 'transparent'}}
                />
            :
                <Avatar
                    rounded
                    large
                    //title={String(item.fullName).substring(0,2)}
                    source={{uri: imgUrl, cache: 'force-cache'}}
                    onPress={() => {
                        this.setState({selectedCoinObj: {
                            url:'https://www.cryptocompare.com'+item.ccurl,
                            name: item.fullName
                        }}, () => {
                            this.setState({showWebView: true});
                        });
                    }}
                    activeOpacity={0.4}
                    containerStyle={{ backgroundColor: 'transparent'}}
                    overlayContainerStyle={{backgroundColor: 'transparent'}}
                />
            }
            
            <View style={{marginTop: 10}}>
                <Text adjustsFontSizeToFit numberOfLines={1} style={{fontSize: 10}}> {formattedBalance} {item.coin}</Text>
            </View>
            <View style={{marginTop: 10, marginBottom: 100, flexDirection: 'row', alignItems: 'center', justifyContent: "center"}}>
                <Text adjustsFontSizeToFit numberOfLines={1} style={{fontSize: 14}}>💲</Text>
                <Text adjustsFontSizeToFit numberOfLines={1} style={{fontSize: 14}}>{bal === 0 ? formattedUSDBalance: numberWithCommas(bal.toFixed(3))}</Text>
            </View>
        </View>
      );
    }

    setModalVisible(visible) {
        this.setState({modalVisible: visible});
    }

    closeModal = () => {
        setState({
            modalVisible: false
        });
    }

    itemHasChanged = (item, d2) => {
        return true;
    }

    render() {
        const { balances, balancesReady, balanceDataRedux } = this.props;
        const { refreshing, showWebView, selectedCoinObj } = this.state;

        if(showWebView){ 
            const { url, name } = selectedCoinObj;

            return (
                <View style={{flex: 1}}>
                    <Header
                        leftComponent={{ icon: 'arrow-back', underlayColor: 'trasparent', color: '#fff', onPress: () => this.setState({showWebView: false}) }}
                        centerComponent={{ text: name, style: { color: '#fff' } }}
                    />
                    <StatusBar
                       hidden
                    />
                    <WebView
                        useWebKit={Platform.OS !== 'android' ? true:false}
                        startInLoadingState
                        source={{uri: url}}
                        style={{marginTop: -1}}
                        renderError={() => {
                            this.setState({showWebView: false});
                            if (Platform.OS !== 'android') ReactNativeHaptic.generate('notificationError')
                            Alert.alert(
                                'Webpage Loading Error'
                              );
                        }}
                        renderLoading={() => (
                            <View style={styles.loading}>
                                <Loading color={'#476DC5'} />
                            </View>

                        )}
                    />
                </View>
            )
        }
        else if (balancesReady && balanceDataRedux?.balanceData){            
            return (
                <ScrollView style={styles.container}>
                    <StatusBar
                       hidden
                    />
                    {this._renderHeader()}
                    <View style={{flex:1,margin: IS_X ? 15:10}}>
                        <Grid
                            style={styles.list}
                            renderItem={this._renderGridItem}
                            renderPlaceholder={this._renderPlaceholder}
                            data={balanceDataRedux?.balanceData.balanceData}
                            itemsPerRow={Platform.isPad ? 4:3}
                            itemHasChanged={this.itemHasChanged}
                            removeClippedSubviews={false}
                            onRefresh={this.refreshBalances}
                        />
                    </View>
                   
                    <DropdownAlert ref={ref => this.dropdown = ref} closeInterval={850} />
                </ScrollView>
            );
        }
        else if (balancesReady){
            return (
                <View style={{flex:1, justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
                        <NeedData 
                            text={'Add a TRX wallet or CoinEx account in settings!'} 
                            onPress={() => this.props.navigation.navigate('Settings')}
                        />
                </View>
            );
        }
        return (
            <View style={styles.loading}>
                <Loading/>
            </View>
            
        );
    }
}

const mapStateToProps = state => {
    return {
      balanceDataRedux: state.balanceData,
      cryptoObjRexux: state.cryptoObj
    }
  }

export default withTracker(params => {
    const handle = Meteor.subscribe('Balances.pub.list');
    const id = !Meteor.user() ? '': Meteor.user()._id
    return {
      balancesReady: handle.ready(),
      balances: Meteor.collection('balances').find({userId: id}, { sort: { createdAt: -1 } } )
    };
  })(connect(mapStateToProps)(AltHome));

const styles = StyleSheet.flatten({
    container: {
        flex:1,
    
        
    },
    headerText: {
        fontWeight: 'bold',
        fontSize: 50,
        letterSpacing: Platform.OS === "ios" ? 0.41 : undefined,
    },
    headerView: {
        flexDirection: 'column',
        marginTop: IS_X ? 55:30,
    },
    itemView:{
        marginLeft:'5%',
        backgroundColor: 'lightblue',
        flexDirection: 'row',
        width: '90%',
        height: 50,
        marginBottom: 10,
        borderRadius: 9,
        shadowOffset: { width: 5, height: 5 },
        shadowColor: 'black',
        shadowOpacity: 0.14
    },
    item: {
        flex: 1,
        height: 170,
        margin: 5,
        shadowOffset:{  width: 1,  height: 2.5,  },
        elevation:4,
    //shadowOffset: { width: 2, height: 5 },
        shadowColor: 'grey',
        shadowOpacity: 0.5,
        shadowRadius: 2.5,


    },
    list: {
        flex: 1
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    alertItem: {
        flex: 1,
        //margin: 7,
        backgroundColor: '#f6f5f3',
        shadowOffset:{  width: 2.5,  height: 2.5,  },
        shadowColor: 'grey',
        shadowOpacity: 0.3,
      },
      date: {
        ...iOSUIKit.footnoteEmphasizedObject,
        color: iOSColors.gray
      },
});