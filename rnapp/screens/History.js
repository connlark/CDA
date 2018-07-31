import React, { Component } from 'react';
import { Text, StyleSheet, View, FlatList,TouchableHighlight } from 'react-native';
import Meteor, { withTracker } from 'react-native-meteor';
import Graph from '../components/graph';
import Swipeout from 'react-native-swipeout';
import AwesomeAlert from 'react-native-awesome-alerts';

var swipeoutBtns = [
    {
      text: 'Button'
    }
  ]

class History extends Component {
    constructor(props){
        super(props);
        this.state = { showAlert: false, selectedData: {date: new Date, divData: {USDdelta: 0, coinDeltas: {} }} };
    }
    _keyExtractor = (item, index) => String(Math.random());
    _renderItem = ({item}) => (
            <View style={{flex: 1, flexDirection: 'row',marginLeft: '7%'}}>
                <Text onPress={() => this.handleTouchedHistory(item)}>$ {item.divData.USDdelta} {String(item.date.toLocaleDateString())}  @  {String(item.date.toLocaleTimeString())}</Text>
            </View>
      );
    _renderHeader = () => (
        <Graph/>
    );
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

    render() {
        const { showAlert, selectedData } = this.state;

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

                    />
                <AwesomeAlert
                    show={showAlert}
                    showProgress={false}
                    title="Delete This Delta?"
                    message={`\nDate: ${selectedData.date.toLocaleDateString()}\n\nCoinDeltas: $ ${selectedData.divData.USDdelta}`}
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
                        Meteor.call('BalanceHistory.deleteBalanceHistoryDay', selectedData.date, (err) => {
                            if (err){
                                console.log(err);
                            }
                            this.hideAlert();
                        });
                    }}
                    />
                </View>
            );

        }
        return <View/>
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
  })(History);
