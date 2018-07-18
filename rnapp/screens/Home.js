import React, { Component } from 'react';
import { Text, StyleSheet, View, FlatList, TouchableHighlight, WebView } from 'react-native';
import Meteor, { withTracker } from 'react-native-meteor';
import DeviceInfo from 'react-native-device-info';
import {Avatar} from 'react-native-elements';
class Home extends Component {
    constructor(props){
        super(props);
    }
    componentDidMount(){

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
                        onPress={() => this.setState({showingCoins: [item.coin]})}
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
                    <Text adjustsFontSizeToFit={true}  style={{textAlign: 'right'}}> {item.USDvalue} </Text>
                </View>
            </View>
        </View>
        </View>
      );
    _renderHeader = () => {
        return (
            <View style={styles.headerView}>
                
                <Text style={styles.headerText}>  Balances </Text>

            </View>
        )
    }
    componentDidMount(){
        setTimeout(() => {
            const uniqueId = DeviceInfo.getUniqueID();
            const params = {
                apiKey: 'B2A0B5726FA6465F98014352A865380F',
                secretKey: '0AC5F30B3089448C8B0F319451DECFCDB051E52BCE6565E6',
                userId: uniqueId
            }
            Meteor.call("Balance.update", params, (err) => {
                if (err){
                    alert(err)
                    console.log(err)
                }
            })
        }, 1500);
    }
    render() {
        const { balances, balancesReady } = this.props;
        
        if (balancesReady && balances[0]){            
            return (
                <View style={styles.container}>
                    <FlatList
                        data={balances[0].balanceData}
                        keyExtractor={this._keyExtractor}
                        renderItem={this._renderItem}
                        ListHeaderComponent={this._renderHeader}
                    />
                </View>
            );
        }
        return (
            <View>
                <Text style={{margin: '40%'}}> loading  </Text>
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
        //alignItems: 'left',
        justifyContent: 'center',
        
    },
    headerText: {
        fontWeight: 'bold',
        fontSize: 50,
    },
    headerView: {
        marginTop: 30,

    },
    itemView:{
        marginLeft:'5%',
        backgroundColor: 'lightblue',
        flexDirection: 'row',
        width: '90%',
        height: 50,
        marginBottom: 10,
        borderRadius: 9,
    }
});