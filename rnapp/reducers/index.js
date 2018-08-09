import React from 'react';

import {
    reduxifyNavigator,
    createReactNavigationReduxMiddleware,
    createNavigationReducer,
} from 'react-navigation-redux-helpers';


import { combineReducers } from 'redux';
import notifications from './notification';
import {AppNavigator} from '../config/router'



const navReducer = createNavigationReducer(AppNavigator);


export default combineReducers({
    nav: navReducer,
    notifications,
});
