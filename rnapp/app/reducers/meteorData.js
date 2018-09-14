import { REHYDRATE, PURGE } from 'redux-persist'
import _ from 'lodash';

import { storeItem, retrieveItem} from '../lib';
// Actions
const ADDED = 'ddp/added';
const CHANGED  = 'ddp/changed';
const REMOVED = 'ddp/removed';


const initialState = {
};

export function doSomething(action) {
  return dispatch => 
    retrieveItem('userID').then((userID) => {
      console.log(userID)
      if (userID){
        if (fields.userId !== userID){
          return;
        }
        dispatch(action)
      }
    });
}

// Reducer
export default reducer = (state = initialState, action) => {
    const { collection, id, fields } = action.payload || {};

    /*if (state.users && Object.keys(state.users)[0] && collection.match(/balanceHistory|balances/) && fields){
      const userId = Object.keys(state.users)[0];
      console.log('dbhwiuefhweoifhweoiwefwfoiwheoifheoifhoidhvoiwhowihvoiehwoi')
      if (fields.userId !== userId){
        return state;
      }
      
              
    }
    else if (fields && collection && collection.match(/balanceHistory|balances/)){
      //state.dispatch(doSomething(action));
      return state;
    }*/

    


  
    switch (action.type) {
      case ADDED:
        if (!state[collection]) {
          if (collection === 'users' && id){
            retrieveItem('userID').then((userID) => {
              if (!userID || (userID !== id)){
                console.log('IDDDDD', id)
                storeItem('userID', id)
              }
            });    
          }
          state[collection] = {};
          return {
            ...state,
            [collection]: {
              [id]: fields,
            },
          };
        } else if (!state[collection][id]) {
          return {
            ...state,
            [collection]: {
              ...state[collection],
              [id]: fields,
            },
          }
        } else {
          return {
            ...state,
            [collection]: {
              ...state[collection],
              [id]: { ...fields, ...state[collection][id] },
            }
          };
        }
      case CHANGED:
        return {
          ...state,
          [collection]: {
            ...state[collection],
            [id]: _.merge(state[collection][id], fields),
          },
        };
      case REMOVED:
        if (!state[collection]) return state;
        console.log(state[collection], Object.keys(state[collection])[id])
        if ( Object.keys(state[collection])[id] && state[collection][id]) {
          return {
            ...state,
            [collection]: _.omit(state[collection], id),
          };
        }
      case REHYDRATE:
        if (action.payload){
          return action.payload;
        }
        return state;
      default:
        return state;
    }
}