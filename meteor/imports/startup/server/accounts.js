import { Accounts } from 'meteor/accounts-base';
import { Random } from 'meteor/random'

Accounts.onCreateUser(function onCreateUser(options, user) {

  // Generate a user ID ourselves
  user._id = Random.id(); // Need to add the `random` package
  // Use the user ID we generated
  user.profile = [];
  return user;
});
