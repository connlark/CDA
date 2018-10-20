import Dimensions from 'Dimensions';
import { AsyncStorage } from 'react-native';
import DeviceInfo from 'react-native-device-info';

let dimen = Dimensions.get('window');
const backgColors = JSON.parse('{"https://www.cryptocompare.com/media/30002253/coinex.png":"#9bfefb","https://www.cryptocompare.com/media/19633/btc.png":"#febe5a","https://www.cryptocompare.com/media/1383919/12-bitcoin-cash-square-crop-small-grn.png":"#C4E0A6","https://www.cryptocompare.com/media/1383672/usdt.png":"#57dfb4","https://www.cryptocompare.com/media/34477776/xrp.png":"#cbcdcf","https://www.cryptocompare.com/media/20646/eth_logo.png":"#B9C5F5","https://www.cryptocompare.com/media/33842920/dash.png":"#7DC3F2","https://www.cryptocompare.com/media/19782/litecoin-logo.png":"#d3d3d3","https://www.cryptocompare.com/media/1383652/eos_1.png":"#d3d3d3","https://www.cryptocompare.com/media/1383858/neo.jpg":"#ddfbaf","https://www.cryptocompare.com/media/33752295/etc_new.png":"#cef3ce","https://banner2.kisspng.com/20180330/wgw/kisspng-bitcoin-cryptocurrency-monero-initial-coin-offerin-bitcoin-5abdfe6b87dad3.2673609815224008755565.jpg":"#ca9658","https://www.cryptocompare.com/media/20084/btm.png":"#a993ce","https://www.cryptocompare.com/media/27010814/bcy.jpg":"#fe7dbc","https://www.cryptocompare.com/media/12318137/hsr.png":"#b2a8d9","https://www.cryptocompare.com/media/34477813/card.png":"#a993ce","https://www.cryptocompare.com/media/34477783/olt.jpg":"#bff0f5","https://www.cryptocompare.com/media/351360/zec.png":"#CFB53B","https://www.cryptocompare.com/media/19684/doge.png":"#eed67c","https://www.cryptocompare.com/media/34477805/trx.jpg":"#fd1a1a","https://pbs.twimg.com/profile_images/1013352125361819648/z2fvUNDq_400x400.jpg":"#cbca06"}');

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

  export const getCoinImages = (balanceData) => {
      balanceData = balanceData.splice(0)
      balanceData.map((item) => {
        let imageUrl = item.imgUrl ? item.imgUrl : 'https://frontiersinblog.files.wordpress.com/2018/04/frontiers-in-blockchain-logo.jpg';
        let imagePNG = null;
        
        switch (item.coin) {
            case 'SEED':
                imageUrl = 'https://pbs.twimg.com/profile_images/1013352125361819648/z2fvUNDq_400x400.jpg';
                color = '#ffb347'
                break;
            case 'WHC':
                imageUrl = 'https://file.coinex.com/2018-08-01/72F1DF3618A64383AE6AEA8B6D4DBF3E.png';
                break;
            case 'BTC':
                imagePNG = require('../../node_modules/cryptocurrency-icons/128/color/btc.png')
                break;
            case 'BCH':
                imagePNG = require('../../node_modules/cryptocurrency-icons/128/color/bch.png')
                break;
            case 'USDT':
                imagePNG = require('../../node_modules/cryptocurrency-icons/128/color/usdt.png')
                break;
            case 'ETH':
                imagePNG = require('../../node_modules/cryptocurrency-icons/128/color/eth.png')
                break;
            case 'XRP':
                imagePNG = require('../../node_modules/cryptocurrency-icons/128/color/xrp.png')
                break;
            case 'NEO':
                imagePNG = require('../../node_modules/cryptocurrency-icons/128/color/neo.png')
                break;
            case 'HSR':
                imagePNG = require('../../node_modules/cryptocurrency-icons/128/color/hsr.png')
                break;
            case 'EOS':
                imagePNG = require('../../node_modules/cryptocurrency-icons/128/color/eos.png')
                break;
            case 'LTC':
                imagePNG = require('../../node_modules/cryptocurrency-icons/128/color/ltc.png')
                break;
            case 'DASH':
                imagePNG = require('../../node_modules/cryptocurrency-icons/128/color/dash.png')
                break;
            case 'TRX':
                imagePNG = require('../../node_modules/cryptocurrency-icons/128/color/trx.png')
                break;
            default:
                break;
        }

        item.formattedUSDBalance = numberWithCommas(item.USDvalue)
        switch (item.coin) {
            case 'BTC':
                item.formattedBalance = Number(item.balance).toFixed(7)
                break;
            default:
                item.formattedBalance = numberWithCommas(item.balance)
                break;
        }
        const name = item.fullName ? item.fullName : item.coin;
        if (name.indexOf('(') > 0){
            namer = name.substring(0,name.indexOf('(')-1);
        }
        else {
            namer = name;
        }

        item.formattedName = namer;

        if (imagePNG){
            item.hasPNG = true;
            item.imagePNG = imagePNG;
        }
        else {
            item.imgUrl = imageUrl;
            item.hasPNG = false;
        }

        let color = backgColors[item.imgUrl] ? backgColors[item.imgUrl] :'#f6f5f3';
        switch (item.coin) {
            case 'SEED':
                item.color = '#FFFFE0';
                item.formattedName = 'Seed Token'
                break;
            case 'TRX':
                item.color = '#D3D3D3';
                break;
            default:
                item.color = color;
                break;
        }
      });
      
      return balanceData;
  }

const handleLoadLocalFile = (event) => {
    console.log("base54"+event.uri);
  }