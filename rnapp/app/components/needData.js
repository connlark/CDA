import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { IS_X } from '../config/styles';
import LottieView from 'lottie-react-native';
import { material, human} from 'react-native-typography'

const needData = (
    props) => (
        <View style={{height: '90%', width: '95%',justifyContent: 'center',
        alignItems: 'center', marginTop: '20%'}}>
            <TouchableOpacity style={[{ flex: 1, marginBottom: 10, borderRadius: 9, width: '90%',alignItems: 'center' }, styles.alertItem]} onPress={props?.onPress}>
                <LottieView
                    source={props.smallFont ? require('../lottie/smiley_stack.json'):require('../lottie/done.json')}
                    autoPlay
                    style={{marginTop: '-15%', alignItems: 'center'}}
                    loop={props.smallFont ? true:false}
                />
                <View >
                    <Text style={[props.smallFont ? material.headline:material.display1, {marginTop: '100%',textAlign: 'center'}]}>{props.text}</Text>
                </View>
            </TouchableOpacity>
        </View>
    
);

const styles = StyleSheet.flatten({
    container: {
        flex:1,
    
        
    },
    headerText: {
        fontWeight: 'bold',
        fontSize: 50,
    },
    headerView: {
        flexDirection: 'row',
        marginTop: IS_X ? 55:30,
    },
    itemView:{
        marginLeft:'5%',
        backgroundColor: 'lightblue',
        flexDirection: 'row',
        width: '90%',
        height: 50,
        marginBottom: 10,
        borderRadius: 9,
        shadowOffset: { width: 5, height: 5 },
        shadowColor: 'black',
        shadowOpacity: 0.14
    },
    item: {
        flex: 1,
        height: 170,
        margin: 5,
        shadowOffset:{  width: 1,  height: 2.5,  },
        elevation:4,
    //shadowOffset: { width: 2, height: 5 },
        shadowColor: 'grey',
        shadowOpacity: 0.5,
        shadowRadius: 2.5,


    },
    list: {
        flex: 1
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    alertItem: {
        flex: 1,
        //margin: 7,
        backgroundColor: '#f6f5f3',
        shadowOffset:{  width: 2.5,  height: 2.5,  },
        shadowColor: 'grey',
        shadowOpacity: 0.3,
      },
});

export default needData;
