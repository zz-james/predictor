/* jshint unused: false */
var SidekickSlider = function(userOptions){

  ;(function (scope) {

    // Private functions
    setupSidekick = function(){

      $('.js-fixtures-sidekick').hide()
      $('.js-fixtures-sidekick-current-form').hide()
      $('.js-fixtures-sidekick-current-form').appendTo('.fixture__predict__current__form')

      $('.js-fixtures-sidekick-tab').on('click',function(e){
        e.preventDefault()
        $(this).parents().find('.js-fixtures-sidekick').show()
        $(this).parents().find('.js-fixtures-sidekick-current-form').show()
        $(this).parents().find('.js-results-sidekick').hide()
      })

      $('.js-results-sidekick-tab').on('click',function(e){
        e.preventDefault()
        $(this).parents().find('.js-fixtures-sidekick').hide()
        $(this).parents().find('.js-fixtures-sidekick-current-form').hide()
        $(this).parents().find('.js-results-sidekick').show()
      })

      $('.js-preloader--sidekick').hide()
      $('.js-preloader--sidekick--desktop').hide()
      $('.js-sidekick').removeClass('sidekick-holder--loading')
      $('.js-sidekick-toggle--home').show()
      $('.js-sidekick-toggle--desktop--team').show()

      if(scope.$elem.length){

        // Custom scrolling bars for sidekick
        addSidekickScrollbars = function() {
          var pane = scope.$elem.find('.sidekick__panel__content--scrollable,.sidekick__panel--comments__comment')
            , callbacksObj = {}

          if($('.sidekick--team').length) {
            callbacksObj.whileScrolling = function() {
              var scrollbarClubPosition = this.mcs.top * -1

              var $elem = $('.users-club-sticky')
              ,   $window = $('.club__standings__table')
              ,   tableTop = $('.club__standings__sidekick').offset().top
              ,   elemTop = $elem.offset().top
              ,   elemTop2 = parseInt(elemTop) - parseInt(tableTop) - $window.height()

              if (scrollbarClubPosition < elemTop2) {
                $('.club__sidekick__users__team').show()
              }
              else {
                $('.club__sidekick__users__team').hide()
              }
            }
          }

          pane.mCustomScrollbar({
            alwaysShowScrollbar: 2,
            scrollInertia: 0,
            mouseWheel: {
              scrollAmount: 25
            },
            advanced:{
              updateOnContentResize: true,
              updateOnSelectorChange: '.results__sidekick tr td',
              updateOnBrowserResize: true
            },
            callbacks: callbacksObj
          })
        }

        // Sidekick tabs
        // Can't use Bootstrap tabs as they don't work inside Owl Carousel slides.
        // Edit: Seems that hiding/showing IDs was the cause of them not working, since Owl duplicates the slide DOM elements. Using classes as the target fixes this.
        scope.$elem.find('a[data-toggle="sidekick-tab"]').on('click', function(e){
          e.preventDefault()

          $(this).parent().siblings().removeClass('active')
          $(this).parent().addClass('active')

          var linkedElem = $(this).data('target')
            , linkedElemTabGroup = $(this).data('tab-group')

          scope.$elem.find(".sidekick__panel__content[data-tab-group='" + linkedElemTabGroup + "']").hide()
          $(linkedElem).show()

        })


        // 'Following' button

        scope.$elem.find('.js-sidekick__hover__btn--follow').on('click', function(e){
          e.preventDefault()
          $(this).find('.sidekick__hover__btn__follow').hide()
          $(this).find('.sidekick__hover__btn__following').show()

          // @TODO: Add followers AJAX
          var userID = $(this).data('user-id')

        })


        // Setup CommentWidgets

        scope.$elem.find('.js-sidekick-post').each(function(index, element){
          var $elem = $(element)
          var commentWidget = new CommentWidget({
            el: $elem
            , id: $elem.data('comment-id')
            , username: $elem.data('username')
            , container: scope.$elem.find('.js-comment-container')
          })
        })


        var device = Fanbookz.getDeviceSize()

        if(device == "mobile"){
          // --- Mobile-specific functions ---

          scope.$elem.slideDown(400, function(){

            // Sidekick carousels
            var sidekickCommentListOwl = scope.$elem.find('.js-sidekick-comment-list').owlCarousel({
              items: 1
              , touchDrag: true
              , margin: 0
              , nav: true
              , navText: ['<span class="fb-icon-chevron-left"></span>','<span class="fb-icon-chevron-right"></span>']
            })

            sidekickCommentListOwl.on('translate.owl.carousel', function(event) {
              var items     = event.item.count     // Number of items
                , item      = event.item.index     // Position of the current item
                , countText = (item+1) + " / " + items
            })

            // Function which updates the slide counter (used for the Squad tab on mobile)
            changeSidekickCounter = function(event){
              var sliderCount = event.item.count    // Number of items
                , sliderIndex = event.item.index     // Position of the current item

              $('.js-sidekick__counter__current').text(sliderIndex+1)
              $('.js-sidekick__counter__total').text(sliderCount)
            }

            // Sidekick carousels - for tabbed sidekicks, eg team page
            scope.$elem.on('initialized.owl.carousel changed.owl.carousel', function(event) {

              console.log(scope.$elem)

              if(scope.$elem.hasClass('js-sidekick__inner-with-counter')){
                changeSidekickCounter(event)
              }

            }).owlCarousel({
              items: 1
              , touchDrag: true
              , margin: 0
              , nav: false
              , dots: true
              , navText: ['<span class="fb-icon-chevron-left"></span>','<span class="fb-icon-chevron-right"></span>']
            })

            // Sidekick accordions for long content

            scope.$elem.find('.js-sidekick__panel__content__view-more').on('click', function(e){
              e.preventDefault()
              $(this).closest('.sidekick__panel__content--scrollable').toggleClass('sidekick__panel__content--scrollable--open')
              $(this).find('.sidekick__panel__content__view-more__more').toggle()
              $(this).find('.sidekick__panel__content__view-more__less').toggle()
            })

            // Since the page height its changing, update the sticky menu snapping position
            FANBOOKZ.home.getStickyTabMenuInitialPosition()

          })

          //if(userOptions.sidekickTab == "stats") {
            //addSidekickScrollbars()
          //}

        } else {

          // --- Tablet & Desktop specific functions ---

          addSidekickScrollbars()

          // Check for the cookie on load
          if (!Cookies.enabled || Cookies.get('sidekick-closed') != 'true') {
            // Sidekick is open
            //$('.sidekick .sidekick__inner').slideDown()
            //$('.sidekick').removeClass('sidekick--open')
            //scope.$elem.parents('.sidekick').addClass('sidekick--open')
            sidekickIsOpen = true

          } else {
            // Sidekick is closed
            $('.js-preloader--sidekick').hide()
            //$('.sidekick').hide()
            //var $elemSpan = $('.js-sidekick-toggle').find('span.glyphicon')
            //$elemSpan.removeClass('glyphicon-minus').addClass('glyphicon-plus')
          }


          //$('.sidekick').removeClass('sidekick--open')
          //scope.$elem.parents('.sidekick').addClass('sidekick--open')


          // Sidekick carousel functions - Desktop-specific - fired once sidekick is loaded

          if (!Cookies.enabled || Cookies.get('sidekick-closed') != 'true') {
            // Sidekick is open
            scope.$elem.slideDown()
          } else {
            // Sidekick is closed
          }



          // Work out how many slides to show on each scroll
          if(userOptions.sidekickPage == "team"){
            if(userOptions.sidekickTab == "feed"){

              if($(window).width() < 992){
                slidesToShowVar = 3
                slidesToScrollVar = 3
              } else {
                slidesToShowVar = 6
                slidesToScrollVar = 1
              }

            } else if(userOptions.sidekickTab == "news"){
              slidesToShowVar = 4
              slidesToScrollVar = 1

            } else if(userOptions.sidekickTab == "stats"){

              if($(window).width() < 992){
                slidesToShowVar = 2
                slidesToScrollVar = 2
              } else {
                slidesToShowVar = 6
                slidesToScrollVar = 1
              }

            } else if(userOptions.sidekickTab == "squad"){

              if($(window).width() < 992){
                slidesToShowVar = 4
                slidesToScrollVar = 4
              } else if($(window).width() < 1200){
                slidesToShowVar = 5
                slidesToScrollVar = 5
              } else {
                slidesToShowVar = 6
                slidesToScrollVar = 6
              }
            } else {
              slidesToShowVar = 4
              slidesToScrollVar = 1
            }
          } else {
            // Home slides
            slidesToShowVar = 1
            slidesToScrollVar = 1
          }

          //console.log(slidesToShowVar)

          var sidekickSlick = scope.$elem

          // Only initialize the slider if we have panels to animate
          if( sidekickSlick.find('.sidekick__panel__holder, .sidekick__panel__group').length){

            $(sidekickSlick).slick({
              infinite: true,
              slidesToShow: slidesToShowVar,
              slidesToScroll: slidesToScrollVar,
              variableWidth: true,
              speed: 400,
              cssEase: 'cubic-bezier(0.230, 1.000, 0.320, 1.000)',
              draggable: false,
              prevArrow: '<div class="slick-nav--left"><span class="slick-nav-arrows fb-icon-chevron-left"></span></div>',
              nextArrow: '<div class="slick-nav--right"><span class="slick-nav-arrows fb-icon-chevron-right"></span></div>'
            })

            // Sidekick link commenter lists to show the comments

            scope.$elem.find('.slick-nav--left, .slick-nav--right').wrapAll('<div class="slick-nav"></div>');
            //scope.$elem.find('.slick-nav').appendTo('.sidekick')

            scope.$elem.find('.slick-list').addClass('container')

            scope.$elem.find('.js-sidekick-linked-comment-title').on('click', function(e){
              e.preventDefault()

              $(this).siblings().removeClass('active')
              $(this).addClass('active')

              var linkedElem = $(this).data('linked-elem')
                , commentID = $(this).data('comment-id')

              $(linkedElem).hide()
              $(linkedElem + "[data-comment-id='" + commentID + "']").show()

            })

            $('.sidekick__panel__holder').on('afterChange', function(){
              addSidekickScrollbars()
            });


            scope.$elem.find('.sidekick__panel--comments__comment').each(function() {
              if ($(this).find('.sidekick__panel--comments__comment__text').height() <= 52 && $(this).find('h3').length == 0) {
                $(this).find('.sidekick__panel--comments__comment__text__quote-icon').hide()
              }
            })

          }

          if(device == "tablet"){
            // Since the page height its changing, update the sticky menu snapping position
            FANBOOKZ.home.getStickyTabMenuInitialPosition()
          }
        }
        // End tablet & desktop functions

      }

    }

  })(this)

  // Public Variables
  this.setOptions = function(userOptions) {
    userOptions = $.extend(this.options, userOptions)
  }

  // Initialise widget
  this.init = function (data) {
    this.$elem = userOptions.el
    this.sidekickPage = userOptions.sidekickPage
    setupSidekick()
  }

  // Start widget
  this.setOptions(userOptions)
  this.init()
}