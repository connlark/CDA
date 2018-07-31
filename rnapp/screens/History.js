import React, { Component } from 'react';
import { Text, StyleSheet, View, FlatList } from 'react-native';
import Meteor, { withTracker } from 'react-native-meteor';
import Graph from '../components/graph';

class History extends Component {
    constructor(props){
        super(props);
    }
    _keyExtractor = (item, index) => Math.random();
    _renderItem = ({item}) => (
        <View style={{flexDirection: 'row',marginLeft: '7%'}}>
            <Text>$ {item.divData.USDdelta}</Text>
            <View style={{marginLeft: '6%'}}/>
            <Text>{String(item.date.toLocaleDateString())}  @  {String(item.date.toLocaleTimeString())}</Text>
            </View>
        
      );
    _renderHeader = () => (
        <Graph/>
    );

    render() {
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
