import React, { Component } from 'react';
import { Text, StyleSheet, View, FlatList } from 'react-native';
import Meteor, { withTracker } from 'react-native-meteor';

class History extends Component {
    constructor(props){
        super(props);
    }
    _keyExtractor = (item, index) => item.date;
    _renderItem = ({item}) => (
        <View style={{flexDirection: 'row',marginLeft: '7%', marginTop: '10%'}}>
            <Text>💲{item.divData.USDdelta}💲</Text>
            <View style={{marginLeft: '6%'}}/>
            <Text>{item.date.toLocaleDateString()}  @  {item.date.toLocaleTimeString()}</Text>
            </View>
        
      );

    render() {
        if(this.props.historyReady && this.props.history){
            return (
                <FlatList
                    data={this.props.history.history}
                    keyExtractor={this._keyExtractor}
                    renderItem={this._renderItem}
                />
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
