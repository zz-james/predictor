FANBOOKZ.home = {
  mobileMenuInitTop: null,
  getStickyTabMenuInitialPosition: function(){
    if($('.js-homepage-mobile-tab-menu-inner').length){
      this.mobileMenuInitTop = $('.js-homepage-mobile-tab-menu-inner').offset().top
    }
  },
  init: function() {
    if ($('body').hasClass('user_logged_in')) {
      // controller-wide code

      var sidebarLoaded = false
        , sidebarLoadedIntoTab = false
        , sidekickLoaded = false

      // News hero carousel
      FanbookzHeroCarousel.init()

      // Load initial comment tab
      $.ajax({
        type: 'GET'
        , url: paths.base + '/' + locale + '/comment/home/most-recent/0/20'
        , success: function(data){
          if (data) {
            $('#most-recent-tab .js-comment-container').prepend(data)
            $('.js-social-post').each(function(index, element){
              var $elem = $(element)
              var commentWidget = new CommentWidget({
                el: $elem
                , id: $elem.data('comment-id')
                , username: $elem.data('username')
                , container: $('.js-comment-container')
              })
            })
          }
          $('.js-preloader--social').hide()
        }
      })



      // Load sidebar
      loadSidebar = function(){
        $.ajax({
          type: 'GET'
          , url: paths.base + '/' + locale + '/sidebar'
          , success: function(data){
            if (data) {
              sidebarLoaded = true
              $('.js-sidebar-holder').append(data)
              $('.js-preloader--sidebar').hide()
              FanbookzStandingsWidget.init()
            }
          }
        })
      }


      // Move the mini predictor from the stats tab (desktop sidebar) to under the header on mobile
      var moveMiniPredictor = function(){
        var miniPredictorDOM = $('.js-home-mobile-mini-predictor-source').contents()
        $('.js-home-mobile-mini-predictor-holder').append(miniPredictorDOM)
      }


      setupStickyTabMenu = function(){

        // The 'FANBOOKZ.home.mobileMenuInitTop' variable is global so it can be re-calculated from other scripts when things of the page change height - eg. the Sidekick
        FANBOOKZ.home.getStickyTabMenuInitialPosition()

        // Sticky mobile tab menu (Social Stream, The Fans Say, Club Stats)

        var $homeMobileTabMenuHolder = $('.js-homepage-mobile-tab-menu')
          , $homeMobileTabMenu = $('.js-homepage-mobile-tab-menu-inner')

        if($homeMobileTabMenu.length && $homeMobileTabMenu.css('display') == "block" ){

          var headerHeight = $('.header').height()
            , lastScrollTop = 0
            , scrollUpPixels = 0
            , scrollDirection = ''
            , stuckMenu = false
            , scrollPadding = 10

          $homeMobileTabMenuHolder.css('height', $homeMobileTabMenu.css('height') )  // Need to set the height of the holder, since when the inner menu goes to position fixed it will make the holder height 0 and affect the total page height

          var homeMobileTabMenuCheck = function() {
            var currentScrollTop = $(window).scrollTop() // our current vertical position of the top of the window

            if (currentScrollTop >= lastScrollTop ){
              // downscroll code
              scrollDirection = 'down'
              scrollUpPixels = 0
            } else {
              // upscroll code
              scrollUpPixels = scrollUpPixels + 1
              if(scrollUpPixels >= scrollPadding){
                scrollDirection = 'up'
              }
            }
            lastScrollTop = currentScrollTop

            // If we've scrolled past the original position of the menu
            if( currentScrollTop > (FANBOOKZ.home.mobileMenuInitTop - headerHeight) ){

              if( scrollDirection == 'up' ){

                $homeMobileTabMenu.addClass('homepage--mobile__tab-menu--fixed')

                if( stuckMenu == false ){
                  stuckMenu = true
                  $homeMobileTabMenu.animate({
                    top: '56px'
                  }, 200, function() {
                    // Animation complete.
                  })
                }

              } else if( scrollDirection == 'down' ){

                if( stuckMenu == true ){
                  stuckMenu = false
                  $homeMobileTabMenu.animate({
                    top: '0px'
                  }, 200, function() {
                    // Animation complete.
                    $homeMobileTabMenu.removeClass('homepage--mobile__tab-menu--fixed')
                  })

                }

              }

            } else {
              stuckMenu = false
              $homeMobileTabMenu.removeClass('homepage--mobile__tab-menu--fixed')
            }
          }

          // run our function on load
          homeMobileTabMenuCheck()
          // and every time we resize the window
          $(window).resize(homeMobileTabMenuCheck)
          // and every time you scroll
          $(window).scroll(homeMobileTabMenuCheck)

          // End of sticky tab menu


          // Handle tab menu clicks
          $('.js-home-mobile-load-tab').on('click', function(e){
            e.preventDefault()
            var datatab = $(this).data('tab')

            // Show the correct DIV
            $('.js-home-mobile-tab').hide()
            $('.js-home-mobile-tab--' + datatab).show()

            // Load in the content via AJAX
            if($(datatab == "club-stats") && (!sidebarLoadedIntoTab)){
              loadSidebar()
              sidebarLoadedIntoTab = true
            }

            // Highlight the active tab
            $('.homepage--mobile__nav-tabs').find('li').removeClass('active')
            $(this).parent().addClass('active')

            $('body').scrollTop( ($homeMobileTabMenuHolder.offset().top - $('.header').height()) )
          })

        }
      }

      showSidekickToggle = function(){
        $('.js-sidekick-toggle').show()
      }

      showSidekickToggleAddPlus = function(){
        $('.sidekick__header').addClass('sidekick__header--open')
      }


      setupHome = function(){

        var device = Fanbookz.getDeviceSize()

        if(device == "mobile"){
          moveMiniPredictor()
          setupStickyTabMenu()
          showSidekickToggle()

        } else if(device == "tablet"){
          moveMiniPredictor()
          setupStickyTabMenu()
          showSidekickToggle()
          if(!sidekickLoaded){
            FanbookzSidekick.loadSidekick('home')
            sidekickLoaded = true
          }

        } else {
          // --- Desktop specific functions ---

          //showSidekickToggleAddPlus()

          // Load AJAX elements
          if(!sidebarLoaded){
            loadSidebar()
            sidebarLoaded = true
          }
          if(!sidekickLoaded){
            FanbookzSidekick.loadSidekick('home')
            sidekickLoaded = true
          }

          // If we haven't got the hiding cookie, the sidekick is open
          if( !$('.js-sidekick--cookie-load-closed').length){
            $('.sidekick__header').addClass('sidekick__header--open')
          }

        }
      }

      /* @TODO: Implement orientation change
      $(window).on("orientationchange",function(){
        setupHome()
      })
      */

      // Run on init
      setupHome()

    }

  }
  , index: function() {
    if ($('body').hasClass('user_logged_in')) {
      // action-specific code
      var $newsStream = $('.js-news-streams')
      new imagesLoaded( $newsStream, function(){
        $newsStream.masonry({
          itemSelector: '.js-news-stream-post'
          , isAnimated: true
        })
      })

      //==============================================================================
      // Comment stream tabs
      //==============================================================================
      var $loadTabLink = $('.js-load-stream-tab')
        , $loadTabId
        , $loadPaneId
        , $tabClicked = ['most-recent']
        , $streamPostClass = $('.js-stream-post')
        , $streamLoadMore = $( '.js-home-stream-load-more' )
        , limit = 20
        , offsetRecent = 10
        , offsetPopular = 10
        , offsetfollow = 10
        , offset = 0
        , postCount = 0
        , route
        , currentStream

      $( $loadTabLink ).click(function(e) {
        e.preventDefault()
        $loadTabId = $(this).attr('id')
        postCount = 0

        $('.js-social__comment__type-dropdown__menu li').removeClass('active')
        $(this).parent('li').addClass('active')
        $('.js-social__comment__type-dropdown__label').text( $(this).text() )

        if ( $.inArray( $loadTabId, $tabClicked ) ===-1 ) {
          $('.js-home__tab-content').removeClass('active')
          $('.js-preloader--social').show()
          $loadPaneId = '#' + $loadTabId + '-tab'
          $.ajax({
            type: 'GET'
            , url: '/' + locale + '/comment/home/' + $loadTabId + '/0/10'
            , success: function(data){
              if (data) {
                $($loadPaneId + ' .js-comment-container').prepend(data)
                $('.js-social-post').each(function(index, element){
                  var $elem = $(element)
                  var commentWidget = new CommentWidget({
                    el: $elem
                    , id: $elem.data('comment-id')
                    , username: $elem.data('username')
                    , container: $('.js-comment-container')
                  })
                })
                $('.preloader').fadeOut()
                $($loadPaneId).addClass('active')

                // Hide load more button if less posts/comments than limit
                data = '<div>' + data + '</div>'
                $(data).children($streamPostClass).each(function () {
                  postCount++
                })
                if ( postCount < limit ) {
                  $($loadPaneId + ' .js-home-stream-load-more' ).hide()
                }

              }
            }
          })
          $tabClicked.push($loadTabId)
        } else {
          // We already have the content - so show the tab
          $('.js-home__tab-content').removeClass('active')
          $('#' + $loadTabId + '-tab').addClass('active')
        }
      })

      // Pagination
      $( $streamLoadMore ).click(function() {

        $('.js-preloader--social').show()
        currentStream = $(this).parent().attr('id')

        if ( currentStream === 'most-recent-tab' ) {
          offset = offsetRecent
          offsetRecent = offsetRecent + limit
          route = 'most-recent'
        } else if ( currentStream === 'most-popular-tab' ) {
          offset = offsetPopular
          offsetPopular = offsetPopular + limit
          route = 'most-popular'
        } else {
          offset = offsetfollow
          offsetfollow = offsetfollow + limit
          route = 'following'
        }

        postCount = 0
        offset = offset + limit
        route = '/' + locale + '/comment/home/' + route + '/' + offset + '/' + limit
        $.ajax({
          type: 'GET'
          , url: route
          , success: function(data){
            if (data) {
              $('#' + currentStream + ' .js-comment-container').append(data)
              $('.js-social-post').each(function(index, element){
                var $elem = $(element)
                var commentWidget = new CommentWidget({
                  el: $elem
                  , id: $elem.data('comment-id')
                  , username: $elem.data('username')
                  , container: $('.js-comment-container')
                })
              })
              $('.preloader').fadeOut()

              // needed to wrap the data in a div so that .children works
              data = '<div>' + data + '</div>'
              $(data).children($streamPostClass).each(function () {
                postCount++
              })
              if ( postCount < limit ) {
                $('#' + currentStream + ' .js-home-stream-load-more' ).hide()
              }

            }
          }
        })
      })
      this.delegateEvents = function () {
        var scope = this
        // GA Tracking
        this.$el.find('[data-track]').on('click',function () {
          var attribute = $(this).attr('data-track')
          FanbookzGATracker.Send(attribute)
        })
      }
    }
  }
}
