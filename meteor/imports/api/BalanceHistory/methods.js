import { Meteor } from 'meteor/meteor';
import { BalanceHistory} from './balanceHistory';
import moment from 'moment';

Meteor.methods({
    'BalanceHistory.deleteBalanceHistoryDay' ({coin, delta, date}){
      let bal = BalanceHistory.findOne({userId: this.userId});
      const deleteThese = [];

      bal.history.map((e, index)=> {
        const newCoinDeltas = [];
        const newBalHistory= [];
        let newMonies = Number(bal.history[index].divData.USDdelta);
        if (moment(e.date).isSame(moment(date), 'd')){
          e.divData.coinDeltas.map((obj) => {
            if (obj.coin !== coin && obj.delta !== delta){
              newBalHistory.push(obj);
            }
            else {
              if (!obj.USDdelta){
                obj.USDdelta = 1
              }
              newMonies -= Number(obj.USDdelta)
            }
          });
          newCoinDeltas.push(newBalHistory);
        }
        else {
          newCoinDeltas.push(e.divData.coinDeltas);
        }
        bal.history[index].divData.USDdelta = newMonies;
        bal.history[index].divData.coinDeltas = newCoinDeltas[0];

        if (newCoinDeltas[0].length === 0){
          deleteThese.push(index);
        }
      });
      deleteThese.map((m) => {
        bal.history = bal.history.filter((e) => e !== bal.history[m])
      });

      BalanceHistory.update(
        {userId: this.userId},
        {
            _id: bal._id,
            userId: this.userId,
            history: bal.history,
            createdAt: new Date
        }
      );  
    },
  });
  