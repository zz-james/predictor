/* jshint unused: false */
var FanbookzCookie = (function($) {

  // Module object to be returned
  var module =
    {}

  /**
   * Initialise
   */
  module.init = function() {
    // If cookies are enabled and we don't already have the cookie set
    if (Cookies.enabled && (!Cookies.get('notice-accepted', 'true') || Cookies.get('notice-accepted', 'true') === undefined) ) {

      // Show the popup
      $('.js-cookie-popup').addClass('hidden-xs visible-sm-block visible-md-block visible-lg-block').removeClass('hidden')
      $('body').addClass('cookie-popup-visible')

      var cookiePopupHeight = $('.js-cookie-popup').outerHeight()
      cookiePopupStatus = "open"

      $('.js-header').css('top', cookiePopupHeight + "px")

      if($('body').hasClass('bg--signup') && ($(window).width() > 767)) {
        var pagesectionHeightNew =  ($(window).height() - cookiePopupHeight) + "px"
        $('.bg--signup .pagesection').css('height', pagesectionHeightNew)
      }

      // Set the cookie
      Cookies.set('notice-accepted', 'true')

      // If we have the nav header bar, we need to shift the content down by the height of the cookie bar
      if($('.js-header').length){
        // Grab the current top padding for the .page element
        var sectionPagePaddingTopDefault = $('section.page').css('padding-top')
        // And without 'px'
        var sectionPagePaddingTopDefaultInt = parseInt(sectionPagePaddingTopDefault)
        // Set the new top padding to include the height of the popup
        var sectionPagePaddingTopPopup = (sectionPagePaddingTopDefaultInt + cookiePopupHeight) + "px"
        $('section.page').css('padding-top', sectionPagePaddingTopPopup)
      }

      // Close button action
      $('.js-cookie-popup-close').on('click', function (e) {
        e.preventDefault()
        $('.js-cookie-popup').slideUp().removeClass('visible-sm-block visible-md-block visible-lg-block')
        $('body').removeClass('cookie-popup-visible')
        cookiePopupStatus = "closed"

        // At the same time as the slideUp, slide animate the header top position back to 0
        $(".js-header").animate({
          top: 0
        }, {
          duration: 400,
          complete: function() {
            $('body').removeClass('cookie-popup-visible')
          }
        })
        // At the same time, reset the top padding for .page back to the original value
        $('section.page').animate({
          'padding-top': sectionPagePaddingTopDefault
        }, {
          duration: 400
        })

      })

      $(window).scroll(function() {
        // If we have a nav header (ie not the splash page), move it up over the cookie popup as we scroll
        if($('.js-header').length && cookiePopupStatus == "open"){
          scrollCookiePopup()
        }
      })

      function scrollCookiePopup(){
        var currentHeaderTop = parseInt($('.js-header').css('top'))

        // Case for if the user scrolls really fast resulting in a negative top value
        if(currentHeaderTop < 0){
          $('.js-header').css('top', 0)
        } else if($(window).scrollTop() <= cookiePopupHeight || currentHeaderTop > 0){
          var headerTopPositionNew = (cookiePopupHeight - $(window).scrollTop()) + "px"
          $('.js-header').css('top', headerTopPositionNew)
        }
      }

    }
  }

  return module

})(window.jQuery)
