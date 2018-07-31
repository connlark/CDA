import { Meteor } from 'meteor/meteor';
import { BalanceHistory} from './balanceHistory';

Meteor.methods({
    'BalanceHistory.deleteBalanceHistoryDay' (day){
      const bal = BalanceHistory.findOne({userId: this.userId});
      
      bal.history = bal.history.filter((e)=> {
        return e.date.toLocaleDateString() !== day.toLocaleDateString();
      })
      //console.log(bal.history)
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
  