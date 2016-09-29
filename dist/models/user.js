var mongoose = require('mongoose'),
    localMongoose = require('passport-local-mongoose');

var UserSchema = mongoose.Schema({
    username: String,
    email: String,
    password: String,
    employer: String,
    jobTitle: String,
    birthday: String,
//    event: {
      eventName: String,
      type: String,
      host: String,
      startDate: String,
      endDate: String,
      guestList: String,
      location: String,
      message: String
  //  }
});

UserSchema.plugin(localMongoose);  // gives our Schema the functions from passport-local-mongoose

module.exports = mongoose.model('User', UserSchema);
