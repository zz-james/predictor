/* jshint unused: false */
var FanbookzSplashSlider = (function($) {

  // Module object to be returned
  var module =
    {}

  /**
   * Initialise
   */
  module.init = function() {
    $splashSlider = $('.js-splash-slider')
    $('.homepage__form__buttons').appendTo('.fos_user_registration_register');

    // Animation speed is set in owl.carousel.styl
    $splashSlider.owlCarousel({
      loop: true
      , margin: 0
      , nav: false
      , dots: true
      , dotsContainer: '.js-splash__dots--mobile'
      , autoplay: true
      , autoplayTimeout: 5000
      , startPosition: 0
      , mouseDrag: false
      , items: 1
      , animateOut: 'fadeOut'
      , responsive : {
        0 : {
          touchDrag: true
        }
        , 769 : {
          touchDrag: false
        }
      }
    })


  }

  return module

})(window.jQuery)
