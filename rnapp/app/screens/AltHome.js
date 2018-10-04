import React, { Component } from 'react';
import { Text, StyleSheet, View, TouchableHighlight, TouchableOpacity, WebView, StatusBar,Alert, Platform,ScrollView, AppState, Modal } from 'react-native';
import Meteor, { withTracker } from 'react-native-meteor';
import DeviceInfo from 'react-native-device-info';
import {Avatar, Header, Icon} from 'react-native-elements';
import DropdownAlert from 'react-native-dropdownalert';
import Grid from 'react-native-grid-component';
import ReactNativeHaptic from 'react-native-haptic';
import AddCredentialsModal from '../components/addCredentialsModal'
import * as Animatable from 'react-native-animatable';
import AwesomeAlert from 'react-native-awesome-alerts';
import PushNotification from 'react-native-push-notification';

import { numberWithCommas } from '../lib'
import Loading from '../components/loading'
import { IS_X } from '../config/styles';
import { storeItem, retrieveItem } from '../lib';

const backgColors = JSON.parse('{"https://www.cryptocompare.com/media/30002253/coinex.png":"#9bfefb","https://www.cryptocompare.com/media/19633/btc.png":"#febe5a","https://www.cryptocompare.com/media/1383919/12-bitcoin-cash-square-crop-small-grn.png":"#63f85a","https://www.cryptocompare.com/media/1383672/usdt.png":"#57dfb4","https://www.cryptocompare.com/media/34477776/xrp.png":"#cbcdcf","https://www.cryptocompare.com/media/20646/eth_logo.png":"#d3d3d3","https://www.cryptocompare.com/media/33842920/dash.png":"#186799","https://www.cryptocompare.com/media/19782/litecoin-logo.png":"#d3d3d3","https://www.cryptocompare.com/media/1383652/eos_1.png":"#d3d3d3","https://www.cryptocompare.com/media/1383858/neo.jpg":"#ddfbaf","https://www.cryptocompare.com/media/33752295/etc_new.png":"#cef3ce","https://banner2.kisspng.com/20180330/wgw/kisspng-bitcoin-cryptocurrency-monero-initial-coin-offerin-bitcoin-5abdfe6b87dad3.2673609815224008755565.jpg":"#ca9658","https://www.cryptocompare.com/media/20084/btm.png":"#a993ce","https://www.cryptocompare.com/media/27010814/bcy.jpg":"#fe7dbc","https://www.cryptocompare.com/media/12318137/hsr.png":"#b2a8d9","https://www.cryptocompare.com/media/34477813/card.png":"#20329d","https://www.cryptocompare.com/media/34477783/olt.jpg":"#bff0f5","https://www.cryptocompare.com/media/351360/zec.png":"#8e773b","https://www.cryptocompare.com/media/19684/doge.png":"#eed67c","https://www.cryptocompare.com/media/34477805/trx.jpg":"#fd1a1a","https://pbs.twimg.com/profile_images/1013352125361819648/z2fvUNDq_400x400.jpg":"#cbca06"}');
let ws;

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
            modalVisible: false
        };

        console.log('ws')
        const { cryptoObj } = this.state;
        this.setUpWS();
        /*PushNotification.localNotificationSchedule({
            //... You can use all the options from localNotifications
            message: "My Notification Message", // (required)
            date: new Date(Date.now() + (5 * 1000)) // in 60 secs
          });*/
    }

    componentWillUnmount(){
        AppState.removeEventListener('change', this._handleAppStateChange);
        ws = null;
    }

    _handleAppStateChange = (nextAppState) => {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
          console.log('App has come to the foreground!')
        
          this.setUpWS();
        }
        ws = null;
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
            ReactNativeHaptic.generate('notificationSuccess')
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
                    this.setState({cryptoObj: newObj});
                } 
            }
        } 
    }

    _keyExtractor = (item, index) => item.coin;

    _renderHeader = () => {
        return (
            <View style={styles.headerView}> 
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
                this.props.navigation.navigate('App')
              });
            }
          });
    }

    sortData = (data) => {
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
        let imageUrl = item.imgUrl ? item.imgUrl : 'https://frontiersinblog.files.wordpress.com/2018/04/frontiers-in-blockchain-logo.jpg';

        let color = backgColors[imageUrl] ? backgColors[imageUrl] :'#f6f5f3';
        const name = item.fullName ? item.fullName : item.coin;
        let bal = 0;
        var namer;

        switch (item.coin) {
            case 'SEED':
                imageUrl = 'https://pbs.twimg.com/profile_images/1013352125361819648/z2fvUNDq_400x400.jpg';
                color = '#ffb347'
                break;
            case 'WHC':
                imageUrl = 'https://file.coinex.com/2018-08-01/72F1DF3618A64383AE6AEA8B6D4DBF3E.png';
                break;
            default:
                break;
        }


        if (name.indexOf('(') > 0){
            namer = name.substring(0,name.indexOf('(')-1);
        }
        else {
            namer = name;
        }


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
                <Text adjustsFontSizeToFit style={{fontSize: 12}} numberOfLines={1}> {namer} </Text>
            </View>
            <Avatar
                rounded
                large
                //title={String(item.fullName).substring(0,2)}
                source={{uri: imageUrl}}
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
            <View style={{marginTop: 10}}>
                <Text adjustsFontSizeToFit numberOfLines={1} style={{fontSize: 10}}> {numberWithCommas(Number(item.balance).toFixed(item.coin === 'BTC' ? 7:3), true)} {item.coin}</Text>
            </View>
            <View style={{marginTop: 10, marginBottom: 100}}>
                <Text adjustsFontSizeToFit numberOfLines={1} style={{fontSize: 14}}> 💲{bal !== 0 ? numberWithCommas(bal.toFixed(3)):numberWithCommas(String(Number(item.USDvalue).toFixed(2)))} </Text>
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

    render() {
        const { balances, balancesReady } = this.props;
        const { refreshing, showWebView, selectedCoinObj } = this.state;
        
        if(showWebView){ 
            const { url, name } = selectedCoinObj;

            return (
                <View style={{flex: 1}}>
                    <Header
                        leftComponent={{ icon: 'arrow-back', underlayColor: 'trasparent', color: '#fff', onPress: () => this.setState({showWebView: false}) }}
                        centerComponent={{ text: name, style: { color: '#fff' } }}
                    />
                    <WebView
                        useWebKit={true}
                        startInLoadingState
                        javaScriptEnabled={false}
                        source={{uri: url}}
                        style={{marginTop: -1}}
                        renderError={() => {
                            this.setState({showWebView: false});
                            ReactNativeHaptic.generate('notificationError')
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
        else if (balancesReady && balances[0]){            
            return (
                <ScrollView style={styles.container}>
                    <StatusBar
                       hidden
                    />
                    {/*<FlatList
                        data={this.sortData(balances[0].balanceData)}
                        keyExtractor={this._keyExtractor}
                        renderItem={this._renderItem}
                        ListHeaderComponent={this._renderHeader}
                        onRefresh={this.refreshData}
                        refreshing={refreshing}
                        extraData={this.state}
                    />*/}
                    {this._renderHeader()}
                    <View style={{flex:1,margin: IS_X ? 15:10}}>
                        <Grid
                            style={styles.list}
                            renderItem={this._renderGridItem}
                            renderPlaceholder={this._renderPlaceholder}
                            data={this.sortData(balances[0].balanceData)}
                            itemsPerRow={Platform.isPad ? 4:3}
                            itemHasChanged={(d1, d2) => true}
                        />
                    </View>
                   
                    <DropdownAlert ref={ref => this.dropdown = ref} closeInterval={850} />
                </ScrollView>
            );
        }
        else if (balancesReady){
            return (
                <View style={{flex:1, alignItems: 'center', marginTop: '30%'}}>
                    <TouchableOpacity style={{marginBottom: 10}} style={[{ alignItems: 'center', justifyContent: 'center', borderRadius: 9, width: '90%' }, styles.alertItem]} onPress={() => this.mymodal.setModalVisible( true)}>
                        <View style={{marginBottom: 10}}>
                            <Text style={{fontSize: 14}}> Add CoinEx API credentials or link a TRX wallet! </Text>
                        </View>
                    </TouchableOpacity>
                    <AddCredentialsModal ref={component => this.mymodal = component} onRequestClose={this.state.closeModal} isModalVisible={this.state.modalVisible} {...this.props}/>
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

export default withTracker(params => {
    const handle = Meteor.subscribe('Balances.pub.list');
    const id = !Meteor.user() ? '': Meteor.user()._id
    return {
      balancesReady: handle.ready(),
      balances: Meteor.collection('balances').find({userId: id}, { sort: { createdAt: -1 } } )
    };
  })(AltHome);

const styles = StyleSheet.flatten({
    container: {
        flex:1,
    
        
    },
    headerText: {
        fontWeight: 'bold',
        fontSize: 50,
    },
    headerView: {
        flexDirection: 'row',
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
});