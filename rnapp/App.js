import Meteor from 'react-native-meteor';
import Swiper from './screens/Swiper'
Meteor.connect('ws://localhost:3000/websocket');


export default Swiper;
