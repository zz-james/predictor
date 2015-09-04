/* jshint unused: false */
var FanbookzClubCarousel = function() {

  // Module object to be returned
  var module = {}

  module.loadTeamFlipsterSlider = function(){

  }

  /**
   * Initialise
   */
  module.init = function(options) {
    this.$slider
    this.$sliderElement = $(options.sliderElement)
    this.$sliderContainer = $(options.sliderContainer)
    this.$backgroundOverlay = $(options.backgroundOverlay)
  }

  module.sliderOpen = function($startingSlide) {
    var self = this

    $('html,body').css('overflow','hidden')
    this.$slider = this.$sliderElement.flipster({ style: 'carousel', start: $startingSlide })

    this.$sliderContainer.css( {
      'top': self.containerPosition(),
      'display':'block'
    })
    this.$backgroundOverlay.css( {
      'display': 'block',
      'top': $(window).scrollTop()
    })
    setTimeout(function(){
      self.$backgroundOverlay.addClass('visible')
    }, 500)
  }

  module.sliderClose = function() {
    var self = this

    $('html,body').css('overflow','auto')
    this.$backgroundOverlay.removeClass('visible')
    this.$sliderContainer.css('display','none')
    this.$sliderElement.removeClass('flipster-active')
    setTimeout(function(){
      self.$backgroundOverlay.css('display','none')
    },800)
  }

  module.containerPosition = function() {
    return $(window).scrollTop() + parseInt($('.header').height(), 10) + 20
  }

  return module

}
