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
          response(data);
        }
      });
    },
    renderItem: function (item, search) {
      search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
      console.log(item.name);
      return '<div class="autocomplete-suggestion" data-id="' + item.id + '" data-uri="' + item.uri + '" data-name= "' + item.name + '">' + '<img src="' + item.image + '"/>' + item.name.replace(re, "<b>$1</b>") + '</div>';
    },
    cache: true,
    onSelect: function(e, term, item) {
      alert('Item "'+item.data('name')+' ('+item.data('id')+')" selected by '+(e.type == 'keydown' ? 'pressing enter' : 'mouse click')+'.');
      $('#seeds').append(item.data('uri'));
    }
  };

  $('#seed-input').autoComplete(options);

  $('form input').on('keypress', function(e) {
      return e.which !== 13;
  });
});
