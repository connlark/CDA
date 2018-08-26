import React, { Component } from 'react';
import { Text, StyleSheet, View, FlatList, TouchableOpacity, WebView, StatusBar,Linking } from 'react-native';
import Meteor, { withTracker } from 'react-native-meteor';
import DeviceInfo from 'react-native-device-info';
import {Avatar, Button, Icon} from 'react-native-elements';
import QRCodeScanner from 'react-native-qrcode-scanner';
import DropdownAlert from 'react-native-dropdownalert';
import Loading from '../components/loading'
import { IS_X } from '../config/styles';

class Home extends Component {
    constructor(props){
        super(props);
        this.state = { 
            refreshing: false,
            showUSDValue: false,
        };
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
    render() {
        const { balances, balancesReady } = this.props;
        const { refreshing } = this.state;
        
        if (balancesReady && balances[0]){            
            return (
                <View style={styles.container}>
                    <StatusBar
                       hidden
                    />
                    <FlatList
                        data={this.sortData(balances[0].balanceData)}
                        keyExtractor={this._keyExtractor}
                        renderItem={this._renderItem}
                        ListHeaderComponent={this._renderHeader}
                        onRefresh={this.refreshData}
                        refreshing={refreshing}
                        extraData={this.state}
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
            <View>
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
  })(Home);

const styles = StyleSheet.flatten({
    container: {
        flex:1,
        justifyContent: 'center',
        
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
    }
});