import React, { Component } from 'react';
import { Text, StyleSheet, View, Platform, FlatList,TouchableOpacity, ScrollView } from 'react-native';
import Meteor, { withTracker } from 'react-native-meteor';
import Graph from '../components/graph';
import ReactNativeHaptic from 'react-native-haptic';
import AwesomeAlert from 'react-native-awesome-alerts';
import DropdownAlert from 'react-native-dropdownalert';
import Analytics from 'appcenter-analytics';
import Loading from '../components/loading'
import Grid from 'react-native-grid-component';
import { Avatar } from 'react-native-elements';
import moment from 'moment';

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

    _renderItem = (item, i) => {
        for (let index = 0; index < item.divData.coinDeltas.length; index++) {
            const element = item.divData.coinDeltas[index];
            switch (element.coin) {
                case 'SEED':
                    element.uri = 'https://pbs.twimg.com/profile_images/1013352125361819648/z2fvUNDq_400x400.jpg';
                    break;
                case 'WHC':
                    element.uri = 'https://file.coinex.com/2018-08-01/72F1DF3618A64383AE6AEA8B6D4DBF3E.png';
                    break;
                default:
                    element.uri = `https://www.livecoinwatch.com/images/icons64/${element.coin.toLowerCase()}.png`;
                    break;
            }
            
        }
        
        return (
            <TouchableOpacity style={[{ alignItems: 'center', justifyContent: 'center', borderRadius: 9 }, styles.item]} key={i} onPress={() => this.handleTouchedHistory(item)}>
                <View style={{marginTop: 12, marginBottom: 5}}>
                    <Text style={{fontSize: 14}}> {moment(item.date).format("MMM Do YY")} </Text>
                </View>
                <View style={{flexDirection: 'row', marginLeft: 15, marginRight: 15}}>
                    
                    { item.divData.coinDeltas.map((e) => (
                        <Avatar
                            size="medium"
                            source={{uri: e.uri}}
                            onPress={() => console.log("Works!")}
                            activeOpacity={0.7}
                            containerStyle={{flex: 4, backgroundColor: 'transparent'}}
                            overlayContainerStyle={{backgroundColor: 'transparent'}}
                            rounded
                    />

                    ))
                    }
                </View>
                
                
                <View style={{marginTop: 5}}>
                    <Text style={{fontSize: 16}}> 💰 {Number(item.divData.USDdelta).toFixed(2)} </Text>
                </View>
        </TouchableOpacity>

        );
    }
   
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
            out += o.coin + ':  Δ ' + Number(o.delta).toFixed(7) +'\n';
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
                <View style={{flex:1}}>
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
                            itemsPerRow={Platform.isPad ? 4:3}
                        />
                    </ScrollView>
                    <AwesomeAlert
                            show={showAlert}
                            showProgress={showProgress}
                            title="Delete This Delta?"
                            message={`\nDate: ${selectedData.date.toLocaleDateString()} @ ${selectedData.date.toLocaleTimeString()}\n\nUSD Value: $ ${Number(selectedData.divData.USDdelta).toFixed(3)}\n\n${this.doParse(selectedData.divData.coinDeltas)}`}
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
    item: {
        flex: 1,
        height: 120,
        margin: 5,
        backgroundColor: '#f6f5f3',
        shadowOffset:{  width: 2.5,  height: 2.5,  },
        shadowColor: 'grey',
        shadowOpacity: 0.3,
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
