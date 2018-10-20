import { storeItem, retrieveItem} from '../lib';

export const ADD_BALANCE_DATA = 'ADD_BALANCE_DATA'
export const CHANGE_BALANCE = 'CHANGE_BALANCE';
let theID = null;
export function recieveData(action) {
    return (dispatch, getState) => {
        const { collection, id, fields } = action.payload || {};
        if (fields && collection && collection.match(/balanceHistory|balances/) ){
            return;
            if (theID){
                if (fields.userId !== theID){
                    return;
                }
            }
            else {
                return;
                retrieveItem('userID').then((userID) => {
                    theID = userID;
                    if (userID){
                      if (fields.userId !== userID){
                        return;
                      }
                    }
                    dispatch(action)
                  });
            }
        }
        else {
            dispatch(action)
        }
    }
  }

export function recieveBalanceData(data) {
    return {
      type: 'ADD_BALANCE_DATA',
      data
    }
  }

export function recieveCoinData(data) {
    return {
      type: CHANGE_BALANCE,
      data
    }
  }