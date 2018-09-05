import React, { Component } from 'react';
import { Text, StyleSheet, View, FlatList,TouchableHighlight, ScrollView } from 'react-native';
import Meteor, { withTracker } from 'react-native-meteor';
import Graph from '../components/graph';
import ReactNativeHaptic from 'react-native-haptic';
import AwesomeAlert from 'react-native-awesome-alerts';
import DropdownAlert from 'react-native-dropdownalert';
import Analytics from 'appcenter-analytics';
import Loading from '../components/loading'
import Grid from 'react-native-grid-component';
import {CachedImage} from "react-native-img-cache";

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
            refreshing: false,
            prevHistory: {},
            history: {},
            revHistory:[]
        };
    }

    static getDerivedStateFromProps(props, state) {
        // Any time the current user changes,
        // Reset any parts of state that are tied to that user.
        // In this simple example, that's just the email.
        if (props.history && props.history !== state.prevHistory) {
          return {
            prevHistory: props.history,
            history: props.history,
          };
        }
        
        return null;
    }

    //_keyExtractor = (item, index) => index;
    /*_renderItem = ({item}) => {
        
        //console.log(item.divData.USDdelta, item)
        return (
            <View onPress={() => this.handleTouchedHistory(item)} style={{flex: 1, flexDirection: 'row', alignItems: 'center',justifyContent: 'center',}}>
                <Text style={{marginRight: '10%'}} onPress={() => this.handleTouchedHistory(item)}>$ {String(item.divData.USDdelta)} </Text>
                <Text style={{marginRight: '10%'}} onPress={() => this.handleTouchedHistory(item)}> {String(item.date.toLocaleDateString())} </Text>
                <Text onPress={() => this.handleTouchedHistory(item)}>  @  {String(item.date.toLocaleTimeString())}</Text>
            </View>
        );

    }*/

    _renderItem = (item, i) => (
        <View style={[{ backgroundColor: 'white', alignItems: 'center', borderRadius: 9 }, styles.item]} key={i}>
            <View style={{marginTop: 12, marginBottom: 5}}>
                <Text style={{fontSize: 14}}> {String(item.date.toLocaleDateString())} </Text>
            </View>
            <View style={{marginTop: 5}}>
                <Text style={{fontSize: 10}}> ⏣ {String(item.divData.USDdelta)} </Text>
            </View>
    
            {/*<View style={[{ backgroundColor: 'lightblue' }, styles.item]} key={i} >
          <Text style={{marginRight: '10%'}} onPress={() => this.handleTouchedHistory(item)}>$ {String(item.divData.USDdelta)} </Text>
                <Text style={{marginRight: '10%'}} onPress={() => this.handleTouchedHistory(item)}> {String(item.date.toLocaleDateString())} </Text>
                <Text onPress={() => this.handleTouchedHistory(item)}>  @  {String(item.date.toLocaleTimeString())}</Text>
            </View>*/}
        </View>
      );
     
    _renderPlaceholder = i => <View style={styles.item} key={i} />;
    
    _renderHeader = () => {
        const historyclone = this.props.history;
        
        
        return (
                <Graph
                    history={historyclone}
                />
                );
    }
    handleTouchedHistory = (item) => {
        this.setState({selectedData: item});
        this.showAlert();

    }
    showAlert = () => {
        ReactNativeHaptic.generate('selection');
        this.setState({
          showAlert: true
        });
    };
     
    hideAlert = () => {
        ReactNativeHaptic.generate('selection');
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
        const { history, revHistory } = this.state;
        const { historyReady } = this.props; 
        let thishistory = Object.freeze(history);
        const graphHistory = Object.freeze(history);
        

        const { showProgress, showAlert, selectedData, refreshing } = this.state;
        console.log(this.state.history)
        let graphistory = history;
        
        if(historyReady && history && revHistory){
            return (
                <ScrollView style={{flex:1, height:'100%'}}>
                    {/*<FlatList
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
                    />*/}
                    <Graph
                        history={history}
                    />
                    <Grid
                        style={styles.list}
                        renderItem={this._renderItem}
                        renderPlaceholder={this._renderPlaceholder}
                        data={history.history.slice().reverse()}
                        itemsPerRow={3}
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
                                    ReactNativeHaptic.generate('notificationError');
                                }
                                else {
                                    ReactNativeHaptic.generate('notificationSuccess');
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
                </ScrollView>
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
    item: {
        flex: 1,
        height: 160,
        margin: 1
      },
    list: {
        flex: 1
    }
});


export default withTracker(params => {
    const handle = Meteor.subscribe('BalanceHistory.pub.list');
    const id = !Meteor.user() ? '': Meteor.user()._id
    console.log(id)
    return {
      historyReady: handle.ready(),
      history: Object.freeze(Meteor.collection('balanceHistory').findOne({userId: id}))
    };
  })(History);
