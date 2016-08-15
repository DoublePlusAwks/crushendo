var SpotifyWebApi = require('spotify-web-api-node');
const secrets = require('../config/secrets');
const SEARCH_LIMIT = 2;

// credentials are optional
var spotifyApi = new SpotifyWebApi({
  clientId : secrets.clientId,
  clientSecret : secrets.clientSecret,
  redirectUri : secrets.redirectUri
});

if(!Array.prototype.last){
  Array.prototype.last = function(){
    return this[this.length - 1];
  };
};

var formatSpotifyObject = function(obj) {
  var result = {};
  result.id = obj.id;
  result.name = obj.name;
  result.image = (obj.type === 'track') ?
    obj.album.images.last().url : obj.images.last().url;
  return result;
}

var setAccessToken = function() {
  spotifyApi.clientCredentialsGrant()
    .then(function(data) {
      console.log('The access token expires in ' + data.body['expires_in']);
      console.log('The access token is ' + data.body['access_token']);

    // Save the access token so that it's used in future calls
    spotifyApi.setAccessToken(data.body['access_token']);
  }, function(err) {
    console.log('Something went wrong when retrieving an access token', err);
  });
}

var SpotifyHelper = function() {
  setAccessToken();
};

SpotifyHelper.prototype.search = function(query) {
  return spotifyApi.search(query, ['track', 'artist'], {limit: SEARCH_LIMIT})
    .then(function(data)  {
      var result = {};
      result.artists = data.body.artists.items.map(formatSpotifyObject);
      result.tracks = data.body.tracks.items.map(formatSpotifyObject);
      return result;
    });
};

SpotifyHelper.prototype.getRecommendations = function(seed_artists, seed_tracks, limit, bpm, danceability, energy)  {
  return spotifyApi.getRecommendations({
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
  return spotifyApi.getAudioFeaturesForTrack(trackId)
    .then(function(result) {
      return result.body;
    });
};

module.exports = SpotifyHelper;
