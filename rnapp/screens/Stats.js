import React, { Component } from 'react';
import { Text, StyleSheet, View, FlatList,TouchableHighlight, ScrollView } from 'react-native';
import Meteor, { withTracker } from 'react-native-meteor';
import Graph from '../components/graph';
import Swipeout from 'react-native-swipeout';
import AwesomeAlert from 'react-native-awesome-alerts';
import DropdownAlert from 'react-native-dropdownalert';
import { IS_X } from '../config/styles';
import { TestScheduler } from 'rx';

var swipeoutBtns = [
    {
      text: 'Button'
    }
  ]

class Stats extends Component {
    constructor(props){
        super(props);
        this.state = { 
            stats: {lastHourUSD: 0, totalUSD: 0}
        };
    }

    UNSAFE_componentWillReceiveProps(newProps){
        if (!this.props.history !== newProps.history){
            this.findNumbers(newProps.history.history);

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
                this.dropdown.alertWithType('success', 'Refreshed Sucessfully','☻ ☻ ☻ ☻ ☻ ☻ ☻');
            }
            this.setState({refreshing: false})
        })
    }

    sameDay = (d1, d2) => {
        var OneDay = d1.getTime() + (1 * 24 * 60 * 60 * 1000)
        return OneDay > new Date;
    }

    findNumbers = ( data ) => {
        let lastHourUSD = 0.0;
        let totalUSD = 0.0;
        const m = data.filter((e) => this.sameDay(e.date, new Date));
        m.map((e) => {
            lastHourUSD += Number(e.divData.USDdelta)
        });
        data.map( (e) => {
            totalUSD +=  Number(e.divData.USDdelta)
        });
        this.setState({stats: {lastHourUSD, totalUSD}});
    }

    render() {
        const { lastHourUSD, totalUSD } = this.state.stats;

        if(this.props.historyReady && this.props.history){
            return (
                <ScrollView style={{flex:1}} contentContainerStyle={{alignItems: 'center'}}>
                    <View style={{marginTop: '70%', alignItems: 'center'}}>
                        <Text style={styles.text}>Last 24h: $ {lastHourUSD.toFixed(2)} </Text>
                        <Text style={styles.text}>Total: $ {totalUSD.toFixed(2)} </Text>
                    </View>
                   
                </ScrollView>
            );

        }
        return <View/>
    }
}

const styles = StyleSheet.flatten({
    headerView: {
        marginTop: IS_X ? 40:30,
        flexDirection: 'row',
    },
    text: {
        fontWeight: 'bold',
        fontSize: 40,
        marginBottom: 25
    },

});

export default withTracker(params => {
    const handle = Meteor.subscribe('BalanceHistory.pub.list');
    const id = !Meteor.user() ? '': Meteor.user()._id
    return {
      historyReady: handle.ready(),
      history: Meteor.collection('balanceHistory').findOne({userId: id})
    };
  })(Stats);
