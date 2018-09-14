import React, { Component } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import Meteor, { withTracker } from 'react-native-meteor';
import { PieChart, YAxis, Grid, XAxis, AreaChart } from 'react-native-svg-charts'
import * as shape from 'd3-shape'
import * as d3Scale from 'd3-scale';
import moment from 'moment';

import { dimensions } from '../lib'
import { IS_X } from '../config/styles';
import { consolodateData } from '../lib'

export default class Graph extends Component {
    getData = (history) => {
        const newhistory = consolodateData(history)//this.consolodateData(history.slice())
        const dta = [];
        newhistory.map((e) => {
            if (e.divData.USDdelta !== 'NaN' && Number(e.divData.USDdelta) > 0.01 ) {
                dta.push(Number(e.divData.USDdelta));
            }
        });
        return dta;
    }
    render() {
        const { coinDeltas, dropdown, switched } = this.props;
        let data = [ ]
        const contentInset = {  }

        const randomColor = () => ('#' + (Math.random() * 0xFFFFFF << 0).toString(16) + '000000').slice(0, 7)
        
        coinDeltas.map((e) => {
            const valueUSDd = e.valueUSD ? e.valueUSD:0;
            if (switched && switched.indexOf(e.coin) === -1){
                data.push({value: e.delta, coin: e.coin, valueUSD: valueUSDd});
            }
        });
        const pieData = data.filter(value => value.value > 0).map((value, index) => ({
            value: value.valueUSD,
            svg: {
                fill: randomColor(),
                onPressIn: () => dropdown(value.value, value.valueUSD, value.coin)
            },
            key: `pie-${index}`,
            delta: value.value,
            valueUSD: value.valueUSD,
            coin: value.coin

        }));

        const Labels = ({ slices, height, width }) => {
            return slices.map((slice, index) => {
                const { labelCentroid, pieCentroid, data } = slice;

                return (
                    <Text
                        key={index}
                        x={pieCentroid[ 0 ]}
                        y={pieCentroid[ 1 ]}
                        fill={'black'}
                        textAnchor={'middle'}
                        alignmentBaseline={'middle'}
                        fontSize={24}
                        stroke={'black'}
                        strokeWidth={0.2}
                    >
                        {data.value}
                    </Text>
                )
            })
        }
        
        return (
            <View style={{flex: 1, alignItems: 'center', marginTop:5}}>
            <View style={{ width: dimensions.width*0.9, height: dimensions.height*0.35, flexDirection: 'row', backgroundColor:'white', margin: '2.5%', borderRadius: 9 }}>
                <PieChart
                 //   style={ { marginTop: 200 } }
                    style={{ flex: 1, marginBottom: dimensions.height*0.025,marginTop: dimensions.height*0.02, borderRadius: 9 }}
                   // valueAccessor={({ item }) => item.value}
                    data={ pieData }
                    animate={true}
                    spacing={0}
                    />
           
            </View>
                
           {/* <View style={styles.container}>
                { history && history.history.length > 1 ?
                    <View style={{ height: dimensions.height*0.35, flexDirection: 'row', backgroundColor:'white',  margin: '2.5%', borderRadius: 9 }}>
                        <YAxis
                            
                            data={ history ? this.getData(history.history.slice()):data }
                            contentInset={ contentInset }
                            svg={{
                                fill: '#bd8c7d',
                                fontSize: 10,
                            }}
                            scale={d3Scale.scaleLinear}
                            numberOfTicks={ 3 }
                            spacingOuter={0.05}
                            formatLabel={ value => `$ ${value}` }
                            animate={true}
                            showGrid={false}
                        />
                        
                        <AreaChart
                            style={{ flex: 1, marginBottom: '2%',marginTop: '0%', borderRadius: 9 }}
                            data={ history ? this.getData(history.history):data }
                            curve={ shape.curveBasisOpen }
                            scale={d3Scale.scaleLinear}
                            svg={{ fill: '#d1bfa7'}}
                            contentInset={ contentInset }
                            start={0}
                            yMin={0}
                            numberOfTicks={ 3 }
                            animate={true}
                            showGrid={false}
                        >
                            <Grid/>
                        </AreaChart>
                        
                    </View>:null
                }
            </View>*/}
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
        width: '92%',
        height: '100%',
        shadowOffset:{  width: 2.5,  height: 2.5,  },
        shadowColor: 'grey',
        shadowOpacity: 0.3,
        
    }
});

