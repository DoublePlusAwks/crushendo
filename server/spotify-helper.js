/*jshint esversion: 6 */
var appRoot = require('app-root-path');
var reqlib = require('app-root-path').require;
var SpotifyWebApi = require('spotify-web-api-node');
const secrets = reqlib('/config/secrets');
const API_SCOPES = ['playlist-modify-private'];
const SEARCH_LIMIT = 2;

if(!Array.prototype.last){
  Array.prototype.last = function(){
    return this[this.length - 1];
  };
}

var formatSpotifyObject = function(obj) {
  var result = {};
  result.uri = obj.uri;
  result.id = obj.id;
  result.name = obj.name;
  result.image = (obj.type === 'track') ?
    obj.album.images.last().url : obj.images.last().url;
  return result;
};

var SpotifyHelper = function(accessToken) {
  var thisSpotifyHelper = this;
  this.spotifyApi = new SpotifyWebApi({
    clientId : secrets.clientId,
    clientSecret : secrets.clientSecret,
    redirectUri : secrets.redirectUri
  });
};

SpotifyHelper.prototype.search = function(query) {
  return this.spotifyApi.search(query, ['track', 'artist'], {limit: SEARCH_LIMIT})
    .then(function(data)  {
      var artists = (data.body.artists.items === []) ? [] : data.body.artists.items.map(formatSpotifyObject);
      var tracks = (data.body.tracks.items === []) ? [] : data.body.tracks.items.map(formatSpotifyObject);
      return artists.concat(tracks);
    });
};

SpotifyHelper.prototype.getRecommendations = function(options, limit)  {
  var danceability = 0.7;
  var energy = 0.8;
  // Can be used later to change playlist generations based on
  // lifting or running
  // if(options.type === 'running')  {
  //   danceability = 0.6;
  //   energy = 0.7;
  // } else {
  //   danceability = 0.5;
  //   energy = 0.8;
  // }
  return this.spotifyApi.getRecommendations({
    seed_artists: options.seedIds.artists,
    seed_tracks: options.seedIds.tracks,
    limit: limit,
    min_tempo: options.bpm - 5,
    min_danceability: danceability - 0.1,
    min_energy: energy - 0.1
  }).then(function(result)  {
    if(result.body.tracks === []) { return; }
    return result.body.tracks.map(formatSpotifyObject);
  }, function(err)  {
    console.log(err);
    return err;
  });
};

SpotifyHelper.prototype.getAudioFeatures = function(trackId)  {
  return this.spotifyApi.getAudioFeaturesForTrack(trackId)
    .then(function(result) {
      return result.body;
    });
};

SpotifyHelper.prototype.getClientToken = function() {
  thisSpotifyHelper = this;
  thisSpotifyHelper.spotifyApi.clientCredentialsGrant()
    .then(function(data) {
      console.log('The access token expires in ' + data.body.expires_in);
      console.log('The access token is ' + data.body.access_token);

    // Save the access token so that it's used in future calls
    thisSpotifyHelper.spotifyApi.setAccessToken(data.body.access_token);
  }, function(err) {
    console.log('Something went wrong when retrieving an access token', err);
  });
};

SpotifyHelper.prototype.authorizeURL = function(state)  {
  return this.spotifyApi.createAuthorizeURL(API_SCOPES, state);
};

SpotifyHelper.prototype.getMe = function()  {
  return this.spotifyApi.getMe();
};

module.exports = SpotifyHelper;
