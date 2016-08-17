/*jshint esversion: 6 */
const PORT = 3000;
const JSON_SIZE_LIMIT = '50mb';

var express = require('express');
var bodyParser = require('body-parser');
var SpotifyHelper = require('./spotify-helper');
var spotify = new SpotifyHelper();
var app = express();

app.use(bodyParser.json());

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

app.listen(PORT, function() {
  console.log('Crushendo listening on port: %s', PORT);
});

module.exports = app;
