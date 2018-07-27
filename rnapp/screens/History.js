import React, { Component } from 'react';
import { Text, StyleSheet, View, FlatList } from 'react-native';
import Meteor, { withTracker } from 'react-native-meteor';

class History extends Component {
    constructor(props){
        super(props);
        console.log(this.props.history)


    }
    _keyExtractor = (item, index) => item.date;
    _renderItem = ({item}) => (
        <Text> hi</Text>
      );

    render() {
      //  alert()
      console.log(this.props.history)
        return (
            <FlatList
                data={this.props.history}
                keyExtractor={this._keyExtractor}
                renderItem={this._renderItem}
            />
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
  })(History);
