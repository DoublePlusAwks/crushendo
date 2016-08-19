var input = document.getElementById('seed-input');
var aw = new Awesomplete(input, {
  list: ['Java', 'Javascript', 'Java beans', 'Java, the country']
});

$('#seed-input').bind('keypress', function(e) {
  var inputVal = $("#seed-input").val();
  $.ajax({
      type: 'POST',
      url: '/autocomplete',
      data: JSON.stringify({query: inputVal}),
      success: function(data) {
        var artists = data.artists.map(function(x) {
          return x.name;
        });
        var tracks = data.tracks.map(function(x) {
          return x.name;
        });
        aw.list = artists.concat(tracks);
      },
      contentType: "application/json",
      dataType: 'json'
  });
});
