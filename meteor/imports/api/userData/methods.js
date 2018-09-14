import { Meteor } from "meteor/meteor";

Meteor.methods({
    'UserData.insert' (data) {
        // Make sure the user is logged in before inserting userdata
        if (!Meteor.userId()) {
          throw new Meteor.Error('not-authorized');
        }
        if (data.length === 0) {
          throw new Meteor.Error('no data error :)');
        }
    
        var obj = {};
    
        Object.keys(data).map((key) => {
            obj['AccountData.' + key] = data[key];
        })

        obj['isAccountSetupComplete'] = true;
    
        Meteor.users.update(this.userId, {$set: obj });
      },
})