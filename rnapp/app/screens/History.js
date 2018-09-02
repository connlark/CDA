import React, { Component } from 'react';
import { Text, StyleSheet, View, FlatList,TouchableHighlight } from 'react-native';
import Meteor, { withTracker } from 'react-native-meteor';
import Graph from '../components/graph';
import Swipeout from 'react-native-swipeout';
import AwesomeAlert from 'react-native-awesome-alerts';
import DropdownAlert from 'react-native-dropdownalert';
import Analytics from 'appcenter-analytics';
import Loading from '../components/loading'

import { IS_X } from '../config/styles';

var swipeoutBtns = [
    {
      text: 'Button'
    }
  ]

class History extends Component {
    constructor(props){
        super(props);
        this.state = { 
            showAlert: false, 
            showProgress: false, 
            selectedData: {date: new Date, divData: {USDdelta: 0, coinDeltas: [] }},
            refreshing: false
        };
    }
    _keyExtractor = (item, index) => String(Math.random());
    _renderItem = ({item}) => (
            <View onPress={() => this.handleTouchedHistory(item)} style={{flex: 1, flexDirection: 'row', alignItems: 'center',justifyContent: 'center',}}>
                <Text style={{marginRight: '10%'}} onPress={() => this.handleTouchedHistory(item)}>$ {Number(item.divData.USDdelta).toFixed(3)} </Text>
                <Text style={{marginRight: '10%'}} onPress={() => this.handleTouchedHistory(item)}> {String(item.date.toLocaleDateString())} </Text>
                <Text onPress={() => this.handleTouchedHistory(item)}>  @  {String(item.date.toLocaleTimeString())}</Text>
            </View>
      );
    _renderHeader = () => {
        return (
                <Graph/>
                );
    }
    handleTouchedHistory = (item) => {
        this.setState({selectedData: item});
        this.showAlert();

    }
    showAlert = () => {
        this.setState({
          showAlert: true
        });
    };
     
    hideAlert = () => {
        this.setState({
            showAlert: false
        });
    };

    doParse = (e) => {
        let out = '';
        if (!e){
            return '';
        }
        e.map((o) => {
            out += o.coin + '~ ' + o.delta +'\n';
        })
        return out;
    }

    refreshData = () => {
        Analytics.trackEvent('Refreshing Data');
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
        const { showProgress, showAlert, selectedData, refreshing } = this.state;

        if(this.props.historyReady && this.props.history){
            return (
                <View style={{flex:1, height:'100%'}}>
                    <FlatList
                        stickyHeaderIndices={[0]}
                        removeClippedSubviews={false}
                        data={this.props.history.history}
                        keyExtractor={this._keyExtractor}
                        renderItem={this._renderItem}
                        ItemSeparatorComponent={() => <View style={{ margin: 10 }} />}
                        contentInset={{ bottom: 30 }}
                        ListHeaderComponent={this._renderHeader}
                        onRefresh={this.refreshData}
                        refreshing={refreshing}
                    />
                    <AwesomeAlert
                        show={showAlert}
                        showProgress={showProgress}
                        title="Delete This Delta?"
                        message={`\nDate: ${selectedData.date.toLocaleDateString()} @ ${selectedData.date.toLocaleTimeString()}\n\nUSD Value: $ ${selectedData.divData.USDdelta}\n\nDeltas: \n${this.doParse(selectedData.divData.coinDeltas)}`}
                        closeOnTouchOutside={true}
                        closeOnHardwareBackPress={false}
                        showCancelButton={true}
                        showConfirmButton={true}
                        cancelText="No, cancel"
                        confirmText="Yes, delete it"
                        confirmButtonColor="#DD6B55"
                        onCancelPressed={() => {
                            this.hideAlert();
                        }}
                        onConfirmPressed={() => {
                            this.setState({showProgress: true});
                            Meteor.call('BalanceHistory.deleteBalanceHistoryDay', selectedData.date, (err) => {
                                if (err){
                                    console.log(err);
                                }
                                else {
                                    this.dropdown.alertWithType('success', 'Successfully deleted the datapoint','');
                                }
                                this.setState({showProgress: false});
                            });
                            this.hideAlert();
                        }}
                        onDismiss={() => {
                            this.hideAlert();
                        }}
                    />
                <DropdownAlert ref={ref => this.dropdown = ref} closeInterval={850} />
                </View>
            );

        }
        return (
            <View style={styles.loading}>
                <Loading/>
            </View>
        )
    }
}

const styles = StyleSheet.flatten({
    headerView: {
        marginTop: IS_X ? 30:30,
        flexDirection: 'row',
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
});


export default withTracker(params => {
    const handle = Meteor.subscribe('BalanceHistory.pub.list');
    const id = !Meteor.user() ? '': Meteor.user()._id
    return {
      historyReady: handle.ready(),
      history: Meteor.collection('balanceHistory').findOne({userId: id})
    };
  })(History);
