$(function()  {
  var options = {
    source: function(term, response)  {
      $.ajax({
        type: 'POST',
        url: '/autocomplete',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify({query: term}),
        success: function(data) {
          var artists = data.artists.map(function(x) {
            return x.name;
          });
          var tracks = data.tracks.map(function(x) {
            return x.name;
          });
          console.log(artists.concat(tracks));
          response(artists.concat(tracks));
        }
      });
    }
  };

  $('#seed-input').autoComplete(options);

  $('form input').on('keypress', function(e) {
      return e.which !== 13;
  });
});
