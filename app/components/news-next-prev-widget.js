/* jshint unused: false */
var FanbookzNewsNextPrevWidget = (function($) {

  // Module object to be returned
  var module = {}

  /**
   * Initialise
   */
  module.init = function() {
    var $newsWidget = $('.js-news-single__next-prev')

    if($newsWidget.length){

      var sticky_height = parseInt($newsWidget.css('height'), 10)
        , $article = $('.js-news-single__content__article')
        , $breakingNews = $('.js-breaking__news')

      var newsWidgetShow = function() {
        if( !$newsWidget.hasClass('js-news-single__next-prev--hidden') ){
          var scrollBottom = $(window).scrollTop() + $(window).height()  // our current vertical position of the bottom of the window from the top
            , articleTop = $article.offset().top
            , breakingNewsTop = $breakingNews.offset().top
            , popupStart = 50  // Percentage of article height to start showing the popup

          if( scrollBottom > ( articleTop + ( $article.height() * (popupStart/100) ) )
              && scrollBottom < ( breakingNewsTop )
            ){
            $newsWidget.fadeIn()
          } else {
            $newsWidget.fadeOut()
          }
        }
      }

      // run our function on load
      newsWidgetShow()

      // and every time we resize the window
      $(window).resize(function() {
        newsWidgetShow()
      })

      // and every time you scroll
      $(window).scroll(function() {
        newsWidgetShow()
      })

      // Close button action
      $('.js-news-single__next-prev__close').on('click', function(){
        $newsWidget.addClass('js-news-single__next-prev--hidden')
        $newsWidget.hide()
      })

    }

  }

  return module

})(window.jQuery)
