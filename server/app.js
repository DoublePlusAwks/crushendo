/*jshint esversion: 6 */
const PORT = 3000;
const JSON_SIZE_LIMIT = '50mb';

var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var url = require('url');
var fs = require('fs');
var appRoot = require('app-root-path');
var reqlib = require('app-root-path').require;
var partials = require('express-partials');
const secrets = reqlib('/config/secrets');
var SpotifyHelper = reqlib('/server/spotify-helper');
var spotify = new SpotifyHelper();
spotify.getClientToken();
spotify.interval = setInterval(
  function() {spotify.getClientToken();}, 1000 * 60 * 30
);
var app = express();

app.set('trust proxy', 1);
app.use(session({
  secret: secrets.sessionSecret,
  resave: true,
  saveUninitialized: true,
  cookie: {}
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(appRoot + '/public'));
app.use(partials());
app.set('views', appRoot + '/views');
app.set('view engine', 'ejs');

app.get('/monitor', function(request, response)  {
  response.send('Status: OK');
});

app.get('/test', function(request, response)  {
  spotify.search('Love').then(function(result)  {
    response.json(result);
  });
});

app.post('/autocomplete', function(request, response) {
  spotify.search(request.body.query).then(function(result)  {
    response.json(result);
  }, function(err)  {
    console.log('Autocomplete error: ' + err);
  });
});

app.post('/recommendations', function(request, response)  {
  spotify.getRecommendations(request.body.artists, request.body.tracks, 10)
    .then(function(result)  {
      response.json(result);
    }, function(err)  {
      console.log('Recommendations error: ' + err);
    });
});

app.post('/trackinfo', function(request, response)  {
  spotify.getAudioFeatures(request.body.query)
    .then(function(result)  {
      response.json(result);
    }, function(err)  {
      console.log(err);
    });
});

app.post('/save', function(request, response) {
  var sess = request.session;
  sess.recommendationIds = request.body;
  var authorizeURL = spotify.authorizeURL();
  response.json({'authorizeURL': authorizeURL});
});

app.get('/callback', function(request, response)  {
  var url_parts = url.parse(request.url, true);
  var authCode = url_parts.query.code;
  var uris = request.session.recommendationIds.map(function(e)  {
    return 'spotify:track:' + e;
  });
  var s = new SpotifyHelper();
  s.spotifyApi.authorizationCodeGrant(authCode).then(function(data) {
    s.spotifyApi.setAccessToken(data.body.access_token);
    s.spotifyApi.setRefreshToken(data.body.refresh_token);
    s.getMe().then(function(result) {
      var userId = result.body.id;
      var playlistName = 'Crushendo Playlist ' + Date.now();
      s.spotifyApi.createPlaylist(userId, playlistName, { 'public' : false })
        .then(function(data) {
          console.log('Created playlist: ' + data.body.uri);
          s.spotifyApi.addTracksToPlaylist(userId, data.body.id, uris)
            .then(function(data)  {
              request.session.destroy();
              response.redirect('/');
            });
        });
    });
  }, function(err)  {
    response.json(err);
  });
});

app.get('/', function(request, response)  {
  response.render('index');
});

app.listen(PORT, function() {
  console.log('Crushendo listening on port: %s', PORT);
});

module.exports = app;
