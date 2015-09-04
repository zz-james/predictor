/* jshint unused: false */
var FanbookzSidekick = (function($){

  // Module object to be returned
  var module = {}
    , sidekickLoaded = false
    , loadedSidekicks = []  // This variable holds an array of strings of the loaded sidekick tab names
    , sidekickIsOpen = false
    , sidekickTabOpen = false

  // If we're on the homepage and haven't got the hiding cookie, the sidekick is open
  if( $('.js-sidekick--homepage').length && !$('.js-sidekick--cookie-load-closed').length){
    sidekickIsOpen = true
  }

  // sidekickConfig object stores the sidekick config
  /*
  if(sidekickPage == "home"){

    if(device == "mobile"){
      var sidekickConfig = {
        usesTabs: false,
        openOnLoad: false
      }
    } else {
      var sidekickConfig = {
        usesTabs: false,
        openOnLoad: true
      }
    }

  } else {
    // Team page
    if(device == "mobile"){
      var sidekickConfig = {
        usesTabs: true,
        openOnLoad: true,
        defaultTab: 'feed'
      }
    } else {
      var sidekickConfig = {
        usesTabs: true,
        openOnLoad: true,
        defaultTab: 'feed'
      }
    }
  }
  */


  module.loadSidekick = function(sidekickPage,sidekickTab,sidekickTarget){

    var ajaxUrl = ""
      , $sidekickTarget = $(sidekickTarget)
      , $sidekickHolder = $sidekickTarget.parent()

    //console.log('sidekickPage: ' + sidekickPage + ' sidekickTab: ' + sidekickTab + ' sidekickTarget: ' + sidekickTarget)

    // If sidekickTab is defined, eg on the Team page
    if(sidekickTab !== undefined){
      // Hide all sidekicks
      $('.js-sidekick-slider').hide()
      sidekickTabOpen = sidekickTab
    }

    // If this sidekick has already been loaded, show it
    if(sidekickTab != "" && loadedSidekicks.indexOf(sidekickTab) != -1){

      // Show just the one we want
      $('.js-sidekick-team-'+sidekickTab).show()

    } else {
      // Else load the sidekick via AJAX

      // If the sidebar isn't set to be closed by the cookie
      if(!Cookies.enabled || Cookies.get('sidekick-team-closed') != 'true') {
        $sidekickHolder.find('.js-sidekick').addClass('sidekick-holder--loading')
        var device = Fanbookz.getDeviceSize()

        // Show the correct preloader for the device size
        if(device == "desktop"){
          $('.js-sidekick__header--team').addClass('sidekick__header--loading')
          $('.js-preloader--sidekick--desktop').show()
        } else {
          $sidekickHolder.find('.js-sidekick__header--team').addClass('sidekick__header--loading')
          $sidekickTarget.find('.js-preloader--sidekick').show()
        }

      }

      if(sidekickPage == "home"){
        // There are no tabs
        ajaxUrl = paths.base + '/' + locale + '/sidekick/'
      } else if(sidekickTab == 'news') {
        ajaxUrl = paths.base + '/' + locale + '/team/news/' + teamId + '/10'  // Get 10 posts
      } else {
        ajaxUrl = paths.base + '/' + locale + '/sidekick/' + sidekickPage + '/' + sidekickTab + '/' + teamId
      }

      $.ajax({
        type: 'GET'
        , url: ajaxUrl
        , success: function(data){
          if (data) {
            sidekickLoaded = true
            loadedSidekicks[loadedSidekicks.length] = sidekickTab

            if(sidekickTarget !== undefined){
              //console.log('appending to target: ' + sidekickTarget)
              $(sidekickTarget).append(data)
            } else if(sidekickPage == "home") {
              // $('.js-sidekick').append(data)
              $('.js-sidekick--homepage').append(data)
            } else {
              $(data).insertAfter('.sidekick__header--desktop')
            }

            // Set up the slick slider

            if(sidekickPage == "home"){

              var sidekickSlider = new SidekickSlider({
                el: $('.js-sidekick-slider'),
                sidekickPage: sidekickPage
              })

            } else {
              // Assuming team
              var sidekickSlider = new SidekickSlider({
                el: $('.js-sidekick-team-'+sidekickTab),
                sidekickPage: sidekickPage
                , sidekickTab: sidekickTab
              })

              //if(sidekickTab == 'squad'){
                FANBOOKZ.team.setupTeamSquadCarousel()
              //}

              // Show just the tab content we want
              $('.js-sidekick-team-'+sidekickTab).show()

            }

            $('.js-sidekick__header--team').removeClass('sidekick__header--loading')

          }
        }
      })

    }

  }

  /**
   * Initialise
   */
  module.init = function() {

    var device = Fanbookz.getDeviceSize()
    if(device == "mobile" || device == "tablet"){
      //$('.sidekick__header').addClass('js-sidekick-toggle')
      //$('.sidekick__header__close').removeClass('js-sidekick-toggle')
    }

    closeAllOtherSidekicks = function($exclude){
      $elem = $('.sidekick__holder').not($exclude)
      $elem.each(function(){
        $(this).find('.sidekick__header').removeClass('sidekick__header--open')
        //$(this).find('.sidekick__inner').slideUp(400)
        $(this).find('.sidekick__inner').hide()
        $(this).find('.sidekick').removeClass('sidekick--has-counter')
      })
    }

    // -/+ toggle on Desktop

    $('.js-sidekick-toggle--home').on('click',function(){
      var target = $(this).data('sidekick-target')
        , $target = $(target)
        , $targetInner = $(target).find('.sidekick__inner')

      $(this).parents('.sidekick__header').toggleClass('sidekick__header--open')
      //$target.toggleClass('sidekick--open')

      if(sidekickIsOpen){
        // Sidekick is open, so close it
        //$elemSpan.removeClass('glyphicon-minus').addClass('glyphicon-plus')
        //$(this).removeClass('sidekick__header__toggle--open')

        $target.find('.sidekick__inner').slideUp(400,function(){
          $(this).parent('.sidekick').removeClass('sidekick--open')
          //$('.slick-nav-arrows').attr('style', 'display: none !important')

          var device = Fanbookz.getDeviceSize()
          if(device == "mobile" || device == "tablet"){
            // Since the page height its changing, update the sticky menu snapping position
            FANBOOKZ.home.getStickyTabMenuInitialPosition()
          }

        })

        // If cookies are enabled
        if (Cookies.enabled) {
          // Set the cookie
          Cookies.set('sidekick-closed', 'true')
          $('.slick-nav-arrows').attr('style', 'display: none !important')
          $('.sidekick--fade').attr('style', 'display: none !important')
        }

        sidekickIsOpen = false

      } else {
        // Sidekick is closed, so open it
        //$elemSpan.addClass('glyphicon-minus').removeClass('glyphicon-plus')
        //$(this).addClass('sidekick__header__toggle--open')
        $('.slick-nav-arrows').attr('style', 'display: block !important')
        $('.sidekick--fade').attr('style', 'display: block !important')


        // If cookies are enabled
        if(Cookies.enabled){
          // Remove the cookie
          Cookies.set('sidekick-closed', '')
        }

        if(!sidekickLoaded){
          FanbookzSidekick.loadSidekick('home')
        }

        // Close all other sidekicks
        $('.sidekick__inner').not($targetInner).slideUp(400)

        $targetInner.slideDown(400,function(){
          //$(this).parent('.sidekick').addClass('sidekick--open')
          $('.slick-nav-arrows').attr('style', 'display: block !important')
          $('.sidekick--fade').attr('style', 'display: block !important')

          // This fixes an issue where if the sidekick is loaded closed (via the cooked), once opened the carousel doesn't show.
          // This re-initialises the carousel making it show again
          var device = Fanbookz.getDeviceSize()
          if(device != "mobile"){
            $(window).trigger('resize')
          }

        })

        sidekickIsOpen = true

      }

    })


    // +/- toggle on the team page on desktop
    $('.js-sidekick-toggle--desktop--team').on('click',function(e){
      e.preventDefault()
      $(this).find('.glyphicon').toggle()
      $('.js-sidekick-team-'+sidekickTabOpen).slideToggle(400)
    })


    // +/- toggle on the team page on mobile
    // Fake a click on the tab title
    $('.js-sidekick__header__toggle--team--mobile').on('click',function(e){
      e.preventDefault()
      $(this).parent().find('.js-sidekick-tabs-trigger').trigger('click')
    })


    // Handle clicking on desktop tabs, also triggered by mobile +/- toggle taps
    var $sidekickTabs = $('.js-sidekick-tabs')
    if($sidekickTabs.length){
      $('.js-sidekick-tabs-trigger').on('click',function(e){
        e.preventDefault()

        var $elem = $(this)
          , sidekickPage = $elem.data('sidekick-page')
          , sidekickTab = $elem.data('sidekick-tab')
          , sidekickTarget = $elem.data('sidekick-target')
          , $sidekickTargetElem = $(sidekickTarget)
          , $sidekickTargetHeaderElem = $(this).parents('.sidekick__header')
          , $sidekickTargetHolderElem = $sidekickTargetElem.parents('.sidekick__holder')

        if($elem.hasClass('sidekick__header--mobile__trigger')){
          // If mobile

          closeAllOtherSidekicks($sidekickTargetHolderElem)

          // Scroll up to the tab we've just clicked on
          var scrollTo = $sidekickTargetHeaderElem.offset().top - parseInt($sidekickTargetHeaderElem.css("border-top-width"),10) - $('.header').outerHeight() + 1
          $(window).scrollTop( scrollTo )

          // Make this tab look 'open'
          $sidekickTargetHeaderElem.toggleClass('sidekick__header--open')
          $sidekickTargetElem.toggleClass('sidekick--has-counter')
          $elem.parents('.sidekick__header__toggle').toggleClass('sidekick__header__toggle--open')

          if($sidekickTargetElem.find('.sidekick__inner').length){
            $sidekickTargetElem.find('.sidekick__inner').slideToggle(400)
          }

        } else {
          // If desktop
          $sidekickTabs.find('li').removeClass('sidekick__tabs__tab--active')
          $elem.parent().addClass('sidekick__tabs__tab--active')
        }

        FanbookzSidekick.loadSidekick(sidekickPage,sidekickTab,sidekickTarget)
      })
    }
  }

  return module

})(window.jQuery)
