import React, { Component } from 'react';
import { Text, StyleSheet, View, FlatList, TouchableOpacity, WebView, StatusBar,Linking } from 'react-native';
import Meteor, { withTracker } from 'react-native-meteor';
import DeviceInfo from 'react-native-device-info';
import {Avatar, Button, Icon} from 'react-native-elements';
import QRCodeScanner from 'react-native-qrcode-scanner';
import DropdownAlert from 'react-native-dropdownalert';
import Grid from 'react-native-grid-component';

import Loading from '../components/loading'
import { IS_X } from '../config/styles';
const backgColors = JSON.parse('{"https://www.cryptocompare.com/media/30002253/coinex.png":"#9bfefb","https://www.cryptocompare.com/media/19633/btc.png":"#febe5a","https://www.cryptocompare.com/media/1383919/12-bitcoin-cash-square-crop-small-grn.png":"#63f85a","https://www.cryptocompare.com/media/1383672/usdt.png":"#57dfb4","https://www.cryptocompare.com/media/34477776/xrp.png":"#cbcdcf","https://www.cryptocompare.com/media/20646/eth_logo.png":"#d3d3d3","https://www.cryptocompare.com/media/33842920/dash.png":"#186799","https://www.cryptocompare.com/media/19782/litecoin-logo.png":"#d3d3d3","https://www.cryptocompare.com/media/1383652/eos_1.png":"#d3d3d3","https://www.cryptocompare.com/media/1383858/neo.jpg":"#ddfbaf","https://www.cryptocompare.com/media/33752295/etc_new.png":"#cef3ce","https://banner2.kisspng.com/20180330/wgw/kisspng-bitcoin-cryptocurrency-monero-initial-coin-offerin-bitcoin-5abdfe6b87dad3.2673609815224008755565.jpg":"#ca9658","https://www.cryptocompare.com/media/20084/btm.png":"#a993ce","https://www.cryptocompare.com/media/27010814/bcy.jpg":"#fe7dbc","https://www.cryptocompare.com/media/12318137/hsr.png":"#b2a8d9","https://www.cryptocompare.com/media/34477813/card.png":"#20329d","https://www.cryptocompare.com/media/34477783/olt.jpg":"#bff0f5","https://www.cryptocompare.com/media/351360/zec.png":"#8e773b","https://www.cryptocompare.com/media/19684/doge.png":"#eed67c"}');
class AltHome extends Component {
    constructor(props){
        super(props);
        this.state = { 
            refreshing: false,
            showUSDValue: false,
        };
        console.log(backgColors['https://www.cryptocompare.com/media/30002253/coinex.png'])
    }
    componentDidMount(){


    }
    refreshBalances = () => {
        Meteor.call('Balances.checkForNewBalance', (err) => {
            if (err){
                console.log(err) 
            }
        })
    }
    state = {
        connected: false,
        showingCoins: []
    }
    _keyExtractor = (item, index) => item.coin;
    _renderItem = ({item}) => (
        <View>
        <View style={styles.itemView}>
            <View style={{flexDirection: 'row', marginTop: 0}}>
                <View style={{marginTop: 8, marginLeft: 6}}>
                    <Avatar
                        rounded
                        //xlarge
                        width={100}
                        source={{uri: item.imgUrl ? item.imgUrl : "https://images-cdn.azureedge.net/azure/in-resources/d7048855-742a-406c-a67d-5c2962e69e5e/Images/ProductImages/Source/Plain%20Gold%20Coin-3gm_1.jpg;width=1000;height=1000;scale=canvas;anchor=bottomcenter"}}
                        onPress={() => {
                            this.setState({showingCoins: [item.coin]});
                            Linking.openURL('https://www.cryptocompare.com'+item.ccurl)
                        }}
                        activeOpacity={0.4}
                    />
                </View>
                <View style={{width: '27%', marginTop: 12}}>
                    <Text style={{marginLeft: 10, fontSize: 20}}> {item.coin} </Text>
                </View>
                <View style={{width: '16%', marginTop: 7}}>
                    <Text style={{marginLeft: 2, fontSize: 10}}> {item.fullName} </Text>
                </View>
                <View style={{marginTop: 0, width:'40%', justifyContent: 'center', alignItems: 'center'}}>
                    {item.USDvalue ? 
                        <Text adjustsFontSizeToFit={true}  style={{textAlign: 'right'}}> {this.state.showUSDValue ? '$ ':'⎊ '} {this.state.showUSDValue ? Number(item.USDvalue).toFixed(3):Number(item.balance).toFixed(4)} </Text>:
                        <Text adjustsFontSizeToFit={true}  style={{textAlign: 'right', color: 'purple'}}> ⎊ {item.balance}  </Text>
                    }
                </View>
            </View>
        </View>
        </View>
      );
    _renderHeader = () => {
        return (
            <View style={styles.headerView}> 
                <Text onPress={() => this.setState({showUSDValue: !this.state.showUSDValue})} style={styles.headerText}>  Balances </Text> 
            </View>
        )
    }
    componentDidMount(){
    }
    onRead = (token) => {
        try {
            token = JSON.parse(token.data);
            Meteor.call('Balances.setAPI', token, (err) => {
                if (err){
                    console.log(err)
                    setTimeout(() => {
                        this.scanner.reactivate();
                    }, 500); 
                }
            })
        } catch (error) {
            alert('wrong qr type')
            setTimeout(() => {
                this.scanner.reactivate();
            }, 500); 
        }
    }
    sortData = (data) => {
        data.filter((e) => e.USDvalue)
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
        const imageUrl = item.imgUrl ? item.imgUrl : 'https://banner2.kisspng.com/20180330/wgw/kisspng-bitcoin-cryptocurrency-monero-initial-coin-offerin-bitcoin-5abdfe6b87dad3.2673609815224008755565.jpg';
        //console.log(JSON.stringify(this.state.backgColors))
        //this.state.backgColors[imageUrl] = 'ble';
        //this.setState({ backgColors: this.state.backgColors });
        const color = backgColors[imageUrl];
        const name = item.fullName ? item.fullName : item.coin
        console.log(item)
        return (
        <View style={[{ backgroundColor: color ? color:'white', alignItems: 'center', borderRadius: 9 }, styles.item]} key={i}>
            <View style={{marginTop: 12, marginBottom: 5}}>
                <Text style={{fontSize: 14}}> {name} </Text>
            </View>
            <Avatar
                rounded
                large
                title={item.fullName}
                source={{uri: imageUrl}}
                onPress={() => {
                    this.setState({showingCoins: [item.coin]});
                    Linking.openURL('https://www.cryptocompare.com'+item.ccurl)
                }}
                activeOpacity={0.4}
            />
            <View style={{marginTop: 5}}>
                <Text style={{fontSize: 10}}> ⏣ {item.balance} </Text>
            </View>
            <View style={{marginTop: 5}}>
                <Text style={{fontSize: 15}}> 💲{item.USDvalue} </Text>
            </View>
        </View>
      );
    }
    render() {
        const { balances, balancesReady } = this.props;
        const { refreshing } = this.state;
        
        if (balancesReady && balances[0]){            
            return (
                <View style={styles.container}>
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
                    <Grid
                        refreshing={refreshing}
                        refreshControl={this.refreshData}
                        renderHeader={this._renderHeader}
                        style={styles.list}
                        renderItem={this._renderGridItem}
                        renderPlaceholder={this._renderPlaceholder}
                        data={this.sortData(balances[0].balanceData)}
                        itemsPerRow={2}
                    />
                    <DropdownAlert ref={ref => this.dropdown = ref} closeInterval={850} />
                </View>
            );
        }
        else if (balancesReady){
            return (
                <QRCodeScanner
                    ref={component => this.scanner = component}
                    onRead={this.onRead}
                    reactivateTimeout={3}
                    topContent={
                        <Text style={styles.centerText}>
                            Go to <Text style={styles.textBold}>https://www.coinex.com/apikey</Text> on your computer and scan the QR code for an API key.
                        </Text>
                    }
                    bottomContent={
                    <TouchableOpacity style={styles.buttonTouchable}>
                        <Text style={styles.buttonText}>OK. Got it!</Text>
                    </TouchableOpacity>
                }
              />
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
        height: 160,
        margin: 1
    },
    list: {
        flex: 1
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
});