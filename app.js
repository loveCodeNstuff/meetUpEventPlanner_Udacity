//////////////////////////////////////////////////////////////////////
//--------------------------Includes--------------------------------\\
//////////////////////////////////////////////////////////////////////
var express = require('express'),
    app = express(),
    port = process.env.PORT || 3000,
    config = require('./dist/config/config.js'),
    session = require('express-session'),
    passport = require('passport'),
    localStrategy = require('passport-local'),
    localMongoose = require('passport-local-mongoose'),
    bodyParser = require('body-parser'),
    User = require('./dist/models/user'),
    mongoose = require('mongoose'),
    methodOverride = require('method-override');

//////////////////////////////////////////////////////////////////////
//----------------------App Settings--------------------------------\\
//////////////////////////////////////////////////////////////////////
// method overide setting
app.use(methodOverride("_method"));

// mongoose location
mongoose.connect(config.mongoLocation_production); // change to mongoLocation_production for production || mongoLocation_dev for dev

// template setting
app.set('view engine', 'jade');

// find the view folders
app.set('views', 'dist/views/');

// make express look in the public directory for assets (css/js/img)
app.use(express.static('dist/public/'));

// Express Session Settings
app.use(session({ // this is a way of requiring a module and passing functions to app
        secret: 'this can be anything',   // all these options are needed for express-session to work
        resave: false,
        saveUninitialized: false
}));

// Passport Settings
app.use(passport.initialize());    // needed to use passport
app.use(passport.session());       // needed to use passport
app.use(bodyParser.urlencoded({extended: true})); // needed for body parser to work
passport.use(new localStrategy({ usernameField: 'email' }, User.authenticate())); // creating a new local startegy coming from the passport-local-mongoose we exported functions
passport.serializeUser(User.serializeUser());   // passport uses this to encode the session info
passport.deserializeUser(User.deserializeUser());  // passport uses this to decode the session info

//////////////////////////////////////////////////////////////////////
//------------------------Routes------------------------------------\\
//////////////////////////////////////////////////////////////////////
app.get('/', (req, res) =>{
  res.render('index');
});

/////////////////////////////////////////////////////////////
//----------------------Login------------------------------\\
/////////////////////////////////////////////////////////////
// this middleware is checking if the login in a sucess or not using the local strategy
app.post('/login', passport.authenticate('local', {
    successRedirect: '/success',
    failureRedirect: '/login-page-bad'
}));

// using my custom middleware to tell if the req is authenticated if so keep going if not redirect to home
app.get('/success', isLoggedIn, function(req, res){
    res.render('success',
      {
        // passing variables of user to jade
        user: req.user.username
      }
    );
});

// custom middle ware that check it a user is already logged in or not
function isLoggedIn(req, res, next){
    if(req.isAuthenticated())
        return next(); // allows route to go to the next function in its list
    else
        res.redirect('/login');
}

app.get('/login-page', (req, res) =>{
  res.render('login');
});

app.get('/login-page-bad', (req, res) =>{
  res.render('login-bad');
});

////////////////////////////////////////////////////////////////////////
//----------------------Create Account--------------------------------\\
////////////////////////////////////////////////////////////////////////
app.post('/create', existsNdelete, function(req, res){
  req.body.email = req.body.email.toLowerCase();

  User.register(new User({username: req.body.email}), req.body.password,  function(err, user){ // creates a new user and salt/hash password
    if(err){
      console.log(err);
      return;
    }

    passport.authenticate('local')(req, res, function(){ // using local strat and hash password
      res.render('success',
        {
          // passing variables of user to jade
          user: req.user.username
        }
      );
    })
  })
});

//custom middle ware to find if a user is exists if so delete it so it can be reregistered And if info is incorrect
function existsNdelete(req, res, next){
    req.body.email = req.body.email.toLowerCase();

    User.find({ username: req.body.email }, function(err, user) {
      if (err)
          throw err;

        if(user.length == 0){
          return next();
        }else{
          User.remove({ username: user[0].username }, function(err){
            if(err)
              throw err;
          });

          console.log('User successfully deleted!');
          return next();
        }
    })
};

////////////////////////////////////////////////////////////////////////
//----------------------Create Event----------------------------------\\
////////////////////////////////////////////////////////////////////////
app.put('/addEvent/:userName', (req, res)=>{
  // update user in db
   User.findOneAndUpdate({ username: req.params.userName }, {
        eventName: req.body.name, // need to find how to send arrays from mongoose
        type: req.body.type,
        host: req.body.host,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        guestList: req.body.guestList,
        location: req.body.location,
        message: req.body.message
    },
    function(err){
        if(err)
            throw err;
    });

    // find and send user to frontend
    User.find({ username: req.params.userName }, (err,user)=>{
            if(err)
                throw err;
            else
                res.render('showEvent', { user: user[0] });
    });
});

app.get('*', (req, res) =>{
  res.render('index');
});

app.listen(port, ()=>{
  console.log(`app running on port ${port}`);
});
