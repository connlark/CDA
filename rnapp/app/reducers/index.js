import React from 'react';


import { combineReducers } from 'redux';
import notifications from './notification';
import meteorData from './meteorData';




export default combineReducers({
    meteorData,
    notifications,
});
