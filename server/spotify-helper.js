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
      var result = {};
      result.artists = data.body.artists.items.map(formatSpotifyObject);
      result.tracks = data.body.tracks.items.map(formatSpotifyObject);
      return result;
    });
};

SpotifyHelper.prototype.getRecommendations = function(seed_artists, seed_tracks, limit, bpm, danceability, energy)  {
  return this.spotifyApi.getRecommendations({
    seed_artists: seed_artists,
    seed_tracks: seed_tracks,
    limit: limit,
    min_tempo: bpm - 5,
    max_tempo: bpm + 5,
    target_danceability: danceability,
    min_danceability: danceability - 0.1,
    target_energy: energy,
    min_energy: energy - 0.1
  }).then(function(result)  {
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
