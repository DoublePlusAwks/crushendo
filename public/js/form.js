$(function()  {
  var seedIds = {
    artists: [],
    tracks: []
  };

  var options = {
    source: function(term, response)  {
      $.ajax({
        type: 'POST',
        url: '/autocomplete',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify({query: term}),
        success: function(data) {
          response(data);
        }
      });
    },
    renderItem: function (item, search) {
      search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
      var type = item.uri.includes('artist') ? 'artist' : 'track';
      return '<div class="autocomplete-suggestion" data-id= "' + item.id +
                '" data-type="' + type + '" data-name= "' + item.name + '">' +
                '<img src="' + item.image + '"/>' +
                item.name.replace(re, "<b>$1</b>") + '</div>';
    },
    cache: true,
    minChars: 1,
    onSelect: function(e, term, item) {
      if(item.data('type') === 'artist')  {
        seedIds.artists.push(item.data('id'));
      } else {
        seedIds.tracks.push(item.data('id'));
      }
      $('#seeds').append('<li class="list-group-item">' + item.data('name') + '</li>');
    }
  };

  $('#seed-input').autoComplete(options);

  $('#seed-submit').on('click', function() {
    console.log('hiya');
    $.ajax({
      type: 'POST',
      url: '/recommendations',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify(seedIds),
      success: function(data) {
        var ids = [];
        $('#main').empty();
        data.forEach(function(e)  {
          var url = 'https://embed.spotify.com/?uri=spotify:track:' + e.id.toString() + '&theme=white"';
          console.log(url);
          $('#main').append(
            '<iframe src="' + url + '"width="300" height="80" frameborder="0" allowtransparency="true"></iframe>'
          );
          ids.push(e.id);
        });
        console.log(ids);
      //   $('#main').empty().append(
      //     '<iframe src="https://embed.spotify.com/?uri=spotify:trackset:PREFEREDTITLE:' + ids.toString() + '" width="300" height="380" frameborder="0" allowtransparency="true"></iframe>');
      }
    });
  });

  $('form input').on('keypress', function(e) {
      return e.which !== 13;
  });
});
