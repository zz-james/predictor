/**
 * view component that handles the dom changes full-time
 * @param  {jQuery object} element - the parent DOM element controlled
 * @param  {object} options object ...
 */
FullTimeView = function(element,options) {
  this.$el = element
  var scope = this
      ,chartsViewHelper = null // compose in the helper
      ,currentState = options.initialState
      ,model        = options.model
      ,messages     = options.messages
      ,template     = {
         unpredicted: Hogan.compile($('.temp__prediction-status__fulltime-unprediction').html())
       , correct: Hogan.compile($('.temp__prediction-status__fulltime-correct').html())
       , wrong: Hogan.compile($('.temp__prediction-status__fulltime-wrong').html())
       , stats: Hogan.compile($('.temp__match-widget__stats').html())
      }
    ,$elTabPred = options.tabPredictionElement
    ,$elTabInfo = options.tabInfoElement
    ,commentaryListOpen   = false
    ,commentaryListHeight = undefined
    ,headerHeight         = undefined

  if(model.user && model.user.gameType === 'rmg') {
    template.unpredicted = Hogan.compile($('.temp__rmg-prediction-status__fulltime-unprediction').html())
    template.fulltime_unpredicted = Hogan.compile($('.temp__rmg-prediction-status__fulltime-unprediction').html())
    template.correct = Hogan.compile($('.temp__rmg-prediction-status__fulltime-correct').html())
  }

  /* ------------------ model listeners ------------------ */

  // model.on('updateUnpredictedFullTime', livePredictionRender)

  /* ------------------- public methods ------------------- */
  this.render = function(templateName) {
    // err all the rendering is happening in initialise....
    // I might move it...
    return this
  }

  this.tabPredictionRender = function(templateName) {
    if(!templateName) { templateName = currentState }
    var html = template[templateName].render(model)
    $elTabPred.html(html)
  }

  this.tabInfoRender = function(templateName, data) {
    var html = template[templateName].render(data)
    $elTabInfo.html(html)
  }

  this.initialise = function() {
    // compose in the helper
    chartsViewHelper = new ChartsView(scope.$el, {
      model: model
    }).initialise()
    model.setHeader('.js-match__prompt--competition')

    // Show Result badge
    scope.$el.find('.match__status--result').removeClass('is--hidden')
    scope.$el.find('.match__status--live').addClass('is--hidden')

    bindTabs()
    scope.tabInfoRender('stats', model.score)

    // build status view
    switch(currentState) {
      case 'unpredicted':
        model.setPotentialCoins(model.coins[model.score.team1.score+":"+model.score.team2.score])
        scope.tabPredictionRender()
        break
      case 'correct':
        var extras ={  yourPrediction: messages.prediction.yourPrediction() }
        _.extend(model, extras)
        scope.tabPredictionRender('correct')
        break
      case 'wrong':
        var extras ={  yourPrediction: messages.prediction.yourPrediction() }
        _.extend(model, extras)
        scope.tabPredictionRender('wrong')
        break
    }

    bindUIEvents()

    return this
  }


  /* ----------------- private functions ------------------ */
  function bindTabs() {

    scope.$el.on('click', '.js-match-live-tab', function () {
      var $elem = $(this)
        , tab = $elem.data('tab')

      // hide current tab
      scope.$el.find('.match-view__live__tab.is-visible').removeClass('is-visible')

      // show current tab
      scope.$el.find('.' + tab).addClass('is-visible')
    })

  }

  function bindUIEvents() {

    scope.$el.find('.js-match-view__live__commentary__toggle--less').hide()
    scope.$el.on('click', '.js-match-live-commentary-list-toggle', function (e){
      e.preventDefault()
      if(commentaryListOpen){
          commentaryListContract()
          scope.$el.find('.js-match-view__live__commentary__toggle--more').show()
          scope.$el.find('.js-match-view__live__commentary__toggle--less').hide()
      } else {
          commentaryScrollToTop()
          commentaryListExpand()
          scope.$el.find('.js-match-view__live__commentary__toggle--more').hide()
          scope.$el.find('.js-match-view__live__commentary__toggle--less').show()
      }
      commentaryListOpen = !commentaryListOpen
    })

    scope.$el.on('click', '.js-match-live-tab--commentary', function (e) {
      if($(window).width() < 768){
        var commentaryTabTopNew = $(e.currentTarget).offset().top - 10
        $('html, body').animate({
          scrollTop: (commentaryTabTopNew - headerHeight) + 'px'
        }, 200)
      }
    })

    if (typeof commentaryListHeight === 'undefined') {
      commentaryListHeight = scope.$el.find('.js-match-live-commentary-list').outerHeight()
    }

    if (typeof headerHeight === 'undefined') {
      headerHeight = $('.js-header').outerHeight()
    }

  }

  function renderUpcoming() {

  }

  function renderStats(data) {
    scope.tabInfoRender('stats',data)
  }

  function commentaryListExpand() {
    var commentaryListHeightNew = $(window).height() - headerHeight - scope.$el.find('.js-match-live-commentary-list-toggle').outerHeight() - 40
    scope.$el.find('.js-match-live-commentary-list').animate({
      height: commentaryListHeightNew + 'px'
    }, 200)
  }

  function commentaryListContract() {
    scope.$el.find('.js-match-live-commentary-list').animate({
      height: commentaryListHeight + 'px'
    }, 200)
  }

  function commentaryScrollToTop() {
    var commentaryListTopNew = scope.$el.find('.js-match-live-commentary-list').offset().top - headerHeight - 10
    $('html, body').animate({
      scrollTop: commentaryListTopNew + 'px'
    }, 200)
  }


  return this
}
















