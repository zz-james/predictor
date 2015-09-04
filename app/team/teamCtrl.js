FANBOOKZ.team = {
  init: function() {
    // controller-wide code
    this.setupClubSupporterCarousel()
    this.setupTeamSquadCarousel()
  }
  , list: function() {
    // action-specific code
  }


  //==============================================================================
  // Team supporter Slider
  //==============================================================================
  , setupClubSupporterCarousel: function() {

    var fanbookzSupporterCarousel = new FanbookzClubCarousel()
      , fanbookzSupporterCarouselOptions =
        { sliderElement: '.js-supporter-flipster'
        , sliderContainer: '.js-supporter-slider-container'
        , backgroundOverlay: '.slider-bg-overlay'
        }

    fanbookzSupporterCarousel.init(fanbookzSupporterCarouselOptions)

    // open slider event
    $('.js-supporter-slider-open').on('click', function (event) {
      event.preventDefault()
      if($('.js-supporter-slider-open[data-slideid]').length) {
        var startingSlide = ($(this).attr('data-slideid') - 1)
      }
      fanbookzSupporterCarousel.sliderOpen(startingSlide)
    })

    // close slider events
    $('.js-supporter-slider-close').on('click', function (event) {
      event.preventDefault()
      fanbookzSupporterCarousel.sliderClose()
    })
    $('.slider-bg-overlay').on('click', function (event) {
      event.preventDefault()
      fanbookzSupporterCarousel.sliderClose()
    })
  }

  //==============================================================================
  // Team Squad carousel
  //==============================================================================
  , setupTeamSquadCarousel: function(){

    var fanbookzSquadCarousel = new FanbookzClubCarousel()
      , fanbookzSquadCarouselOptions =
        { sliderElement: '.js-squad-flipster'
        , sliderContainer: '.js-squad-slider-container'
        , backgroundOverlay: '.slider-bg-overlay'
        }

    fanbookzSquadCarousel.init(fanbookzSquadCarouselOptions)

    // Gets the index for the player slide
    var getSlideIndexByPlayerID = function(playerid){
      return $('.js-club-slider-item[data-playerid="' + playerid + '"]').index()
    }

    //open slider events
    $('.js-squad-slider-open').on('click', function (event) {
      event.preventDefault()
      if(Fanbookz.getDeviceSize() != "mobile"){
        if($('.js-squad-slider-open[data-playerid]').length) {
          var startingSlide = getSlideIndexByPlayerID( $(this).attr('data-playerid') )
        }
        fanbookzSquadCarousel.sliderOpen(startingSlide)
      }
    })


    // close slider events
    $('.js-squad-slider-close').on('click', function (event) {
      event.preventDefault()
      fanbookzSquadCarousel.sliderClose()
    })
    $('.slider-bg-overlay').on('click', function (event) {
      event.preventDefault()
      fanbookzSquadCarousel.sliderClose()
    })
  }

  , view: function() {
    // action-specific code

  //==============================================================================
  // Team fixtures slider
  //==============================================================================
    // Slider example
    // store the slider in a local variable
    var $window = $(window)
      , $teamFixtureSlider = $('.js-fixture-slides')
      , flexslider = {vars: {}}

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
          }
        }
      )
    })

    var onWindowResize = function() {
      resizeFlexslider($teamFixtureSlider)
    }
    // check grid size on resize event
    $(window).on('resize', onWindowResize)
    // check grid size on mobile/tablet orientation change event
    $(window).on('orientationchange', onWindowResize)

    function resizeFlexslider($elem){

      if (!!$elem.data('flexslider')) {
        var gridSize = getFixturesGridSize()
        $elem.data('flexslider').vars.minItems = gridSize
        $elem.data('flexslider').vars.maxItems = gridSize
        setTimeout(function(){
          var slider = $elem.data('flexslider');
          slider.resize()
          $(window).one('resize', onWindowResize)
        }, 1000);
      }

    }

    //==============================================================================
    // Team Player Slider
    //==============================================================================

    var $window = $(window)
    var $teamPlayerSlider = $('.js-team-players-slider')

    if ($teamPlayerSlider.length) {
      var playersGridSize = getPlayersGridSize()

      // helper function to add breakpoints
      function getPlayersGridSize() {
        return (window.innerWidth < 450) ? 2 :
               (window.innerWidth < 600) ? 4 :
               (window.innerWidth < 990) ? 6 : 8
      }

      // check grid size on resize event
      $window.resize(function() {
        var playersGridSize = getPlayersGridSize()
        $teamPlayerSlider.data('flexslider').vars.minItems = playersGridSize
        $teamPlayerSlider.data('flexslider').vars.maxItems = playersGridSize
      })

      $window.load(function() {
        $teamPlayerSlider.flexslider({
          slideshow: false,
          animation: 'slide',
          animationLoop: false,
          itemWidth: 120,
          itemMargin: 0,
          minItems: playersGridSize,
          maxItems: playersGridSize,
          controlNav: false,
          directionNav: true,
          prevText: '',
          nextText: '',
          start: function(slider){
            $teamPlayerSlider.css('opacity', '1')
          }
        })
      })
    }

    $('.js-follow-team').on('click', function (event) {
      event.preventDefault()
      $.ajax({
        type: 'GET'
        , url: $(this).data('url')
        , dataType: 'json'
        , success: function(data){
          if(data.success === true){
            $('.js-follow-team').addClass('is--hidden')
            $('.js-unfollow-team').removeClass('is--hidden')
          }
        }
      })
    })
    $('.js-unfollow-team').on('click', function (event) {
      event.preventDefault()
      $.ajax({
        type: 'GET'
        , url: $(this).data('url')
        , dataType: 'json'
        , success: function(data){
          if(data.success === true){
            $('.js-unfollow-team').addClass('is--hidden')
            $('.js-follow-team').removeClass('is--hidden')
          }
        }
      })
    })


    //==============================================================================
    // Sidekick
    //==============================================================================

    FanbookzSidekick.loadSidekick('team','feed','.js-sidekick--mobile--feed')

  }
}
