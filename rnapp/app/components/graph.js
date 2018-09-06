import React, { Component } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import Meteor, { withTracker } from 'react-native-meteor';
import { LineChart, YAxis, Grid, XAxis, AreaChart } from 'react-native-svg-charts'
import * as shape from 'd3-shape'
import * as d3Scale from 'd3-scale';
import moment from 'moment';

import { IS_X } from '../config/styles';
export default class Graph extends Component {
    consolodateData = (history) => {
        let newdta = [];
        history.slice().map((e) => {
            if (newdta.length > 0){
                if (moment(e.date).isSame(moment(newdta[newdta.length-1].date), 'd')){
                    newdta[newdta.length-1].divData.USDdelta = Number(newdta[newdta.length-1].divData.USDdelta) + Number(e.divData.USDdelta);
                    newdta[newdta.length-1].divData.coinDeltas.slice().map((foo) => {
                        e.divData.coinDeltas.slice().map((coin) => {
                            if (foo.coin === coin.coin){
                                console.log(coin)
                                foo.delta = Number(coin.delta) + Number(foo.delta);
                            }////
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

        return newdta;
    }
    getData = (history) => {
        const newhistory = history//this.consolodateData(history.slice())
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
        const contentInset = { top: 20, bottom: 20 }

    
        return (
            <View style={styles.container}>
                <View style={{height: IS_X ? 55:30,}}/>
                <Text style={styles.headerText}>  Dividends </Text> 
                { history && history.history.length > 1 ?
                    <View style={{ height: 250, flexDirection: 'row', backgroundColor:'white', width: '95%', marginLeft: '2.5%', borderRadius: 9 }}>
                        <YAxis
                            data={ history ? this.getData(history.history.slice()):data }
                            contentInset={ contentInset }
                            svg={{
                                fill: '#bd8c7d',
                                fontSize: 10,
                            }}
                            scale={d3Scale.scaleLinear}
                            numberOfTicks={ 5 }
                            spacingOuter={0.05}
                            formatLabel={ value => `$ ${value}` }
                            animate={true}
                            showGrid={false}
                        />
                        
                        <AreaChart
                            style={{ flex: 1, marginLeft: 3, borderRadius: 9 }}
                            data={ history ? this.getData(history.history):data }
                            curve={ shape.curveBasisOpen }
                            scale={d3Scale.scaleLinear}
                            svg={{ fill: '#d1bfa7'}}
                            contentInset={ contentInset }
                            start={0}
                            yMin={0}
                            numberOfTicks={ 5 }
                            animate={true}
                            showGrid={false}
                        >
                            <Grid/>
                        </AreaChart>
                        
                    </View>:null
                }
            </View>

        );
    }
}

const styles = StyleSheet.flatten({
    headerText: {
        fontWeight: 'bold',
        fontSize: 50,
    },
    container: {
        backgroundColor: 'white',
        borderRadius: 9,
    }
});

