import { ADD_BALANCE_DATA, CHANGE_BALANCE } from '../Actions/meteorData';
import { getCoinImages } from '../lib'

const initialState = {
};

export default getBalanceData = (state = initialState, action) => {
    switch (action.type) {
        case ADD_BALANCE_DATA:
            console.log('ouehvwhrvfoiwvoihwfoihwrfohi')
            const balanceData = getCoinImages(action.data.balanceData.splice(0));
            action.data.balanceData = sortData(balanceData);

            return Object.assign({}, state, {
                balanceData: action.data
            });

        case CHANGE_BALANCE:
            let cryptoObj = action.data;
            /*const pairs = [];
            const needed = Object.keys(cryptoObj)?.map((val) => {
                state?.balanceData?.balanceData.map((e) => {
                    if(e.coin === val.substring(0,e.coin.length)){
                        const f = cryptoObj[val]
                        pairs.push({pair: val, price: f});
                    }
                })
            })*/

            return Object.assign({}, state, {
                cryptoObj: action.data
            });
        default:
            return state
    }
}
const sortData = (data) => {
    if (!data) return;
    data = data.filter((e) => typeof e.USDvalue !== 'undefined')
    return data.sort( (a,b) => {
        if (a.USDvalue && b.USDvalue){

            return b.USDvalue-a.USDvalue;
        }
        else if (b.USDvalue) {
            return true;
        }
        return false;
    });
}