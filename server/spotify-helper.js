const SpotifyWebApi = require('spotify-web-api-node');
const secrets = require('../config/secrets');

// credentials are optional
var spotifyApi = new SpotifyWebApi({
  clientId : secrets.clientId,
  clientSecret : secrets.clientSecret,
  redirectUri : secrets.redirectUri
});

var SpotifyHelper = function () {};

SpotifyHelper.prototype.search = function(query) {
  return spotifyApi.search(query, ['track', 'artist'])
    .then(function(result)  {
      return result.body;
    });
};

module.exports = SpotifyHelper;
