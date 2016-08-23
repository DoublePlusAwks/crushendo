$(function()  {
  var playlistOptions;
  var step1 = function()  {
    playlistOptions = {};
    $('#main').empty();
    $('#main').append(
      $('<div>').attr({
        'class': 'box'
      }).append(
        $('<button>').attr({
          'id': 'shoe-button',
          'class': 'btn btn-lg btn-primary btn-img content'
        })
      )
    ).append(
      $('<div>').attr({
        'class': 'spacer'
      })
    ).append(
      $('<div>').attr({
        'class': 'box'
      }).append(
        $('<button>').attr({
          'id': 'weight-button',
          'class': 'btn btn-lg btn-primary btn-img content'
        })
      )
    );

    $('#shoe-button').on('click', function()  {
      playlistOptions.type = 'running';
      step2();
    });

    $('#weight-button').on('click', function()  {
      playlistOptions.type = 'lifting';
      step3();
    });
  };

  var step2 = function()  {
    $('#main').empty();
    $('#main').append(
      $('<div>').attr({
        'class': 'box'
      }).append(
        $('<button>').attr({
          'id': 'bpm-down',
          'class': 'btn btn-lg btn-primary btn-img content'
        })
      )
    ).append(
      $('<div>').attr({
        'class': 'spacer'
      })
    ).append(
      $('<div>').attr({
        'class': 'box'
      }).append(
        $('<button>').attr({
          'id': 'bpm-up',
          'class': 'btn btn-lg btn-primary btn-img content'
        })
      )
    ).append($('<h1>').attr({
      'id': 'bpm-disp'
    }).text('Don\'t care')).append(
      $('<button>').attr({
        'id': 'bpm-submit',
        'class': 'btn btn-lg btn-primary'
      }).text('Submit')
    );

    var updateDisp = function()  {
      $('#bpm-disp').text(playlistOptions.bpm);
    };

    $('#bpm-up').on('click', function() {
      playlistOptions.bpm = playlistOptions.bpm + 5 || 145;
      updateDisp();
    });

    $('#bpm-down').on('click', function() {
      playlistOptions.bpm = playlistOptions.bpm - 5 || 145;
      updateDisp();
    });

    $('#bpm-submit').on('click', function() {
      step3();
    });
  };

  var step3 = function()  {
    $('#main').empty();
    $('#main').append(
      $('<div>').addClass('jumbotron').append(
        $('<img>').attr({
          'class': 'img-responsive',
          'src': 'images/logo.png'
        })
      )
    ).append(
      $('<div>').append(
        $('<input>').attr({
          'id': 'seed-input',
          'class': 'form-control'
        })
      ).append(
        $('<ul>').attr({
          'id': 'seeds',
          'class': 'list-group'
        })
      ).append(
        $('<button>').attr({
          'id': 'seed-submit',
          'class': 'btn btn-lg btn-primary center-block'
        }).text('Submit')
      )
    );

    playlistOptions.seedIds = {
      artists: [],
      tracks: []
    };

    $('#seed-input').autoComplete({
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
      delay: 300,
      onSelect: function(e, term, item) {
        if(item.data('type') === 'artist')  {
          playlistOptions.seedIds.artists.push(item.data('id'));
        } else {
          playlistOptions.seedIds.tracks.push(item.data('id'));
        }
        $('#seeds').append($('<li>').addClass('list-group-item').text(item.data('name')));
        if($('#seeds li').length > 4) {
          $('#seed-input').prop('disabled', true);
        }
      }
    });

    $('#seed-submit').on('click', function() {
      $.ajax({
        type: 'POST',
        url: '/recommendations',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(playlistOptions),
        success: function(response) {
          playlistOptions = undefined;
          var recommendationIds = [];
          response.forEach(function(e)  {
            recommendationIds.push(e.id);
          });
          $('#main').empty().append(
            '<iframe src="https://embed.spotify.com/?uri=spotify:trackset:PREFEREDTITLE:' +
              recommendationIds.toString() +
              '&theme=white" width="300" height="380" frameborder="0" allowtransparency="true"></iframe>'
          );
          $('#main').append(
            '<button id="save" class="btn btn-primary btn-lg center-block">Save playlist</button>'
          );
          $('#save').on('click', function()  {
            $.ajax({
              type: 'POST',
              url: '/save',
              contentType: 'application/json',
              data: JSON.stringify(recommendationIds),
              success: function(response) {
                window.location.replace(response.authorizeURL);
              }
            });
          });
        }
      });
    });

    $('form input').on('keypress', function(e) {
        return e.which !== 13;
    });
  };
  $('#logo').on('click', function() {
    playlistOptions = undefined;
    step1();
  });
  step1();
});
