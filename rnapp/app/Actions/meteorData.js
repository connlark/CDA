import { storeItem, retrieveItem} from '../lib';

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
                    console.log(userID)
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