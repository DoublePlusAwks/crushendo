# Crushendo
A web app to generate Spotify workout playlists
(visit me at [crushendo.com](http://crushendo.com)).

## Installation

Get Spotify credentials from [here](https://developer.spotify.com/) and
place them in `config/secrets.js` (follow `config/secrets.js.example` as
a guide).

### Express
    npm install
    npm start

### Docker
    docker build -t crushendo .
    docker run -p 3000:80 crushendo
