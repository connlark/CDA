import Dimensions from 'Dimensions';
import { AsyncStorage } from 'react-native';
import DeviceInfo from 'react-native-device-info';

let dimen = Dimensions.get('window');
import moment from 'moment';

export const IS_X =  DeviceInfo.hasNotch();
export const dimensions = dimen;

export  const numberWithCommas = (x, shouldNOTFix = false) => {

    x = !shouldNOTFix ? String(Number(x).toFixed(2)):x;
    if (typeof x !== 'string') return;
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}


export async function storeItem(key, item) {
    try {
        //we want to wait for the Promise returned by AsyncStorage.setItem()
        //to be resolved to the actual value before returning the value
        var jsonOfItem = await AsyncStorage.setItem(key, JSON.stringify(item));
        return jsonOfItem;
    } catch (error) {
      console.log(error.message);
    }
  }
  
export async function retrieveItem(key) {
    try {
      const retrievedItem =  await AsyncStorage.getItem(key);
      const item = JSON.parse(retrievedItem);
      return item;
    } catch (error) {
      console.log(error.message);
    }
    return
  }

 export const consolodateData = (history) => {
    let newdta = [];
    history.slice().map((e) => {
        if (newdta.length > 0){
            if (moment(e.date).isSame(moment(newdta[newdta.length-1].date), 'd')){
                newdta[newdta.length-1].divData.USDdelta = Number(newdta[newdta.length-1].divData.USDdelta) + Number(e.divData.USDdelta);
                newdta[newdta.length-1].divData.coinDeltas.slice().map((foo) => {
                    e.divData.coinDeltas.slice().map((coin) => {
                        if (foo.coin === coin.coin){
                            foo.delta = Number(coin.delta) + Number(foo.delta);
  
                            if (foo.valueUSD && coin.valueUSD){
                              foo.valueUSD = Number(coin.valueUSD) + Number(foo.valueUSD);
                            }
                        }
                    });
                    
                });
  
                e.divData.coinDeltas.slice().map((coin) => {
                  let hasIt = false;
                  newdta[newdta.length-1].divData.coinDeltas.map((foo) => {
                      if (foo.coin === coin.coin){
                          hasIt = true
                      }
                  })
  
                  if (!hasIt){
                      newdta[newdta.length-1].divData.coinDeltas.push(coin)
  
                  }
                });
  
            }
            else {
                newdta.push(e)
            }
        }
        else {
            newdta.push(e)
        }
    })
  
    return newdta;
  }