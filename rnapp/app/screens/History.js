import React, { Component } from 'react';
import { Text, StyleSheet, View, Platform, RefreshControl,TouchableOpacity, ScrollView } from 'react-native';
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
import { withNavigation } from 'react-navigation';
import { Card } from 'react-native-material-ui';
import { material, human, iOSUIKit} from 'react-native-typography'
import NumberTicker from 'react-native-number-ticker';
import Ticker from "react-native-ticker";
import firebase from 'react-native-firebase';

import { storeItem, retrieveItem } from '../lib'

import NeedData from '../components/needData'

import { IS_X } from '../config/styles';
import { consolodateData, numberWithCommas } from '../lib'

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

    componentDidMount(){
        retrieveItem('is_first_login').then((obj) => {
            if (obj){
                this.props.navigation.navigate('Settings')
            }
        });
        firebase.perf().newHttpMetric('http://104.154.43.177', 'GET');
    }

    static getDerivedStateFromProps(props, state) {
        // Any time the current user changes,
        // Reset any parts of state that are tied to that user.
        // In this simple example, that's just the email.
        if (props.history && props.history.history && props.history !== state.prevHistory) {
            const hi = consolodateData(props.history.history.slice())
          return {
            prevHistory: props.history,
            history: {history: hi}
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
        //item.divData.coinDeltas.sort((a,b) => Number(b.USDdelta) - Number(a.USDdelta))
        const coinPixArr = item.divData.coinDeltas.slice(0,5)

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
            <TouchableOpacity accessible={true} testID={'TEST_ID_HISTORY'} accessibilityLabel={'TEST_ID_HISTORY_ACLBL'} key={i} style={[{ alignItems: 'center', justifyContent: 'center', borderRadius: 9, margin: 6 }, styles.item]} key={i} onPress={() => this.handleTouchedHistory(this.state.history.history.slice().find((e) => e.date === item.date))}>
                <View style={{marginBottom: 10}}>
                    <Text style={{fontSize: 14}}> {moment(item.date).format("MMM Do YY")} </Text>
                </View>
                <View style={{flexDirection: 'row', marginLeft: 15, marginRight: 15, marginBottom: 7}}>
                    
                    { coinPixArr.map((e) => (
                        <Avatar
                            key={e.coin}
                            size="medium"
                            source={{uri: e.uri}}
                            onPress={() => console.log("Works!")}
                            activeOpacity={0.7}
                            containerStyle={{flex: 1, backgroundColor: 'transparent'}}
                            overlayContainerStyle={{backgroundColor: 'transparent'}}
                            rounded
                    />

                    ))
                    }
                </View>
                
                
                <View style={{marginTop: 5, marginBottom: 5, flexDirection: 'row', justifyContent: "center", alignItems: "center"}}>
                    <Text style={{fontSize: 16}}>💰</Text>
                    <Ticker text={numberWithCommas(Number(item.divData.USDdelta).toFixed(3))} textStyle={{fontSize: 16, color: 'black'}} rotateTime={500} />
                </View>
        </TouchableOpacity>

        );
    }
   
    _renderPlaceholder = i => <View style={[styles.item, {backgroundColor: 'transparent'}]} key={i} />;
    
    _renderHeader = () => {
        const historyclone = this.props.history;
        
        
        
        return (
                <Graph
                    history={historyclone}
                />
                );
    }
    handleTouchedHistory = (item) => {
        this.props.navigation.navigate('Details', {item})
    }
    showAlert = () => {
        if (Platform.OS !== 'android') ReactNativeHaptic.generate('selection');
        this.setState({
          showAlert: true
        });
    };
     
    hideAlert = () => {
        if (Platform.OS !== 'android') ReactNativeHaptic.generate('selection');
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

    _onRefresh = () => {
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

    handleDebugTouch = () => {
        const thisone = this.state.history.history[this.state.history.history.length-1];
        this.handleTouchedHistory(thisone)
    }

    

    render() {
        const { history, revHistory } = this.state;
        const { historyReady } = this.props; 
        let thishistory = Object.freeze(history);
        const graphHistory = Object.freeze(history);
        

        const { showProgress, showAlert, selectedData, refreshing } = this.state;
        let graphistory = history;
        
        if(historyReady && history && history.history && history.history.length > 0 && revHistory){
            return (
                <View style={{flex:1}}>
                    <ScrollView style={{flex:1, height:'100%'}} 
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={this._onRefresh}
                            />
                        }
                    
                    >
                    <View style={{height: IS_X ? 55:30,}}/>
                    <Text accessible={true} testID={'TTESTME'} accessibilityLabel={'TEST_ffACLBdddL'} onPress={this.handleDebugTouch} style={styles.headerText}>  Dividends </Text> 
                        
                        <Graph
                            history={history}
                        />
                        <View style={{padding: 10}}>
                            <Grid
                                accessible={true} 
                                testID={'TEST_ID_HISddTORY'}
                                accessibilityLabel={'TEST_ID_HISTORY_ACLBdddL'}
                                style={styles.list}
                                renderItem={this._renderItem}
                                renderPlaceholder={this._renderPlaceholder}
                                data={history.history.slice().reverse()}
                                itemsPerRow={Platform.isPad ? 4:3}
                            />  
                        </View>
                        
                    </ScrollView>
                    <DropdownAlert ref={ref => this.dropdown = ref} closeInterval={850} />
                </View>
            );

        }
        else if (historyReady){
            return (
                <View style={{flex:1, justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
                        <NeedData 
                            text={'Things will show up here once a linked account shows an asset increase!'} 
                            onPress={() => this.props.navigation.navigate('Settings')}
                            smallFont
                        />
                </View>
                
            )
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
        //margin: 7,
        backgroundColor: 'white',
        shadowOffset:{  width: 2.5,  height: 2.5,  },
        shadowColor: 'grey',
        shadowOpacity: 0.3,
      },
      alertItem: {
        flex: 1,
        //margin: 7,
        backgroundColor: '#f6f5f3',
        shadowOffset:{  width: 2.5,  height: 2.5,  },
        shadowColor: 'grey',
        shadowOpacity: 0.3,
      },
    list: {
        flex: 1,
        
    },
    headerText: {
        fontWeight: 'bold',
        fontSize: 50,
        letterSpacing: Platform.OS === "ios" ? 0.41 : undefined,
    },
});


const APP =  withTracker(params => {
    const handle = Meteor.subscribe('BalanceHistory.pub.list');
    const id = !Meteor.user() ? '': Meteor.user()._id
    return {
      historyReady: handle.ready(),
      history: Meteor.collection('balanceHistory').findOne({userId: id}) ? Object.freeze(Meteor.collection('balanceHistory').findOne({userId: id})):Meteor.collection('balanceHistory').findOne({userId: id})
    };
  })(withNavigation(History));


  export default APP;
