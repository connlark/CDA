import React, { Component } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import Meteor, { withTracker } from 'react-native-meteor';
import { LineChart, YAxis, Grid, XAxis, AreaChart } from 'react-native-svg-charts'
import * as shape from 'd3-shape'
import moment from 'moment';

import { IS_X } from '../config/styles';
class Graph extends Component {
    consolodateData = (history) => {
        let newdta = [];
        history.map((e) => {
            if (newdta.length > 0){
                if (moment(e.date).isSame(moment(newdta[newdta.length-1].date), 'd')){
                    newdta[newdta.length-1].divData.USDdelta = Number(newdta[newdta.length-1].divData.USDdelta) + Number(e.divData.USDdelta);
                    newdta[newdta.length-1].divData.coinDeltas.map((foo) => {
                        e.divData.coinDeltas.map((coin) => {
                            if (foo.coin === coin.coin){
                                console.log(coin)
                                foo.delta = Number(coin.delta) + Number(foo.delta);
                                console.log(newdta[newdta.length-1].divData.coinDeltas)
                            }
                        });
                        
                    })
                }
                else {
                    newdta.push(e)
                }
            }
            else {
                newdta.push(e)
            }
        })

        console.log(newdta)

        return newdta;
    }
    getData = (history) => {
        const newhistory = this.consolodateData(history)
        const dta = [];
        newhistory.map((e) => {
            if (e.divData.USDdelta !== 'NaN' && Number(e.divData.USDdelta) > 0.01 ) {
                dta.push(Number(e.divData.USDdelta));
            }
        });
        return dta;
    }
    render() {
        const { history } = this.props;
        const data = [ 50, 10, 40, 95, -4, -24, 85, 91, 35, 53, -53, 24, 50, -20, -80 ]
        const contentInset = { top: 0, bottom: 0 }

        return (
            <View style={styles.container}>
                <View style={{height: IS_X ? 55:30,}}/>
                <Text style={styles.headerText}>  Dividends </Text> 
         
                <View style={{ height: 200, flexDirection: 'row', backgroundColor:'white', width: '95%', marginLeft: '2.5%' }}>
                    <YAxis
                        data={ history ? this.getData(history.history):data }
                        contentInset={ contentInset }
                        svg={{
                            fill: 'grey',
                            fontSize: 10,
                        }}
                        numberOfTicks={ 3 }
                        spacingOuter={0.05}
                        formatLabel={ value => `$${value}` }
                    />
                    <AreaChart
                        style={{ flex: 1, marginLeft: 3 }}
                        data={ history ? this.getData(history.history):data }
                        curve={ shape.curveCatmullRom }
                        svg={{ fill: 'rgba(134, 65, 244, 0.8)' }}
                        contentInset={ contentInset }
                    >
                        <Grid/>
                    </AreaChart>
                </View>
            
                
            </View>

        );
    }
}

const styles = StyleSheet.flatten({
    headerText: {
        fontWeight: 'bold',
        fontSize: 50,
        marginBottom: 10,
    },
    container: {
        backgroundColor: 'white',
        marginBottom: 15,
    }
});


export default withTracker(params => {
    const handle = Meteor.subscribe('BalanceHistory.pub.list');
    const id = !Meteor.user() ? '': Meteor.user()._id
    return {
      historyReady: handle.ready(),
      history: Meteor.collection('balanceHistory').findOne({userId: id})
    };
  })(Graph);