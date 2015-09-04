/* jshint unused: false */
var FanbookzHeroCarousel = (function($) {

  // Module object to be returned
  var module = {}

  /**
   * Initialise
   */
  module.init = function() {

    // Disable on testing env
    slideshowAutoPlay = document.location.origin.indexOf('local.fanbookz.com') <= -1;

    // Hero flex slider carousel
    $('.js-news-hero').flexslider({
      pauseOnAction: false,
      pauseOnHover: true,
      slideshow: slideshowAutoPlay
    })

    // Add dynamic divs and classes to flexslider
    $('.flex-direction-nav').wrap('<section class="container flex-slide"></section>')
    $('.flex-direction-nav li a.flex-prev').empty().addClass('fb-icon-chevron-left')
    $('.flex-direction-nav li a.flex-next').empty().addClass('fb-icon-chevron-right')

  }

  return module

})(window.jQuery)
