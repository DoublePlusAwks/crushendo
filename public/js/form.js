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
      console.log(item);
      return '<div class="autocomplete-suggestion" data-id="' + item.id + '" data-uri="' + item.uri + '">' + '<img src="' + item.image + '"/>' + item.name.replace(re, "<b>$1</b>") + '</div>';
    },
    cache: true,
    delay: 100,
    onSelect: function(e, term, item) {
      alert('Item "'+item.data('uri')+' ('+item.data('id')+')" selected by '+(e.type == 'keydown' ? 'pressing enter' : 'mouse click')+'.');
    }
  };

  $('#seed-input').autoComplete(options);

  $('form input').on('keypress', function(e) {
      return e.which !== 13;
  });
});
