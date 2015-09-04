var FanbookzTeamPhotos = (function($) {

  // Module object to be returned
  var module =
    {}

  /**
   * Initialise
   */
  module.init = function() {
    var $teamPhotos = $('.js-team-photos')

    $teamPhotos.owlCarousel({
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


    $teamPhotos.find('.owl-prev').on('click', function(event) {
        var $currentElem = $('div.owl-carousel.js-team-photos.owl-theme.owl-loaded').find('.active').prev().prev().find('.team-photos').eq(0)
          , viewData =
              { album: $currentElem.data('album')
              , username: $currentElem.data('username')
              , photo: $currentElem.data('photo')
              }

    })

    $teamPhotos.find('.owl-next').on('click', function(event) {
        var $currentElem = $('div.owl-carousel.js-team-photos.owl-theme.owl-loaded').find('.active').find('.team-photos').eq(0)
          , viewData =
              { album: $currentElem.data('album')
              , username: $currentElem.data('username')
              , photo: $currentElem.data('photo')
              }

    })

  }

  return module

})(window.jQuery)
