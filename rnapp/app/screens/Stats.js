import React, { Component } from 'react';
import { Text, StyleSheet, View, FlatList,TouchableOpacity, ScrollView } from 'react-native';
import Meteor, { withTracker } from 'react-native-meteor';
import Grid from 'react-native-grid-component';
import { numberWithCommas } from '../lib'

import Graph from '../components/graph';
import Swipeout from 'react-native-swipeout';
import AwesomeAlert from 'react-native-awesome-alerts';
import DropdownAlert from 'react-native-dropdownalert';
import { IS_X } from '../config/styles';
import Loading from '../components/loading'
import NeedData from '../components/needData'

var swipeoutBtns = [
    {
      text: 'Button'
    }
  ]

class Stats extends Component {
    constructor(props){
        super(props);
        this.state = { 
            stats: {lastHourUSD: 0, totalUSD: 0, netWorth: 0},
        };
    }

    componentWillReceiveProps(newProps){
        if (newProps.historyReady && newProps.history && !this.props.history !== newProps.history){
            if (newProps.balances){
                this.findNumbers(newProps.history.history, newProps.balances.balanceData);
            }
            else {
                this.findNumbers(newProps.history.history);
            }
            
        }
        
    }

    refreshData = () => {
        this.setState({refreshing: true});

        Meteor.call('Balances.checkForNewBalance', (err) => {
            if (err){
                console.log(err) 
                this.dropdown.alertWithType('error', 'Error', err.reason);
            }
            else {
                this.dropdown.alertWithType('success', 'Refreshed Sucessfully','☻');
            }
            this.setState({refreshing: false})
        })
    }

    sameDay = (d1, d2) => {
        var OneDay = d1.getTime() + (1 * 24 * 60 * 60 * 1000)
        return OneDay > new Date;
    }

    findNumbers = ( data, balances ) => {
        let lastHourUSD = 0.0;
        let totalUSD = 0.0;
        let netWorth = 0.0;
        const m = data.filter((e) => this.sameDay(e.date, new Date));
        m.map( (e) => {
            lastHourUSD += Number(e.divData.USDdelta)
        });
        data.map( (e) => {
            totalUSD +=  Number(e.divData.USDdelta)
        });
        if (balances){
            balances.map((e) => {
                if (e.USDvalue){
                    netWorth += Number(e.USDvalue)
                } 
            });
        }
        this.setState({stats: {lastHourUSD, totalUSD, netWorth}});
    }

    render() {
        const { lastHourUSD, totalUSD, netWorth } = this.state.stats;
        const { historyReady, history, navigation } = this.props;
        if(historyReady && history &&  history.history.length > 0){
            return (
                <ScrollView style={{flex:1}} contentContainerStyle={{alignItems: 'center'}}>
                    <View style={{marginTop: '70%', alignItems: 'center'}}>
                        <Text style={styles.text}>Last 24h: $ {numberWithCommas(lastHourUSD.toFixed(2))} </Text>
                        <Text style={styles.text}>Total Divs: $ {numberWithCommas(totalUSD.toFixed(2))} </Text>
                        <Text style={styles.textSmall}>Net Worth: $ {numberWithCommas(netWorth.toFixed(2))} </Text>
                    </View>
                   
                </ScrollView>
            );

        }
        else if (historyReady){
            return (
                <View style={{flex:1, justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
                        <NeedData 
                            text={'Things will show here once a linked account show an asset increase!'} 
                            onPress={() => navigation?.navigate?.('Settings')}
                            smallFont
                        />
                </View>
                
            )
        }
        return (
            <View style={styles.loading}>
                <Loading/>
            </View>
        );
    }
}

const styles = StyleSheet.flatten({
    headerView: {
        marginTop: IS_X ? 40:30,
        flexDirection: 'row',
    },
    text: {
        fontWeight: 'bold',
        fontSize: 27,
        marginBottom: 25
    },
    textSmall: {
        fontWeight: 'bold',
        fontSize: 20,
        marginTop: 50
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

export default withTracker(params => {
    const handle = Meteor.subscribe('BalanceHistory.pub.list');
    const balHandle = Meteor.subscribe('Balances.pub.list');
    const id = !Meteor.user() ? '': Meteor.user()._id
    return {
      historyReady: handle.ready(),
      history: Meteor.collection('balanceHistory').findOne({userId: id}),
      balances: Meteor.collection('balances').findOne({userId: id})
    };
  })(Stats);
