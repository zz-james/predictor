var FanbookzTeamTwitter = (function($) {

  // Module object to be returned
  var module =
    {}

  /**
   * Initialise
   */
  module.init = function() {
    var $teamTwitter = $('.js-team-twitter')

    $teamTwitter.owlCarousel({
      loop: true
    , margin: 15
    , nav: true
    , dots: false
    , navText: false
    , responsive : {
      0 : {
          items:1
          , nav: false
      }
      , 480 : {
        items:1
      }
      , 768 : {
        items:1
      }
    }
    , startPosition: 0
    })
      

    // $('.owl-prev').on('click', function(event) {
    //     var $currentElem = $('div.owl-carousel.js-team-twitter.owl-theme.owl-loaded').find('.active').prev().prev().find('.team-twitter').eq(0)
    //       , viewData =
    //           { album: $currentElem.data('album')

    //           }

    // })

    // $('.owl-next').on('click', function(event) {
    //     var $currentElem = $('div.owl-carousel.js-team-twitter.owl-theme.owl-loaded').find('.active').find('.team-twitter').eq(0)
    //       , viewData =
    //           { post: $currentElem.data('post')

    //           }

    // })

  }

  return module

})(window.jQuery)
