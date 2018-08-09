/** @format */

import {AppRegistry, Text, TextInput} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

console.disableYellowBox = true; //comment out to get yelled at

AppRegistry.registerComponent(appName, () => App);
