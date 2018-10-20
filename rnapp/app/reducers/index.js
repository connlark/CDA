import React from 'react';


import { combineReducers } from 'redux';
import notifications from './notification';
import meteorData from './meteorData';
import balanceData from './balanceData';



export default combineReducers({
    meteorData,
    notifications,
    balanceData
});
