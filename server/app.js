/*jshint esversion: 6 */
const PORT = 3000;
const JSON_SIZE_LIMIT = '50mb';

var express = require('express');
var bodyParser = require('body-parser');
var url = require('url');
var fs = require('fs');
var appRoot = require('app-root-path');
var reqlib = require('app-root-path').require;
var SpotifyHelper = reqlib('/server/spotify-helper');
var spotify = new SpotifyHelper();
var app = express();

app.use(bodyParser.json());
app.use(express.static("public"));
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
  var start = Date.now();
  spotify.search(request.body.query).then(function(result)  {
    console.log(Date.now() - start);
    response.json(result);
  });
});

app.post('/recommendations', function(request, response)  {
  var start = Date.now();
  spotify.getRecommendations(request.body.artists, request.body.tracks, 10, 145, 0.8, 0.5)
    .then(function(result)  {
      console.log(Date.now() - start);
      response.json(result);
    }, function(err)  {
      console.log(err);
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

app.get('/callback', function(request, response)  {
  var url_parts = url.parse(request.url, true);
  var access_token = url_parts.query.code;
  response.json(access_token);
});

app.get('/', function(request, response)  {
  console.log(spotify.authorizeURL());
  response.render('index', {authorizeURL: spotify.authorizeURL()});
});

app.listen(PORT, function() {
  console.log('Crushendo listening on port: %s', PORT);
});

module.exports = app;
