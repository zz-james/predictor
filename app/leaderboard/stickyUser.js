var StickyUser = function (userOptions) {
  var replicateUserElem
    , fixElem
    , unfixElem
    , originalBelowClone
    , leaderBoardIsVisible

  ;(function (scope) {
    replicateUserElem = function () {
      // Get html of user element
      scope.$userClone = scope.$elem.clone()
      // Append duplicate of user element to leader board
      scope.$userClone.addClass('leader__user--own-user--clone').appendTo(scope.$leaderboard)
    }
    fixElem = function (elemWidth, animate) {
      if(animate){
        scope.$userClone
          .addClass('is-animate')
      }else {
        scope.$userClone
          .removeClass('is-animate')
      }
      scope.$userClone
        .addClass('is-visible')
        .css('width', elemWidth)
    }
    unfixElem = function (elemWidth) {
      scope.$userClone
        .removeClass('is-visible')
        .css('width', elemWidth)
    }
    // Visual tests
    originalBelowClone = function () {
      var originalFromTop = scope.$elem.position().top
        , cloneFromTop = $(window).scrollTop() + $(window).height() - scope.$userClone.outerHeight(true) - 56

      return cloneFromTop < originalFromTop
    }
    leaderBoardIsVisible = function () {
      var windowDistanceFromTop = $(window).scrollTop()
        , bottomBelowTop = windowDistanceFromTop < (scope.$leaderboard.position().top + scope.$leaderboard.outerHeight(true))
        , windowScreenBottomDistance = windowDistanceFromTop + $(window).height()
        , heightOfTwoRanks = scope.$elem.outerHeight(true) * 2
        , aboveBottom = windowScreenBottomDistance > (scope.$leaderboard.offset().top + heightOfTwoRanks)

      return bottomBelowTop && aboveBottom
    }
  })(this)

  this.bindEvents = function () {
    var scope = this
      , lastScrollTop = 0

    $(document).on('scroll', function (event) {
      var elemWidth = scope.$elem.outerWidth()
        , scrollTop = $(this).scrollTop()
        , shouldFadeIn = (scrollTop > lastScrollTop) ? true : false
        , shouldBeFixed = leaderBoardIsVisible() && originalBelowClone()

      // update last scroll top with current scroll top
      lastScrollTop = scrollTop

      if(shouldBeFixed && !scope.$userClone.hasClass('is-visible')){
        fixElem(elemWidth, shouldFadeIn)
      } else if (!shouldBeFixed) {
        unfixElem(elemWidth)
      }
    })
  }
  // Public Variables
  this.setOptions = function(userOptions) {
    userOptions = $.extend(this.options, userOptions)
  }
  this.init = function() {
    this.$elem = userOptions.el
    this.$leaderboard = this.$elem.parent('.leaderboard-list')
    replicateUserElem()
    this.bindEvents()
  }
  this.setOptions(userOptions)
  this.init()
}
