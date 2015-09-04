/* jshint unused: false */
var FanbookzPagination = (function($) {

  // Module object to be returned
  var module =
    {}

  /**
   * Initialise
   */
  module.init = function() {

    var $stream = $('.js-stream')
      , streamPostClass = '.js-stream-post'
      , $streamLoadMore = $( '.js-stream-load-more' )
      , limit = 12
      , offset = 0
      , postCount = 0

    // Hide load more button if less posts/comments than limit
    $($stream).children(streamPostClass).each(function () {
      postCount++
    })
    if ( postCount < limit ) {
      ( $streamLoadMore ).hide()
    }

    $( $streamLoadMore ).click(function() {
      $streamLoadMore.addClass('is-loading')
      var route = $(this).attr('data-route')

      // If this is the first pagination click, and the post count is set on the button, use it
      if( offset == 0 && $(this).attr('data-count') ){
        offset = parseInt( $(this).attr('data-count') )
      }

      postCount = 0
      route = route + '/' + offset + '/' + limit
      $.ajax({
        type: 'POST'
      , url: route
      , success: function(data){
          if (data) {
            $streamLoadMore.removeClass('is-loading')
            // needed to wrap the data in a div so that .children works
            data = '<div>' + data + '</div>'
            //var $items = []
            $(data).children(streamPostClass).each(function () {
              var elem = this
              $stream.append(elem)
              imagesLoaded($stream, function() {
                $stream.masonry('appended', elem)
              })
              postCount++
            })
            // Increment the offset by the number of posts returned, so next time the next set of results are returned
            offset = offset + postCount
            // hide load more btn if there are no more posts/comments
            if ( postCount < limit ) {
              ( $streamLoadMore ).hide()
            }
          }
        }
      })
    })
  }

  return module

})(window.jQuery)
