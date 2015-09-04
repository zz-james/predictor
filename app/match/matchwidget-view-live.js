/**
 * view component that handles the dom changes during a live match
 * @param  {jQuery object} element - the parent DOM element controlled
 * @param  {object} options object ...
 */
LiveView = function(element, options) {
  this.$el = element
  var scope=this
      ,chartsViewHelper = null // compose in the helper
      ,currentState = options.initialState
      ,model        = options.model
      ,messages     = options.messages
      ,status       = null
      ,template     = function() {
        var tmp = {
          liveUnpredicted: Hogan.compile($('.temp__prediction-status__live-unprediction').html())
        , livePredicted: Hogan.compile($('.temp__prediction-status__live-prediction').html())
        , stats: Hogan.compile($('.temp__match-widget__stats').html())
        , commentary: Hogan.compile($('.temp__match-widget__commentary').html())
        }
        if(model.user && model.user.gameType === 'rmg') {
          tmp = _.extend(tmp,{
              liveUnpredicted: Hogan.compile($('.temp__rmg-prediction-status__live-unprediction').html())
            , livePredicted: Hogan.compile($('.temp__rmg-prediction-status__live-prediction').html())
          })
        }

        return tmp
      }()
      ,$elTabPred           = options.tabPredictionElement
      ,$elTabInfo           = options.tabInfoElement
      ,commentaryListOpen   = false
      ,commentaryListHeight = undefined
      ,headerHeight        = undefined


  /* ------------------- public methods ------------------- */
  this.render = function(templateName) {
    // err all the rendering is happening in initialise....
    // I might move it...
    return this
  }

  this.tabPredictionRender = function(templateName) {
    if (!templateName) {
      return
    }
    var html = template[templateName].render(model)
    $elTabPred.html(html)
  }

  this.tabInfoRender = function(templateName, data) {
    var html = template[templateName].render(data)
    $elTabInfo.html(html)
  }

  this.initialise = function() {

    // compose in the charts helper
    chartsViewHelper = new ChartsView(scope.$el, {
      model: model
    }).initialise()

    model.setHeader('.js-match__prompt--competition')
    model.trigger('startClock')
    model.trigger('renderScore' , model.score)

    bindTabs()

    scope.tabInfoRender('stats', model.score)
    scope.$el.find('.js-match-live-tab[data-tab="js-match-live-commentary"]').trigger('click')

    // Show live badge on commentary
    scope.$el.find('.match-view__live-badge').show()

    model.on('renderLivePrediction', function renderThePredictionViewWithPotentialWinnings(score){
      model.setPotentialCoins(model.coins[score.team1.score+":"+score.team2.score])
      scope.tabPredictionRender(status)
    })

    switch(model.prediction.status) {
      case 'unpredicted' :
        status = 'liveUnpredicted'
        break
      case 'predicted' :
        status = 'livePredicted'
        var extras =
            { yourPrediction: messages.prediction.yourPrediction()
            }
          model = _.extend(model, extras)
        break
    }

    scope.tabPredictionRender(status)


    /* ------------------ model listeners ------------------ */
    model.on('renderCommentary', renderCommentary)
    model.on('renderStats' , renderStats)
    model.on('renderCharts', chartsViewHelper.renderCharts)

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
    scope.$el.on('click', '.js-match-live-commentary-list-toggle', function viewLessOrMoreComments(e){
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

  function renderStats(data) {
    scope.tabInfoRender('stats',data)
  }

  function renderCommentary(commentary) {

    if(!model.score.commentary) { return } // bail on this if no commentary

    var parsedCommentary = parseCommentary(commentary)

    var oldCommentary = model.score.commentary
    var newCommentary = parsedCommentary

    var difference = newCommentary.length - oldCommentary.length
    var newItems   = newCommentary.slice(0, difference)

    // reverse array so it's render in the correct order
    newItems.reverse()

    if(newItems.length !== 0){
      // loop through each and render
      newItems.forEach(function(comment){
        var view = template.commentary.render(comment)
        scope.$el.find('.js-match-live-commentary-list').prepend(view)
      })

      // Replace order array with new
      model.score.commentary = parsedCommentary  // setting a model property
    }

  }

  function parseCommentary(commentary) {

    if(commentary && commentary.length !== 0) {
      commentary.forEach(function (comment) {
        // Find team names in comment a wrap with <strong>
        var filterTeam1 = new RegExp(model.teams.team1.name, 'g')
        comment.comment = comment.comment.replace(filterTeam1, '<strong>' + model.teams.team1.name + '</strong>')
        var filterTeam2 = new RegExp(model.teams.team2.name, 'g')
        comment.comment = comment.comment.replace(filterTeam2, '<strong>' + model.teams.team2.name + '</strong>')

        // Find Titles in comment
        var title = new RegExp('Second Half ends,', 'g')
        comment.comment = comment.comment.replace(title, '<span class="match-view__commentary-type">Second Half ends</span>')
        var title = new RegExp('Corner,', 'g')
        comment.comment = comment.comment.replace(title, '<span class="match-view__commentary-type">Corner</span>')
        var title = new RegExp('Goal!', 'g')
        comment.comment = comment.comment.replace(title, '<span class="match-view__commentary-type">Goal!</span>')
        var title = new RegExp('Foul', 'g')
        comment.comment = comment.comment.replace(title, '<span class="match-view__commentary-type">Foul</span>')
        var title = new RegExp('Attempt missed.', 'g')
        comment.comment = comment.comment.replace(title, '<span class="match-view__commentary-type">Attempt missed</span>')
        var title = new RegExp('Attempt saved.', 'g')
        comment.comment = comment.comment.replace(title, '<span class="match-view__commentary-type">Attempt saved</span>')
        var title = new RegExp('Attempt blocked.', 'g')
        comment.comment = comment.comment.replace(title, '<span class="match-view__commentary-type">Attempt blocked</span>')
        var title = new RegExp('Substitution,', 'g')
        comment.comment = comment.comment.replace(title, '<span class="match-view__commentary-type">Substitution</span>')
        var title = new RegExp('First Half ends,', 'g')
        comment.comment = comment.comment.replace(title, '<span class="match-view__commentary-type">First Half ends</span>')
        var title = new RegExp('Second Half begins', 'g')
        comment.comment = comment.comment.replace(title, '<span class="match-view__commentary-type">Second Half begins</span>')
        var title = new RegExp('First Half begins.', 'g')
        comment.comment = comment.comment.replace(title, '<span class="match-view__commentary-type">First Half begins</span>')
        var title = new RegExp('Match ends,', 'g')
        comment.comment = comment.comment.replace(title, '<span class="match-view__commentary-type">Match ends</span>')
        var title = new RegExp('Lineups are announced', 'g')
        comment.comment = comment.comment.replace(title, '<span class="match-view__commentary-type">Lineups are announced</span>')
        var title = new RegExp('Own Goal', 'g')
        comment.comment = comment.comment.replace(title, '<span class="match-view__commentary-type">Own Goal</span>')
        var title = new RegExp('Offside,', 'g')
        comment.comment = comment.comment.replace(title, '<span class="match-view__commentary-type">Offside</span>')
        var title = new RegExp('Delay in match', 'g')
        comment.comment = comment.comment.replace(title, '<span class="match-view__commentary-type">Delay in match</span>')
        var title = new RegExp('Delay over.', 'g')
        comment.comment = comment.comment.replace(title, '<span class="match-view__commentary-type">Delay over</span>')


        // create variables
        comment.isOffside = comment.type === 'offside'
        comment.isGoal = comment.type === 'goal'
        comment.isSubstitution = comment.type === 'substitution'
        comment.isYellowCard = comment.type === 'yellow card'
        comment.isSecondYellowCard = comment.type === 'secondyellow card'
        comment.isRedCard = comment.type === 'red card'
        comment.isKickoff = comment.type === 'start'
        comment.isEndMatch = (comment.type === 'end 1'|| comment.type === 'end 2'|| comment.type === 'end 3'|| comment.type === 'end 4'|| comment.type === 'end 5'|| comment.type === 'end 14')
        comment.isHitThePost = comment.type === 'post'
        comment.isPenaltySaved = comment.type === 'penalty saved'
        comment.isPenaltyMissed = comment.type === 'penalty miss'
        comment.isPenaltyConceded = comment.type === 'penalty lost'
        comment.isOwnGoal = comment.type === 'own goal'
        comment.isMiss = comment.type === 'miss'
        comment.isDelay = comment.type === 'start delay'
        comment.isEndDelay = comment.type === 'end delay'
        comment.isShotBlocked = comment.type === 'attempt blocked'
        comment.isShotSaved = comment.type === 'attempt saved'
        comment.isCorner = comment.type === 'corner'
        comment.isPost = comment.type === 'post'
        comment.isFreeKickLost = comment.type === 'free kick lost'
        comment.isFreeKickWon = comment.type === 'free kick won'

        // Capitalise first letter of type
        comment.type = comment.type.charAt(0).toUpperCase() + comment.type.slice(1)
      })
      // Reverse order - to show latest at top
      commentary.reverse()
      return commentary
    } else {
      return []
    }

  } // end of parsecommentary method


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

