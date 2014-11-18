var express = require('express')
var passport = require('passport')
var InstagramStrategy = require('passport-instagram').Strategy
var jwt = require('jwt-simple');
var _ = require('underscore');

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

var env = process.env;
var host = env.HOST;
var INSTAGRAM_CLIENT_SECRET = env.IG_SECRET;
var INSTAGRAM_CLIENT_ID = env.IG_ID;
var REDIRECT_URL = env.REDIRECT_URL;
var SECRET = env.SECRET;

passport.use(new InstagramStrategy({
    clientID: INSTAGRAM_CLIENT_ID,
    clientSecret: INSTAGRAM_CLIENT_SECRET,
    callbackURL: host + "/oauth_redirect"
  },
  function igCallback(accessToken, refreshToken, profile, done) {
    var payload = {
      accessToken: accessToken,
      profile: _.pick(profile, 'provider', 'id', 'username', 'displayName')
    };
    var token = jwt.encode(payload, SECRET);
    done(null, token);
  }
));

var app = express();
app.use(passport.initialize());

app.get('/', passport.authenticate('instagram'), function(){});

function success(req, res) {
  res.redirect(REDIRECT_URL + "/cookie-set/" + encodeURIComponent(res.user));
}

app.get('/oauth_redirect', passport.authenticate('instagram'), success);

app.listen(env.PORT || 5000, function(){
  console.log('Listening now on %s', env.PORT);
});
