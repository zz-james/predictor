/* jshint unused: false */
var FanbookzBreakingNews = (function($) {

  // Module object to be returned
  var module =
    {}

  /**
   * Initialise
   */
  module.init = function() {
    var $breakingNews = $('.js-breaking-news')
      , tempHero = Hogan.compile($('.temp_news_hero').html())

    $breakingNews.owlCarousel({
      loop: true
    , margin: 15
    , nav: true
    , navText: ["<span class='fb-icon-chevron-left'></span>","<span class='fb-icon-chevron-right'></span>"]
    , responsive : {
      0 : {
          items:2
          , nav: false
      }
      , 480 : {
        items:3
      }
      , 768 : {
        items:4
      }
    }
    , startPosition: 1
    })

    $('.owl-prev').on('click', function(event) {
        var $currentElem = $('div.owl-carousel.js-breaking-news.owl-loaded').find('.active').prev().prev().find('.breaking-news').eq(0)
          , viewData =
              { heroImage: $currentElem.data('hero')
              , permalink: $currentElem.data('permalink')
              , title: $currentElem.data('title')
              , copy: $currentElem.data('copy')
              }
          , temp = tempHero.render(viewData)

        $('.js-news-hero').html(temp)
    })

    $('.owl-next').on('click', function(event) {
        var $currentElem = $('div.owl-carousel.js-breaking-news.owl-loaded').find('.active').find('.breaking-news').eq(0)
          , viewData =
              { heroImage: $currentElem.data('hero')
              , permalink: $currentElem.data('permalink')
              , title: $currentElem.data('title')
              , copy: $currentElem.data('copy')
              }
          , temp = tempHero.render(viewData)

        $('.js-news-hero').html(temp)
    })
  }

  return module

})(window.jQuery)
