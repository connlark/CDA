import React, { Component } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import Meteor, { withTracker } from 'react-native-meteor';
import { LineChart, YAxis, Grid, XAxis, AreaChart } from 'react-native-svg-charts'
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

        console.log(dta)

        return dta;
    }
    render() {
        const { history } = this.props;
        const data = [ 50, 10, 40, 95, -4, -24, 85, 91, 35, 53, -53, 24, 50, -20, -80 ]
        const contentInset = {  }

    
        return (
            <View style={{flex: 1, alignItems: 'center', marginTop:5}}>
                
            <View style={styles.container}>
                { history && this.getData(history.history.slice()).length > 4 ?
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
            </View>
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

