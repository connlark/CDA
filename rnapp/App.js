import Meteor from 'react-native-meteor';
import Home from './screens/Home'
Meteor.connect('ws://localhost:3000/websocket');


export default Home;
