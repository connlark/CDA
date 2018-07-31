import React, { Component } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import Meteor, { withTracker } from 'react-native-meteor';
import { LineChart, YAxis, Grid, XAxis, AreaChart } from 'react-native-svg-charts'
import * as shape from 'd3-shape'

class Graph extends Component {
    getData = (history) => {
        const dta = [];
        history.map((e) => {
            if (e.divData.USDdelta !== 'NaN' && Number(e.divData.USDdelta) > 0.01 ) {
                dta.push(Number(e.divData.USDdelta));
            }
        });
        return dta;
    }
    render() {
        const { history } = this.props;
        const data = [ 50, 10, 40, 95, -4, -24, 85, 91, 35, 53, -53, 24, 50, -20, -80 ]
        const contentInset = { top: 0, bottom: 20 }

        return (
            <View >
                <View style={{ height: 200, flexDirection: 'row', backgroundColor:'white' }}>
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
                        style={{ flex: 1, marginLeft: 16 }}
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

const styles = StyleSheet.flatten({});


export default withTracker(params => {
    const handle = Meteor.subscribe('BalanceHistory.pub.list');
    const id = !Meteor.user() ? '': Meteor.user()._id
    return {
      historyReady: handle.ready(),
      history: Meteor.collection('balanceHistory').findOne({userId: id})
    };
  })(Graph);