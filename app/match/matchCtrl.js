FANBOOKZ.match = {
  init: function() {
    // controller-wide code
  }
  , view: function() {
    // action-specific code

    // Load for google charts
    google.load('visualization', '1', {
      packages: ['corechart']
    , callback: function() {
	// A callback is needed otherwise google.load does
	// strange things with your page
      }
    })

    // Slider example
    // store the slider in a local variable
    var $window = $(window)
      , $teamFixtureSlider = $('.js-fixture-slides')
      , flexslider = {vars: {}}

    if ($teamFixtureSlider.length) {

      // tiny helper function to add breakpoints
      function getFixturesGridSize() {
        return  (window.innerWidth < 480) ? 2 :
                (window.innerWidth < 620) ? 3 :
                (window.innerWidth < 990) ? 4 : 6
      }

      var gridSize = getFixturesGridSize()

      $window.load(function() {
        $teamFixtureSlider.flexslider(
          { animation: 'slide'
            , animationLoop: false
            , slideshow: false
            , itemWidth: 123
            , itemMargin: 12
            , minItems: gridSize
            , maxItems: gridSize
            , controlNav: false
            , directionNav: true
            , prevText: '<div class="fb-icon fb-icon-chevron-left"></div>'
            , nextText: '<div class="fb-icon fb-icon-chevron-right"></div>'
            , start: function(){
              $teamFixtureSlider.animate({
                opacity: 1
              }, 100)

              // Advance the slider
              $teamFixtureSlider.flexslider(getActiveSlide())
            }
          }
        )
      })

      var onWindowResize = function() {
        resizeFlexslider($teamFixtureSlider)
      }
      $(window).one('resize', onWindowResize)
      // check grid size on mobile/tablet orientation change event
      $(window).on('orientationchange', onWindowResize)

      function resizeFlexslider($elem){

        if (!!$elem.data('flexslider')) {
          var gridSize = getFixturesGridSize()
          $elem.data('flexslider').vars.minItems = gridSize
          $elem.data('flexslider').vars.maxItems = gridSize
          setTimeout(function(){
            var slider = $elem.data('flexslider')
            slider.resize()
            $(window).one('resize', onWindowResize)
          }, 1000);
        }

      }

      function getActiveSlide(){
        // -- Advance to the slide with the active match in it --
        var activeMatchIndex = $('.fixtures-slides .slides li').index($('.fixtures-slides .slides li.active'))
        // Indexes are zero-based so add one to a new base 1 variable
        var activeMatchIndex1 = activeMatchIndex + 1
        var activeSlide = Math.ceil(activeMatchIndex1/gridSize)
        if(activeSlide < 1){
          activeSlide = 1
        }
        // Columns are zero-based so take our base 1 value and deduct 1 to make zero-based
        activeSlide = activeSlide - 1
        return activeSlide
      }

    }
  }
}
