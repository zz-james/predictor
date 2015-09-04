// reference copy!
//==============================================================================
// modal iframe plugin in rmg uses this passAccessToken to act as a pipe
// between the iframe and the match widget
// to set up with callback call window.passAccessToken(null,callback)
//==============================================================================

window.passAccessToken = function(token, callback){
    console.log('working window.passAccessToken '+token+" ");
    if(callback && !token) {
      this.callback = callback;
    }
    if(this.callback && token) {
      this.callback(token);
      return
    }
    if(token && !this.callback) {
      console.log('token was passed but callback not registered')
    }
}

/* jshint unused: false */
function MatchWidget(userOptions, data) {
  // Private Variables
  var template  // we set the template variable using loadTemplate method - can't call it here as doesn't exist yet we call it at the bottom of the script
  , matchUpdateSpeed =
      { upcoming: 10000
      , live: 10000
      }
  , state = {}
  , endPoints = {
     sendToken            :{ url:'/api/fsb/access-token',    method: 'POST' }
    ,gameTypeRmg          :{ url:'/api/fsb/game-type/rmg',   method: 'POST' }
    ,gameTypeCoins        :{ url:'/api/fsb/game-type/coins', method: 'POST' }
    ,getBalanceFromCache  :{ url:'/api/fsb/get-balance',     method: 'GET'  }
    ,updateAndGetBalanceFromFSB :{ url:'/api/fsb/update-balance',  method: 'POST' }
    ,submitBet            :{ url:'/api/fsb/make-bet',        method: 'POST' }
  }


  // Messages
  var messages =
    { prediction:
      { yourPrediction: function () {
          // To Win
          if(data.prediction.outcome === 'team1'){
            if(data.prediction.team1 !== undefined  &&  data.prediction.team1 !== null){
              return template.predictionStatus.messageOutcomeHomeWinScore.render(data)
            } else {
              return template.predictionStatus.messageOutcomeHomeWin.render(data)
            }
          }
          if(data.prediction.outcome === 'team2'){
            if(data.prediction.team1 !== undefined  &&  data.prediction.team1 !== null){
              return template.predictionStatus.messageOutcomeAwayWinScore.render(data)
            } else {
              return template.predictionStatus.messageOutcomeAwayWin.render(data)
            }
          }
          // To draw
          if(data.prediction.outcome === 'draw'){
            if(data.prediction.team1 !== undefined  &&  data.prediction.team1 !== null){
              return template.predictionStatus.messageOutcomeDrawScore.render(data)
            } else {
              return template.predictionStatus.messageOutcomeDraw.render(data)
            }
          }
        }
      }
    }

  // Public Variables
  this.setOptions = function(userOptions) {
    userOptions = $.extend(this.options, userOptions)
  }
  this.data = data


  if(this.data.user && this.data.user.gameType === 'rmg') {
    this.data.prediction.stake = (0.5).toFixed(2)  // if dealing with real money initial stake is 50p - currently hardcoded in
  }

  // Array of matchIds that we have skipped
  this.skippedMatchIds = []

  // Private Functions
  var initState
    , getMatchUpdateSpeed
    , calculateCountdown
    , updateCountdown
    , calculatePercentages
    , calculatePercentage
    , calculateCrowdPercentages
    , calculateCoins
    , fzc_calculateCoins
    , rmg_calculateCoins
    , calculateScoreCoins
    , createTeamNameClass
    , createTeamNameClasses
    , changeHeader
    , isUpcoming
    , isLive
    , isFullTime
    , isPostponed
    , buildView
    , renderFanzone
    , renderLess30Secs
    , renderUpcoming
    , renderLive
    , renderStats
    , bindTabs
    , renderFulltime
    , renderLogin
    , renderNoCoins
    , parseCommentary
    , increaseScore
    , decreaseScore
    , updateScores
    , disableScoreButtons
    , submitPrediction
    , incrementCurrentPredictions
    , getMatchData
    , readAndSetIFrameURLFromDOM
    , renderCommentary
    , renderScore
    , renderGoals
    , predictionCorrect
    , startClock
    , updateMatchClock
    , commentaryScrollToTop
    , commentaryListExpand
    , commentaryListContract
    , drawMatchCharts

    , afterSubmitMPU
    , renderNextMatch
    , fetchNextMatch
    , loadTemplates
    , changeStake
    , matchWidgetPost
    , turnRmgOn
    , getBalanceFromCache
    , updateAndGetBalanceFromFSB
    , bindDepositMoneyButtonEvent

  ;(function (scope, data) {

    initState = function () {
      state =
        { hasCountdownRunning: false
        , hasClockRunning: false
        , commentaryListOpen: false
        , headerHeight: undefined
        , commentaryListHeight: undefined
        }
    }
    getMatchUpdateSpeed = function () {
      if (isLive(data.matchStatus)) {
        return matchUpdateSpeed.live
      } else if (isUpcoming(data.matchStatus)) {
        return matchUpdateSpeed.upcoming
      }
    }
    calculateCountdown = function () {
      var currentDate = Date.now()
        , matchDate = new Date(data.kickOff).getTime()
        , countdown = matchDate - currentDate
        , oneDay = 24 * 60 * 60 * 1000
        , oneHour = 60 * 60 * 1000
        , oneMinute = 60 * 1000
        // , dateIsInFuture = currentDate.getTime()
        , days = Math.floor(Math.abs((countdown)/(oneDay)))
        , hours = Math.abs((countdown)/(oneHour)) / 24.0
        , minutes = Math.abs((countdown)/(oneMinute)) / 60.0
        , secs = Math.abs((countdown)/1000) / 60.0

      if(new Date(currentDate).getTime() > matchDate){
        data.countdown =
        { days: 0
        , hrs: 0
        , mins: 0
        , secs: 0
        }
      } else {
        data.countdown =
        { days: days
        , hrs: Math.floor((hours - Math.floor(hours) ) * 24.0)
        , mins: Math.floor((minutes - Math.floor(minutes) ) * 60.0)
        , secs: Math.floor((secs - Math.floor(secs) ) * 60.0)
        }
      }

      // If 30 seconds before kickoff
      if(new Date(currentDate).getTime() + (30*1000) > matchDate){
        renderLess30Secs()
      }
    }
    // update countdown functionality
    updateCountdown = function () {
      calculateCountdown()
      scope.$el.find('.js-match-countdown__days').text(data.countdown.days)
      scope.$el.find('.js-match-countdown__hrs').text(data.countdown.hrs)
      scope.$el.find('.js-match-countdown__mins').text(data.countdown.mins)
      scope.$el.find('.js-match-countdown__secs').text(data.countdown.secs)
      if(!state.hasCountdownRunning){
        state.hasCountdownRunning = true
        setTimeout(function () {
          state.hasCountdownRunning = false
          updateCountdown()
        }, 1000)
      }
    }
    calculatePercentages = function () {
      // calculate percentage of predicted outcomes
      var totalPredictions =
            data.currentPredictions.team1 +
            data.currentPredictions.team2 +
            data.currentPredictions.draw
        , team1Percentage =
            calculatePercentage(
              data.currentPredictions.team1, totalPredictions)
        , team2Percentage =
            calculatePercentage(
              data.currentPredictions.team2, totalPredictions)
        , drawPercentage =
            calculatePercentage(
              data.currentPredictions.draw, totalPredictions)

      data.currentPredictions.team1PercentagePretty = _.isNaN(team1Percentage) ? 33 : team1Percentage.toFixed(0)
      data.currentPredictions.team2PercentagePretty = _.isNaN(team2Percentage) ? 33 : team2Percentage.toFixed(0)
      data.currentPredictions.drawPercentagePretty = _.isNaN(drawPercentage) ? 33 : drawPercentage.toFixed(0)

      data.currentPredictions.team1Is100 = (team1Percentage == 100)
      data.currentPredictions.team2Is100 = (team2Percentage == 100)
      data.currentPredictions.drawIs100 = (drawPercentage == 100)

      data.currentPredictions.team1IsZero = (team1Percentage == 0)
      data.currentPredictions.team2IsZero = (team2Percentage == 0)
      data.currentPredictions.drawIsZero = (drawPercentage == 0)

      data.currentPredictions.team1Percentage = _.isNaN(team1Percentage) ? 33.33 : team1Percentage
      data.currentPredictions.team2Percentage = _.isNaN(team2Percentage) ? 33.33 : team2Percentage
      data.currentPredictions.drawPercentage = _.isNaN(drawPercentage) ? 33.33 : drawPercentage
    }
    calculatePercentage = function (number, total) {
      var percentage = 100 * (parseFloat(number, 10) / parseFloat(total, 10))
      return percentage
    }
    calculateCrowdPercentages = function () {
      var totalCrowd = data.currentPredictions.team1 + data.currentPredictions.team2
        , overlap = 10
        , team1Percentage = calculatePercentage(data.currentPredictions.team1, totalCrowd)
        , team2Percentage = calculatePercentage(data.currentPredictions.team2, totalCrowd)
        , crowdPercentages =
          { crowdPercentageTeam1: parseFloat(team1Percentage) + overlap
          , crowdPercentageTeam2: parseFloat(team2Percentage) + overlap
          // , crowdLeader: ( team1Percentage > team2Percentage ? 'team1-ahead' : 'team2-ahead')
          }

      return crowdPercentages
    }
    /*
    * Function loops through odds and calculates coins for each outcome
    * there's a different one if you are using rmg
    */
    fzc_calculateCoins = function () {
      for (var score in data.odds) {
        var quote = data.odds[score].odds
        data.coins[score] = Math.round(quote * scope.data.prediction.stake)
      }
      return
    }

    // real money gambling version
    rmg_calculateCoins = function () {
      for (var score in data.odds) {
        var quote = data.odds[score].odds
        data.coins[score] = (quote * scope.data.prediction.stake).toFixed(2)
      }
      return
    }

    // the code that switches for real money gambling or fanbookz coins
    calculateCoins = data.user && data.user.gameType === 'rmg' ? rmg_calculateCoins : fzc_calculateCoins

    calculateScoreCoins = function (team1Score, team2Score) {
      return data.coins[team1Score+':'+team2Score]
    }
    createTeamNameClass = function (teamName) {
      if(teamName.length > 12 && teamName.length < 20){
        return 'small'
      } else if(teamName.length >= 20){
        return 'smaller'
      } else {
        return ''
      }
    }
    createTeamNameClasses = function () {
      scope.$el.find('.match__team__name__1').addClass(createTeamNameClass(data.teams.team1.name))
      scope.$el.find('.match__team__name__2').addClass(createTeamNameClass(data.teams.team2.name))
    }
    changeHeader = function ($elem) {
      scope.$el.find('.match__prompt h2').addClass('is--hidden')
      if($elem){
        $elem.removeClass('is--hidden')
      }
    }
    isUpcoming = function (matchStatus) {
      return matchStatus === 'PreMatch'
    }
    isLive = function (matchStatus) {
      var liveStatuses =
        [ 'FirstHalf'
        , 'HalfTime'
        , 'Halftime'
        , 'SecondHalf'
        , 'ExtraFirstHalf'
        , 'ExtraSecondHalf'
        , 'ExtraHalfTime'
        , 'ShootOut']
      return liveStatuses.indexOf(matchStatus) > -1
    }
    isFullTime = function (matchStatus) {
      return matchStatus === 'FullTime'
    }
    isPostponed = function (matchStatus) {
      return matchStatus === 'Postponed'
    }
    buildView = function () {
      // Build match status view
      if (isUpcoming(data.matchStatus)) {
        renderUpcoming()
      }
      if (isLive(data.matchStatus)) {
        renderLive()
      }
      if (isFullTime(data.matchStatus)) {
        renderFulltime()
      }
      if(isPostponed(data.matchStatus)){
        var view = template.matchStatus.postponed.render(data)
        scope.$el.find('.js-match-widget__match-status').html(view)
        var view = template.predictionStatus.postponed.render(data)
        scope.$el.find('.js-match-widget__prediction-status').html(view)
      }
      scope.delegateEvents()
    }
    // Render functions
    renderFanzone = function () {
      var crowdPercentages = calculateCrowdPercentages()
        , viewData = _.clone(data)
        , extendedData = _.extend(viewData, crowdPercentages)
        , temp = template.fanzone.render(extendedData)

      if(isUpcoming(data.matchStatus)){
        scope.$el.find('.js-match-widget__fanzone').html(temp)
      }
    }
    renderLess30Secs = function (){
      if(data.widgetFormat === 'mpu') { return } // bail on this if in mpu mode
      // Build prediction status view
      switch(data.prediction.status) {
        case 'unpredicted':
          var view = template.predictionStatus.liveUnpredicted.render(data)
          // This template is also used in the live prediction above
          scope.$el.find('.js-match-widget__prediction-status').html(view)
          break
        case 'predicted':
          var extras =
            { yourPrediction: messages.prediction.yourPrediction()
            }
            , dataClone = _.clone(data)
            , viewData = _.extend(dataClone, extras)
            , view = template.predictionStatus.livePredicted.render(viewData)
          // This template is also used in the live prediction above
          scope.$el.find('.js-match-widget__prediction-status').html(view)
          break
      }
    }
    precise_round = function (num,decimals) {
        var sign = num >= 0 ? 1 : -1;
        return (Math.round((num*Math.pow(10,decimals))+(sign*0.001))/Math.pow(10,decimals)).toFixed(decimals);
    }
    renderUpcoming = function () {
      // Hide Live/result badge
      scope.$el.find('.match__status--result').addClass('is--hidden')
      scope.$el.find('.match__status--live').addClass('is--hidden')
      if(!data.predictable) {
        var view = template.matchStatus.upcoming.render(data)
        scope.$el.find('.js-match-widget__match-status').html(view)
        var view = template.predictionStatus.unpredictable.render(data)
        scope.$el.find('.js-match-widget__prediction-status').html(view)
        updateCountdown()
      } else if(data.prediction.status === 'predicted-outcome') {
        var view = template.matchStatus.score.render(data)
        scope.$el.find('.js-match-widget__match-status').html(view)
        updateCountdown()
        if (data.coins[scope.data.prediction.team1+':'+scope.data.prediction.team2] != undefined) {
          scope.data.prediction.winnings = calculateScoreCoins(scope.data.prediction.team1, scope.data.prediction.team2)
        }
        var view = template.predictionStatus.upcomingOutcomePredicted.render(data)
        scope.$el.find('.js-match-widget__prediction-status').html(view)
        disableScoreButtons()
        changeHeader(scope.$el.find('.js-match__prompt--predict-score'))
      } else {
        var view = template.matchStatus.upcoming.render(data)
        scope.$el.find('.js-match-widget__match-status').html(view)
        updateCountdown()

        if(!data.userId){
          if(isUpcoming(data.matchStatus)){
            changeHeader(scope.$el.find('.js-match__prompt--initial'))
          } else {
            changeHeader(scope.$el.find('.js-match__prompt--competition'))
          }
          renderLogin()
        } else if (data.user.gameType==='coins' && data.user.balance == 0) {
          renderNoCoins()
        } else {
          // Build prediction status view
          switch(data.prediction.status) {
            case 'unpredicted':
              if (data.coins.team1 > 0) {
                var view = template.predictionStatus.upcomingUnpredicted.render(data)
                scope.$el.find('.js-match-widget__prediction-status').html(view)
                controlRmgPopUps()
              } else{
                var view = template.matchStatus.upcoming.render(data)
                scope.$el.find('.js-match-widget__match-status').html(view)
                var view = template.predictionStatus.noOdds.render(data)
                scope.$el.find('.js-match-widget__prediction-status').html(view)
                updateCountdown()
              }
              changeHeader(scope.$el.find('.js-match__prompt--initial'))
              break
            case 'predicted':
              var extras =
                  { yourPrediction: messages.prediction.yourPrediction()
                  }
                , dataClone = _.clone(data);
              dataClone.prediction.winnings = precise_round(dataClone.prediction.winnings, 2)

              var viewData = _.extend(dataClone, extras)
                , view = template.predictionStatus.upcomingPredicted.render(viewData)
              scope.$el.find('.js-match-widget__prediction-status').html(view)
              // update header to prediction
              var teamName = ''
              switch(data.prediction.outcome){
                case 'team1':
                  teamName = data.teams.team1.name
                  break
                case 'team2':
                  teamName = data.teams.team2.name
                  break
                case 'draw':
                  teamName = template.predictionStatus.messageOutcomeADraw.render(data)
                  break
              }
              var textOriginal = scope.$el.find('.js-match__prompt--prediction--original').text()
                , textReplaced = textOriginal.replace('***', teamName)
              scope.$el.find('.js-match__prompt--prediction').text(textReplaced)
              // show header
              changeHeader(scope.$el.find('.js-match__prompt--prediction'))
              break
          }
        }
      }
    }
    renderLive = function () {
      changeHeader(scope.$el.find('.js-match__prompt--competition'))
      var view = template.matchStatus.live.render(data)

      scope.$el.find('.js-match-widget__match-status').html(view)
      startClock()
      // Show Live badge
      scope.$el.find('.match__status--result').addClass('is--hidden')
      scope.$el.find('.match__status--live').removeClass('is--hidden')

      // Render tabs
      var view = template.tabs.render(data)
      scope.$el.find('.js-match-widget__prediction-status').html(view)
      bindTabs()
      renderStats(data.score)

      // Trigger correct tab
      scope.$el.find('.js-match-live-tab[data-tab="js-match-live-commentary"]').trigger('click')

      // Show live badge on commentary
      scope.$el.find('.match-view__live-badge').show()

      // Render prediction statuses
      switch(data.prediction.status) {
        case 'unpredicted':
          var view = template.predictionStatus.liveUnpredicted.render(data)
          scope.$el.find('.js-match-live-prediction').html(view)
          break
        case 'predicted':
          var extras =
              { yourPrediction: messages.prediction.yourPrediction()
              }
            , dataClone = _.clone(data)
            , viewData = _.extend(dataClone, extras)
            , view = template.predictionStatus.livePredicted.render(viewData)
          scope.$el.find('.js-match-live-prediction').html(view)
          break
      }
    }
    renderStats = function (response) {
      var temp = template.stats.render(response)
      scope.$el.find('.js-match-live-match-info').html(temp)
    }
    bindTabs = function () {
      scope.$el.find('.js-match-live-tab').on('click', function () {
        var $elem = $(this)
          , tab = $elem.data('tab')

        // hide current tab
        scope.$el.find('.match-view__live__tab.is-visible').removeClass('is-visible')

        // show current tab
        scope.$el.find('.' + tab).addClass('is-visible')
      })
    }

    readAndSetIFrameURLFromDOM = function() {

      var iframe = $('.header__modal--rmg-account-iframe')
      var $rmgSwitch = $('.js-rmg-switch') // cache jq dom pointer
      var url = $rmgSwitch.data('baseurl')+"make-deposit/?email="+$rmgSwitch.data('email') // open on make deposit page
      url += '&languageId='+$rmgSwitch.data('languageid')
      iframe.attr({src: url})
      showFsbLogin()

    }

    renderFulltime = function () {
      changeHeader(scope.$el.find('.js-match__prompt--competition'))
      var view = template.matchStatus.fulltime.render(data)
      scope.$el.find('.js-match-widget__match-status').html(view)
      renderGoals(data.score)

      // Show Result badge
      scope.$el.find('.match__status--result').removeClass('is--hidden')
      scope.$el.find('.match__status--live').addClass('is--hidden')

      // Render tabs
      var view = template.tabs.render(data)
      scope.$el.find('.js-match-widget__prediction-status').html(view)
      bindTabs()
      renderStats(data.score)

      // Build prediction status view
      switch(data.prediction.status) {
        case 'unpredicted':
          data.potentialCoins = data.coins[data.score.team1.score+":"+data.score.team2.score]
          var view = template.predictionStatus.fulltimeUnpredicted.render(data)
          scope.$el.find('.js-match-live-prediction').html(view)
          // changeHeader(data.competition)
          break
        case 'correct':
          var extras =
              { yourPrediction: messages.prediction.yourPrediction()
              }
            , dataClone = _.clone(data)
            , viewData = _.extend(dataClone, extras)
            , view = template.predictionStatus.fulltimeCorrect.render(viewData)
          scope.$el.find('.js-match-live-prediction').html(view)
          // changeHeader(data.competition)
          break
        case 'wrong':
          var extras =
              { yourPrediction: messages.prediction.yourPrediction()
              }
            , dataClone = _.clone(data)
            , viewData = _.extend(dataClone, extras)
            , view = template.predictionStatus.fulltimeWrong.render(viewData)
          scope.$el.find('.js-match-live-prediction').html(view)
          // changeHeader(data.competition)
          break
      }
    }
    renderLogin = function () {
      var view = template.predictionStatus.login.render(data)
      scope.$el.find('.js-match-widget__prediction-status').html(view)
    }
    renderNoCoins = function () {
      var view = template.predictionStatus.noCoins.render(data)
      scope.$el.find('.js-match-widget__prediction-status').html(view)
      if(scope.data.user && scope.data.user.gameType === 'rmg') {
        bindDepositMoneyButtonEvent()
      }
    }

    bindDepositMoneyButtonEvent = function() {
      scope.$el.find('.js-modal-buy-coins').on('click', function () {
        readAndSetIFrameURLFromDOM()
        showFsbLogin()
      })
    }

    parseCommentary = function (commentary) {
      if(commentary && commentary.length !== 0){
        commentary.forEach(function (comment) {
          // Find team names in comment a wrap with <strong>
          var filterTeam1 = new RegExp(data.teams.team1.name, 'g')
          comment.comment = comment.comment.replace(filterTeam1, '<strong>' + data.teams.team1.name + '</strong>')
          var filterTeam2 = new RegExp(data.teams.team2.name, 'g')
          comment.comment = comment.comment.replace(filterTeam2, '<strong>' + data.teams.team2.name + '</strong>')

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
    }

    increaseScore = function (team) {
      // check if score is a no decision '-:-'
      if(scope.data.prediction.team1 === '-'){
        scope.data.prediction.team1 = 0
        scope.data.prediction.team2 = 0
      }else{
        // if it's a draw increase both sides
        if(scope.data.prediction.outcome === 'draw'){
          scope.data.prediction.team1 = scope.data.prediction.team1 + 1
          scope.data.prediction.team2 = scope.data.prediction.team2 + 1
        }else{
          var increasingOutcomeTeam = team === scope.data.prediction.outcome
          // Allow to increase score if
          if(increasingOutcomeTeam && scope.data.prediction[team] < 10){
            scope.data.prediction[team] = scope.data.prediction[team] + 1
          } else {
            // check that score adjustment doesn't clash with outcome
            if(team === 'team2' && scope.data.prediction.team1 - 1 > scope.data.prediction.team2 && scope.data.prediction.team2 < 10){
              scope.data.prediction.team2 = scope.data.prediction.team2 + 1
            }
            if(team === 'team1' && scope.data.prediction.team2 - 1 > scope.data.prediction.team1 && scope.data.prediction.team1 < 10){
              scope.data.prediction.team1 = scope.data.prediction.team1 + 1
            }
          }
        }
      }
      updateScores()
      buildView()
      scope.$el.find('.match__stake').css('display','inline-block') // only effects MPU version
    }

    decreaseScore = function (team) {
      // check if score has already been predicted
      if(scope.data.prediction.team1 !== '-'){
        // check score is not below 1
        if(scope.data.prediction[team] >= 1){
          if(scope.data.prediction.outcome === 'draw'){
            scope.data.prediction.team1 = scope.data.prediction.team1 - 1
            scope.data.prediction.team2 = scope.data.prediction.team2 - 1
          }else{
            var decreasingOutcomeTeam = team !== scope.data.prediction.outcome
            // Allow to decrease score if
            if(decreasingOutcomeTeam  && scope.data.prediction[team] < 10){
              scope.data.prediction[team] = scope.data.prediction[team] - 1
            } else {
              // check that score adjustment doesn't clash with outcome
              if(team === 'team1' && scope.data.prediction.team1 > scope.data.prediction.team2 + 1 && scope.data.prediction.team2 < 10){
                scope.data.prediction.team1 = scope.data.prediction.team1 - 1
              }
              if(team === 'team2' && scope.data.prediction.team2 > scope.data.prediction.team1 + 1 && scope.data.prediction.team1 < 10){
                scope.data.prediction.team2 = scope.data.prediction.team2 - 1
              }
            }
          }
        }
      }
      updateScores()
      scope.$el.find('.match__stake').css('display','inline-block') // only effects MPU version
    }

    updateScores = function () {
      scope.$el.find('.js-match-prediction-score-team1').text(scope.data.prediction.team1)
      scope.$el.find('.js-match-prediction-score-team2').text(scope.data.prediction.team2)
      disableScoreButtons()
      if (data.coins[scope.data.prediction.team1+':'+scope.data.prediction.team2] != undefined) {
        scope.data.prediction.winnings = calculateScoreCoins(scope.data.prediction.team1, scope.data.prediction.team2)
        scope.data.prediction.quote = data.odds[scope.data.prediction.team1+':'+scope.data.prediction.team2].odds
        if(scope.data.user && scope.data.user.gameType === 'rmg') {
          scope.$el.find('.js-match-action-score-odds').text('£' + scope.data.prediction.winnings)
        } else {
          scope.$el.find('.js-match-action-score-odds').text('+' + scope.data.prediction.winnings)
        }
      }
    }

    disableScoreButtons = function () {
      var drawOutcomeBlank = scope.data.prediction.team1 === '-'
        // If team 1 has score is 0 disable button
        , team1Zero = scope.data.prediction.team1 === 0
        // If team 1 has score is 0 disable button
        , team2Zero = scope.data.prediction.team2 === 0
        // If user can't decrease team1 due to clashing with outcome
        , team1DecreaseClash = scope.data.prediction.outcome === 'team1' && scope.data.prediction.team1 - 1 === scope.data.prediction.team2
        // If user can't decrease team2 due to clashing with outcome
        , team2DecreaseClash = scope.data.prediction.outcome === 'team2' && scope.data.prediction.team2 - 1 === scope.data.prediction.team1
        // If user can't increase team1 due to clashing with outcome
        , team1IncreaseClash = scope.data.prediction.outcome === 'team2' && scope.data.prediction.team1 + 1 === scope.data.prediction.team2
        // If user can't increase team2 due to clashing with outcome
        , team2IncreaseClash = scope.data.prediction.outcome === 'team1' && scope.data.prediction.team2 + 1 === scope.data.prediction.team1
        // Figure out which btns to disable
        , team1IncreaseDisable = team1IncreaseClash
        , team2IncreaseDisable = team2IncreaseClash
        , team1DecreaseDisable = team1Zero || team1DecreaseClash
        , team2DecreaseDisable = team2Zero || team2DecreaseClash

      if(team1IncreaseDisable){
        scope.$el.find('.js-match-action-score-team1-increase').addClass('is-disable')
      } else if (scope.$el.find('.js-match-action-score-team1-increase').hasClass('is-disable')) {
        scope.$el.find('.js-match-action-score-team1-increase').removeClass('is-disable')
      }
      if(team2IncreaseDisable){
        scope.$el.find('.js-match-action-score-team2-increase').addClass('is-disable')
      } else if (scope.$el.find('.js-match-action-score-team2-increase').hasClass('is-disable')) {
        scope.$el.find('.js-match-action-score-team2-increase').removeClass('is-disable')
      }
      if(team1DecreaseDisable){
        scope.$el.find('.js-match-action-score-team1-decrease').addClass('is-disable')
      } else if (scope.$el.find('.js-match-action-score-team1-decrease').hasClass('is-disable')) {
        scope.$el.find('.js-match-action-score-team1-decrease').removeClass('is-disable')
      }
      if(team2DecreaseDisable){
        scope.$el.find('.js-match-action-score-team2-decrease').addClass('is-disable')
      } else if (scope.$el.find('.js-match-action-score-team2-decrease').hasClass('is-disable')) {
        scope.$el.find('.js-match-action-score-team2-decrease').removeClass('is-disable')
      }

      if (data.coins[scope.data.prediction.team1+':'+scope.data.prediction.team2] == undefined) {
        scope.$el.find('.js-match-action-score-prediction-predict').hide()
        scope.$el.find('.js-match-score-odds-error').show()
      } else {
        scope.$el.find('.js-match-score-odds-error').hide()
        scope.$el.find('.js-match-action-score-prediction-predict').show()
      }
    }

    submitPrediction = function (callback) {
      // Save prediction to database
      scope.data.prediction.matchId = data.matchId

      $.ajax({
        url: data.predictorApiUrl
        , type: 'POST'
        , data: scope.data.prediction
        , dataType: 'json'
        , success: function(reponse, textStatus, jqXHR) {
            if(reponse.success === false){
              scope.$el.find('.js-match-submit-error').text(reponse.error)
            } else {

              // Success!
              incrementCurrentPredictions(scope.data.prediction.outcome)
              if (callback && typeof(callback) === 'function') callback()
            }
          }
        , error: function(reponse, textStatus, jqXHR) {
            if(reponse.success === false){
              scope.$el.find('.js-match-submit-error').text(reponse.error)
            }
          }
      })
    }
    incrementCurrentPredictions = function (outcome) {
      scope.data.currentPredictions[outcome]++
      calculatePercentages()
    }

    /**
     * factory method to create templates object
     * returned object is slightly different if real money gambling is running
     * templates are hogan objects, call render(data) on them to get HTML string
     * @return {[object]} basic look up directory for html templates -
     */
    loadTemplates = function() {
      var templates =
      {
        base: Hogan.compile($('.temp__match-widget').html())
        , fanzone: Hogan.compile($('.temp__match-widget__fanzone').html())
        , tabs: Hogan.compile($('.temp__match-widget__tabs').html())
        , commentary: Hogan.compile($('.temp__match-widget__commentary').html())
        , stats: Hogan.compile($('.temp__match-widget__stats').html())
        , errorModal: Hogan.compile($('.temp__rmg-error-modal').html())
        , matchStatus:
          { upcoming: Hogan.compile($('.temp__match-status__upcoming').html())
          , live: Hogan.compile($('.temp__match-status__live').html())
          , fulltime: Hogan.compile($('.temp__match-status__fulltime').html())
          , score: Hogan.compile($('.temp__match-status__score').html())
          , postponed: Hogan.compile($('.temp__match-status__postponed').html())
          , predictionConfirm: Hogan.compile($('.temp__prediction-confirm').html())
          }
        , predictionStatus:
          { upcomingUnpredicted: Hogan.compile($('.temp__prediction-status__upcoming-unprediction').html())
          , upcomingOutcomePredicted: Hogan.compile($('.temp__prediction-status__upcoming-score-prediction').html())
          , upcomingPredicted: Hogan.compile($('.temp__prediction-status__upcoming-prediction').html())
          , liveUnpredicted: Hogan.compile($('.temp__prediction-status__live-unprediction').html())
          , livePredicted: Hogan.compile($('.temp__prediction-status__live-prediction').html())
          , fulltimeUnpredicted: Hogan.compile($('.temp__prediction-status__fulltime-unprediction').html())
          , fulltimeCorrect: Hogan.compile($('.temp__prediction-status__fulltime-correct').html())
          , fulltimeWrong: Hogan.compile($('.temp__prediction-status__fulltime-wrong').html())
          , login: Hogan.compile($('.temp__prediction-status__login').html())
          , noCoins: Hogan.compile($('.temp__prediction-status__no-coins').html())
          , confirmHome: Hogan.compile($('.temp__prediction-status__confirm--home').html())
          , confirmAway: Hogan.compile($('.temp__prediction-status__confirm--away').html())
          , confirmDraw: Hogan.compile($('.temp__prediction-status__confirm--draw').html())
          , unpredictable: Hogan.compile($('.temp__prediction-status__unpredictable').html())
          , noOdds: Hogan.compile($('.temp__prediction-status__no-odds').html())
          , postponed: Hogan.compile($('.temp__prediction-status__postponed').html())
          , nextFixture: Hogan.compile($('.temp__prediction-status__next-fixture').html())
          , messageOutcomeAwayWin: Hogan.compile($('.temp__prediction-message-outcome-away-win').html())
          , messageOutcomeAwayWinScore: Hogan.compile($('.temp__prediction-message-outcome-away-win--score').html())
          , messageOutcomeDraw: Hogan.compile($('.temp__prediction-message-outcome-draw').html())
          , messageOutcomeDrawScore: Hogan.compile($('.temp__prediction-message-outcome-draw--score').html())
          , messageOutcomeHomeWin: Hogan.compile($('.temp__prediction-message-outcome-home-win').html())
          , messageOutcomeHomeWinScore: Hogan.compile($('.temp__prediction-message-outcome-home-win--score').html())
          , messageOutcomeADraw: Hogan.compile($('.temp__prediction-message-outcome-adraw').html())
          , submitting: Hogan.compile($('.temp__prediction-submitting').html())
          }
      }

      // load real money templates. todo: make this more efficient by not loading the other templates unnecessarily
      if(scope.data.user && scope.data.user.gameType === 'rmg') {
        templates.base = Hogan.compile($('.temp__rmg-match-widget').html())
        templates.predictionStatus.upcomingUnpredicted = Hogan.compile($('.temp__rmg-prediction-status__upcoming-unprediction').html())
        templates.predictionStatus.confirmAway = Hogan.compile($('.temp__rmg-prediction-status__confirm--away').html())
        templates.predictionStatus.confirmDraw = Hogan.compile($('.temp__rmg-prediction-status__confirm--draw').html())
        templates.predictionStatus.confirmHome = Hogan.compile($('.temp__rmg-prediction-status__confirm--home').html())
        templates.predictionStatus.upcomingPredicted = Hogan.compile($('.temp__rmg-prediction-status__upcoming-prediction').html())
        templates.predictionStatus.upcomingOutcomePredicted = Hogan.compile($('.temp__rmg-prediction-status__upcoming-score-prediction').html())
        templates.predictionStatus.nextFixture = Hogan.compile($('.temp__rmg-prediction-status__next-fixture').html())
        // n.b. this next one is matchStatus
        templates.matchStatus.predictionConfirm = Hogan.compile($('.temp__rmg-prediction-confirm').html())
        templates.predictionStatus.fulltimeUnpredicted = Hogan.compile($('.temp__rmg-prediction-status__fulltime-unprediction').html())
        templates.predictionStatus.fulltimeCorrect = Hogan.compile($('.temp__rmg-prediction-status__fulltime-correct').html())

        templates.predictionStatus.liveUnpredicted = Hogan.compile($('.temp__rmg-prediction-status__live-unprediction').html())
        templates.predictionStatus.livePredicted = Hogan.compile($('.temp__rmg-prediction-status__live-prediction').html())
        templates.predictionStatus.noCoins = Hogan.compile($('.temp__rmg-prediction-status__no-coins').html())
      }


      return templates
    }

    getMatchData = function () {
      $.ajax({
          url: data.matchEventsApiUrl+'?matchId=' + data.matchId
        , type: 'GET'
        , success: function(response) {
            if (isLive(response.matchStatus)) {
              if(response.team1 && response.team1.score === null || response.team1.score === ''){
                response.team1.score = 0
              }
              if(response.team2 && response.team2.score === null || response.team2.score === ''){
                response.team2.score = 0
              }
              if(response.matchStatus === 'SecondHalf' && !state.hasClockRunning){
                data.halftimekickOff = response.halftimekickOff
                startClock()
              }
              if(!response.team1.halfTime){
                response.showHalfTime = false
              } else {
                response.showHalfTime = true
              }

              // data.score = response
              data.matchStatus = response.matchStatus

              response.commentary = parseCommentary(response.commentary)
              renderCommentary(response)
              renderStats(response)
              drawMatchCharts(response.stats)
              renderScore(response)
              renderGoals(response)
            } else if (isFullTime(response.matchStatus)) {
              data.score = response
              data.matchStatus = response.matchStatus
              renderGoals(response)
              if(data.prediction.status !== 'unpredicted'){
                predictionCorrect(function (typeOfPrediction) {
                  buildView()
                })
              } else {
                buildView()
              }
            }
            if(isLive(data.matchStatus) || isUpcoming(data.matchStatus)){
              setTimeout(getMatchData, getMatchUpdateSpeed())
            }
          }
      })
    }
    renderCommentary = function (response) {
        var oldCommentary = data.score.commentary
          , newCommentary = response.commentary
          , difference = newCommentary.length - oldCommentary.length
          , newItems = newCommentary.slice(0, difference)

      // reverse array so it's render in the correct order
      newItems.reverse()

      if(newItems.length !== 0){
        // loop through each and render
        newItems.forEach(function(comment){
          var view = template.commentary.render(comment)
          scope.$el.find('.js-match-live-commentary-list').prepend(view)
        })

        // Replace order array with new
        data.score.commentary = response.commentary
      }
    }
    renderScore = function (response) {
      scope.$el.find('.js-match__outcome__score--home').html(response.team1.score)
      scope.$el.find('.js-match__outcome__score--away').html(response.team2.score)
    }
    renderGoals = function (response) {
      scope.$el.find('.js-match__team1-goals').html('')
      scope.$el.find('.js-match__team2-goals').html('')

      if(response.team1.goals.length > 0){
        response.team1.goals.forEach(function (goal, index, array) {
          switch(goal.type){
            case 'Goal':
              scope.$el.find('.js-match__team1-goals').append('<li class="match__live__goal">' + goal.name + ' (' + goal.minute + ')' + '</li>')
              break
            case 'Own':
              scope.$el.find('.js-match__team1-goals').append('<li class="match__live__goal">' + goal.name + ' (' + goal.minute + ')' + ' (og)</li>')
              break
          case 'Penalty':
              scope.$el.find('.js-match__team1-goals').append('<li class="match__live__goal">' + goal.name + ' (' + goal.minute + ')' + '</li>')
              break
            case 'Yellow':
              scope.$el.find('.js-match__team1-goals').append('<li class="match__live__yellow">' + goal.name + ' (' + goal.minute + ')' + '</li>')
              break
            case 'SecondYellow':
            case 'StraightRed':
              scope.$el.find('.js-match__team1-goals').append('<li class="match__live__red">' + goal.name + ' (' + goal.minute + ')' + '</li>')
              break
          }
        })
      }
      if(response.team2.goals.length > 0){
        response.team2.goals.forEach(function (goal, index, array) {
          switch(goal.type){
            case 'Goal':
              scope.$el.find('.js-match__team2-goals').append('<li class="match__live__goal">' + goal.name + ' (' + goal.minute + ')' + '</li>')
              break
            case 'Own':
              scope.$el.find('.js-match__team2-goals').append('<li class="match__live__goal">' + goal.name + ' (' + goal.minute + ')' + ' (og)</li>')
              break
            case 'Penalty':
              scope.$el.find('.js-match__team2-goals').append('<li class="match__live__goal">' + goal.name + ' (' + goal.minute + ')' + '</li>')
              break
            case 'Yellow':
              scope.$el.find('.js-match__team2-goals').append('<li class="match__live__yellow">' + goal.name + ' (' + goal.minute + ')' + '</li>')
              break
            case 'SecondYellow':
            case 'StraightRed':
              scope.$el.find('.js-match__team2-goals').append('<li class="match__live__red">' + goal.name + ' (' + goal.minute + ')' + '</li>')
              break
          }
        })
      }
    }
    predictionCorrect = function (callback) {
      if(data.prediction.team1 === null || data.prediction.team2 === null){
        // user has made a outcome prediction
        // typeOfPrediction = 'outcome'
        switch(data.prediction.outcome){
          case 'team1':
            var predictionCorrect = data.score.team1.score > data.score.team2.score
            data.prediction.status = (predictionCorrect) ? 'correct' : 'wrong'
            break
          case 'team2':
            var predictionCorrect = data.score.team2.score > data.score.team1.score
            data.prediction.status = (predictionCorrect) ? 'correct' : 'wrong'
            break
          case 'draw':
            var predictionCorrect = data.score.team1.score === data.score.team2.score
            data.prediction.status = (predictionCorrect) ? 'correct' : 'wrong'
            break
        }
      } else {
        // typeOfPrediction = 'score'
        var isTeam1ScoreCorrect = data.prediction.team1 == data.score.team1.score
          , isTeam2ScoreCorrect = data.prediction.team2 == data.score.team2.score
          , predictionCorrect = isTeam1ScoreCorrect && isTeam2ScoreCorrect
        data.prediction.status = (predictionCorrect) ? 'correct' : 'wrong'
      }
      if (callback && typeof(callback) === 'function') callback()
    }

    startClock = function () {
      var kickoff = new Date(data.kickOff).getTime()
          , startTime = 0
      if (data.halftimekickOff != "") {
        kickoff = new Date(data.halftimekickOff).getTime()
        startTime = 45
      }


      var currentDate =  new Date().getTime()
        , countdown = kickoff - currentDate
        , oneMinute = 60 * 1000
        , oneHour = 60 * 60 * 1000
        , minutes = Math.abs((countdown)/(oneMinute)) / 60.0
        , clockMinutes = Math.floor((minutes - Math.floor(minutes) ) * 60.0)

      data.clock =
        { minutes : (data.matchStatus == 'Halftime') ? 'HT' : startTime + clockMinutes
        , seconds : 0
        }
      updateMatchClock()
    }

    updateMatchClock = function () {
      data.clock.seconds++
      if (data.clock.seconds === 60 && data.matchStatus !== 'Halftime'){
        data.clock.minutes++
        data.clock.seconds = 0
      }
      if (data.clock.seconds < 10) {data.clock.seconds = "0" + data.clock.seconds};
      scope.$el.find('.js-match__outcome__clock--live').text(data.clock.minutes)
      if(!state.hasClockRunning){
        state.hasClockRunning = true
        setTimeout(function () {
          state.hasClockRunning = false
          updateMatchClock()
        }, 1000)
      }
    }

    commentaryScrollToTop = function () {
      var commentaryListTopNew = scope.$el.find('.js-match-live-commentary-list').offset().top - state.headerHeight - 10
      $('html, body').animate({
        scrollTop: commentaryListTopNew + 'px'
      }, 200)
    }

    commentaryListExpand = function () {
      var commentaryListHeightNew = $(window).height() - state.headerHeight - scope.$el.find('.js-match-live-commentary-list-toggle').outerHeight() - 40
      scope.$el.find('.js-match-live-commentary-list').animate({
        height: commentaryListHeightNew + 'px'
      }, 200)
    }

    commentaryListContract = function () {
      scope.$el.find('.js-match-live-commentary-list').animate({
        height: state.commentaryListHeight + 'px'
      }, 200)
    }

    drawMatchCharts = function (statsData) {

      // If values dont exist set to defaults
      if (!statsData.home.possession_percentage ) {
        statsData.home.possession_percentage = 50
        scope.$el.find( '.match-view__live__match-info__possession--home .match-view__live__match-info__possession__percent--number' ).text( 50 );
      }
      if (!statsData.away.possession_percentage ) {
        statsData.away.possession_percentage = 50
        scope.$el.find( '.match-view__live__match-info__possession--away .match-view__live__match-info__possession__percent--number' ).text( 50 );
      }
      if (!statsData.home.total_scoring_att ) {
        statsData.home.total_scoring_att = 0
        scope.$el.find( '.js-match-view__live__match-info__attack__scoring--total--home' ).text( 0 );
      }
      if (!statsData.away.total_scoring_att ) {
        statsData.away.total_scoring_att = 0
        scope.$el.find( '.js-match-view__live__match-info__attack__scoring--total--away' ).text( 0 );
      }
      if (!statsData.home.ontarget_scoring_att ) {
        statsData.home.ontarget_scoring_att = 0
        scope.$el.find( '.js-match-view__live__match-info__attack__scoring--att--home' ).text( 0 );
      }
      if (!statsData.away.ontarget_scoring_att ) {
        statsData.away.ontarget_scoring_att = 0
        scope.$el.find( '.js-match-view__live__match-info__attack__scoring--att--away' ).text( 0 );
      }
      if (!statsData.home.won_corners ) {
        statsData.home.won_corners = 0
        scope.$el.find( '.js-match-view__live__match-info__attack__corners--home' ).text( 0 );
      }
      if (!statsData.away.won_corners ) {
        statsData.away.won_corners = 0
        scope.$el.find( '.js-match-view__live__match-info__attack__corners--away' ).text( 0 );
      }
      if (!statsData.home.fk_foul_won ) {
        statsData.home.fk_foul_won = 0
        scope.$el.find( '.js-match-view__live__match-info__attack__fouls--home' ).text( 0 );
      }
      if (!statsData.away.fk_foul_won ) {
        statsData.away.fk_foul_won = 0
        scope.$el.find( '.js-match-view__live__match-info__attack__fouls--away' ).text( 0 );
      }

      // If home and away are not there set graph to 1 so it displays
      if ( !statsData.home.total_scoring_att && !statsData.away.total_scoring_att ) {
        statsData.home.total_scoring_att = 1
        statsData.away.total_scoring_att = 1
      }
      if ( !statsData.home.ontarget_scoring_att && !statsData.away.ontarget_scoring_att ) {
        statsData.home.ontarget_scoring_att = 1
        statsData.away.ontarget_scoring_att = 1
      }
      if ( !statsData.home.won_corners && !statsData.away.won_corners ) {
        statsData.home.won_corners = 1
        statsData.away.won_corners = 1
      }
      if (!statsData.home.fk_foul_won && !statsData.away.fk_foul_won ) {
        statsData.home.fk_foul_won = 1
        statsData.away.fk_foul_won = 1
      }

      // If no shirt colour set greys
      if ( !statsData.home.colour_red ) {
        statsData.home.colour_red = 180
        statsData.home.colour_green = 180
        statsData.home.colour_blue = 180
      }
      if ( !statsData.away.colour_red ) {
        statsData.away.colour_red = 190
        statsData.away.colour_green = 190
        statsData.away.colour_blue = 190
      }

      var dataPossession = google.visualization.arrayToDataTable([
        ['Possession', 'Percentage'],
        ['Away team', statsData.away.possession_percentage],
        ['Home team', statsData.home.possession_percentage]
      ])
        , optionsPossession = {
        pieHole: 0.6,
        legend: 'none',
        pieSliceText: 'none',
        pieStartAngle: 45,
        backgroundColor: {fill:'#f7f7f5', stroke: '#f7f7f5', strokeWidth: '3'},
        tooltip: { trigger: 'none' },
        enableInteractivity: false,
        animation: { duration: 3000, easing: 'inAndOut' },
        chartArea:{left:0,top:0,width:'100%',height:'100%'},
        colors: [
          'rgb(' + statsData.away.colour_red + ',' + statsData.away.colour_green + ',' + statsData.away.colour_blue + ')',
          'rgb(' + statsData.home.colour_red + ',' + statsData.home.colour_green + ',' + statsData.home.colour_blue + ')'
          ],
        slices: {
          0: {offset: 0.01},
          1: {offset: 0.01}
        }
      }
        , dataShotsTotal = google.visualization.arrayToDataTable([
        ['', 'Home team', 'Away Team' ],
        ['Shots Total', statsData.home.total_scoring_att, statsData.away.total_scoring_att]
      ])
        , dataShotsTarget = google.visualization.arrayToDataTable([
        ['', 'Home team', 'Away Team' ],
        ['Shots on target' , statsData.home.ontarget_scoring_att , statsData.away.ontarget_scoring_att]
      ])
        , dataCorners = google.visualization.arrayToDataTable([
        ['', 'Home team', 'Away Team' ],
        ['Corners', statsData.home.won_corners, statsData.away.won_corners]
      ])
        , dataFouls = google.visualization.arrayToDataTable([
        ['', 'Home team', 'Away Team' ],
        ['Fouls', statsData.away.fk_foul_won, statsData.home.fk_foul_won]
      ])
        , optionsMatchStats = {
        legend: 'none',
        height: 20,
        isStacked: true,
        chartArea:{ left:0, top:0, width:'100%', height:'100%' },
        vAxis:{ textPosition: 'none' },
        tooltip:{ trigger: 'none' },
        enableInteractivity: false,
        animation: { duration: 3000, easing: 'inAndOut' },
        backgroundColor: {
          fill:'#f7f7f5',
          stroke: '#f7f7f5'
        },
        hAxis: {
          viewWindowMode: 'maximized',
          baselineColor: '#f7f7f5',
          gridlineColor: '#f7f7f5'
        },
        colors: [
          'rgb(' + statsData.home.colour_red + ',' + statsData.home.colour_green + ',' + statsData.home.colour_blue + ')',
          'rgb(' + statsData.away.colour_red + ',' + statsData.away.colour_green + ',' + statsData.away.colour_blue + ')'
          ]
      }

      var chartPossession = new google.visualization.PieChart(
        scope.$el.find('.js-match-view__live__match-info__chart__possession')[0]
      )
        , chartShotsTotal = new google.visualization.BarChart(
        scope.$el.find('.js-match-view__live__match-info__chart__shots_total')[0]
      )
        , chartShotsTarget = new google.visualization.BarChart(
        scope.$el.find('.js-match-view__live__match-info__chart__shots_target')[0]
      )
        , chartCorners = new google.visualization.BarChart(
        scope.$el.find('.js-match-view__live__match-info__chart__corners')[0]
      )
        , chartFouls = new google.visualization.BarChart(
        scope.$el.find('.js-match-view__live__match-info__chart__fouls')[0]
      )

      chartPossession.draw(dataPossession, optionsPossession)
      chartShotsTotal.draw(dataShotsTotal, optionsMatchStats)
      chartShotsTarget.draw(dataShotsTarget, optionsMatchStats)
      chartCorners.draw(dataCorners, optionsMatchStats)
      chartFouls.draw(dataFouls, optionsMatchStats)
    }

    /**
     * [afterSubmitMPU unfortunetely this method is slightly misnamed and really should be called something like animateToNextMatch]
     * takes a sting which is equal to 'skip' if skip was clicked, empty otherwise
     */
    afterSubmitMPU = function(skip) {
      var $overlay, // container which has either a tick or a skip symbol
          overlayClass  // class of container to use as overlay

      if(skip) {
        overlayClass = '.match__skip-overlay--mpu'
      } else {
        overlayClass = '.match__tick-overlay--mpu'
      }

      $overlay = scope.$el.find(overlayClass)

      $overlay.removeClass('is--hidden')

      var overlayFade = $overlay.animate( {'opacity':0.8 } )
      var scrollBlock = scope.$el.find('.match__contents').animate( { left: '-300px' }, 1000)
      var nextUnpredicedMatch = fetchNextMatch();

      $.when(overlayFade, scrollBlock, nextUnpredicedMatch).done(function(overlayFade, scrollBlock, nextUnpredicedMatch) {
        scope.data = data = mockNextMatch() // this just here testing until pep comes through with the backend
        // data = nextUnpredicedMatch[0]
        // reinitialise mpu predictor with next match data
        scope.init(scope.data)
        renderNextMatch(overlayClass)
      }).fail(function(scrollBlock, nextUnpredicedMatch){
        alert('We were unable to download the next match')
      })

    }
    /* this only happens in mpu version */
    renderNextMatch = function(overlayClass) {

      // Render base template
      calculatePercentages()
      // Calculate coins from bet data
      calculateCoins()
      calculateCountdown()
      // this is a  bit hacky
      // create new html
      var view = $('<div>').html(template.base.render(scope.data)).find('.match__contents').html()
      //animate slide in to predictor
      scope.$el.find('.match__contents').html(view).css('left',310)

      // we have to do this to align the t-shirts. needs to be dealt with better in future.
      if($(window).width() > 768){
        $('.js-match-widget').addClass('match-widget--animated')
        $('.js-match__fade-in--home-team').css({ left: "+=40px", opacity: 1 } )
        $('.js-match__fade-in--away-team').css({ right: "+=40px", opacity: 1 } )
        $('.js-match__fade-in--countdown').css('opacity',1)
        $('.js-match__fade-in--prompt, .js-match__outcome--animated').attr("style","opacity:1")
      }

      var scrollBlock = scope.$el.find('.match__contents').animate( { left: '0px' }, 1000)
      var fadeOverlay = scope.$el.find(overlayClass).animate( {opacity:0}, 1000)

      $.when(scrollBlock, fadeOverlay)
        .done(function(scrollBlock){
          fadeOverlay.removeAttr('style').addClass('is--hidden') // reset the overlay
          // from here on out is the same as the initial render()  funcion above.
          scope.delegateEvents()
          createTeamNameClasses(data)
          buildView()
          // we keep having to do things to cancel out animation effects that
          // are not used in this state. this needs to be fixed
          $('.js-match__outcome--animated').attr("style","opacity:1")
          renderFanzone()
          if (typeof state.commentaryListHeight === 'undefined') {
            state.commentaryListHeight = scope.$el.find('.js-match-live-commentary-list').outerHeight()
          }
          if (typeof state.headerHeight === 'undefined') {
            state.headerHeight = $('.js-header').outerHeight()
          }
      })
    }

    mockNextMatch = function() {
      // return a mock next match object
      var nextMatchData = {
        "widgetFormat":"mpu",
        "locale":"en",
        "userId":6993,
        "user":{"balance":430},
        "matchId":146,
        "competition":"Champions League",
        "matchStatus":"PreMatch",
        "kickOff":"2014-11-27T19:45:00Z",
        "kickOffPretty":"Tue, 27 Nov 2014 19:45",
        "halftimekickOff":"",
        "score":{
            "team1":{
                "score":"",
                "halfTime":"",
                "goals":[]
              },
            "team2":{
                "score":"",
                "halfTime":"",
                "goals":[]
              },
              "matchStatus":"PreMatch"
            },
          "venue":"",
          "prediction":{
              "status":"unpredicted",
              "outcome":null,
              "team1":0,
              "team2":0,
              "stake":10,
              "winnings":""
            },
            "teams":{
              "team1":{
                "name":"Paris Saint Germain",
                "path":"/en/football/team/paris-sg",
                "color":"#101331",
                "shirt":"http://fanbookz.s3-eu-west-1.amazonaws.com/team_shirt_image_large/1027419028e79ce136e1ab8557c83fc0/paris_saint-germain%402x.png"
              },
              "team2":{
                "name":"Ajax",
                "path":"/en/football/team/ajax",
                "color":"#c8042b",
                "shirt":"http://fanbookz.s3-eu-west-1.amazonaws.com/team_shirt_image_large/d83a5f2d2acef36447f2b70dd2c2625b/afc_ajax%402x.png"
              }
            },
          "odds":{
            "team1":"1.357424594339622",
            "team2":"8.682681524299063",
            "draw":"4.902571824299066",
            "5:1":41.88679245283,
            "0:2":50.854430014286,
            "2:0":5.8052436971429,
            "4:3":135.44444444444,
            "2:1":8.1615844157143,
            "3:1":11.086350231429,
            "2:4":191.52941176471,
            "3:2":29.443453415714,
            "3:3":97.984913234848,
            "3:4":221.43181818182,
            "1:3":94.344624534286,
            "7:1":187.88,
            "7:0":151.89655172414,
            "6:2":161.22222222222,
            "5:3":204.84,
            "0:3":137.02944094265,
            "1:4":199.37254901961,
            "8:0":230.61904761905,
            "1:5":206.42424242424,
            "7:2":218.52941176471,
            "0:5":205.48387096774,
            "6:3":347,
            "2:5":243.95454545455,
            "2:6":240.31578947368,
            "1:6":292.16666666667,
            "0:7":356.22222222222,
            "5:4":313.77777777778,
            "1:7":356.22222222222,
            "3:6":370.4,
            "8:1":366.25,
            "0:6":211.25,
            "0:4":191.06382978723,
            "1:2":25.233011905714,
            "2:3":88.131641457143,
            "4:1":19.630161290323,
            "3:5":325.6,
            "4:4":201.45945945946,
            "5:0":29.64320754717,
            "1:1":9.0757352941176,
            "0:1":19.047705882857,
            "0:0":12.055647852941,
            "4:0":14.254677419355,
            "6:1":92.536585365854,
            "6:0":74.462040816327,
            "1:0":6.2254511271429,
            "3:0":7.8622857142857,
            "5:2":94.853658536585,
            "4:2":48.518870967742,
            "2:2":21.981573926471,
            "5:5":470,"4:5":359,
            "9:0":458.83333333333,
            "10:0":317,
            "8:2":525,
            "2:8":625,
            "7:4":600,
            "4:7":625,
            "7:3":550,
            "3:7":625,
            "6:5":625,
            "5:6":625,
            "6:4":575,
            "4:6":625,
            "1:10":250,
            "10:1":250,
            "2:9":625,
            "9:2":600,
            "1:9":625,
            "9:1":550,
            "3:8":625,
            "8:3":600,
            "5:8":1000,
            "6:8":1000,
            "6:7":1000,
            "4:8":1000,
            "9:8":1000,
            "5:7":1000,
            "9:6":1000,
            "9:7":1000,
            "9:4":1000,
            "9:5":1000,
            "8:7":1000,
            "9:3":1000,
            "8:5":1000,
            "8:6":1000,
            "7:6":1000,
            "8:4":1000,
            "7:5":1000,
            "6:6":1000,
            "7:8":1000,
            "3:9":1000,
            "4:9":1000,
            "5:9":1000,
            "6:9":1000,
            "7:9":1000,
            "8:9":1000,
            "7:7":1000,
            "8:8":1000,
            "9:9":1000,
            "0:10":375.5,
            "0:9":583.66666666667
          },
          "coins":[],
          "predictorApiUrl":"/en/api/predictor",
          "matchEventsApiUrl":"/en/api/match/events",
          "nextUnpredictedMatchApiUrl":"/en/api/match/next-unpredicted",
          "predictable":true,
          "currentPredictions":{
            "team1":0,
            "team2":0,
            "draw":0
          },
          "nextFixture":{
            "url":"/en/football/league/champions-league/2014/2014-11-25/bate-borisov_porto/predictor",
            "homeTeam":"BATE Borisov",
            "awayTeam":"FC Porto"
          }
        }

      return nextMatchData
    }

    fetchNextMatch = function() {
      // this is partly legacy of previous code
      // I am using it in this case from the above afterSubmitMPU() method
      // as a deferred object (using jQuery promises)
      var nextMatch = $.ajax({
        url: data.nextUnpredictedMatchApiUrl
        , type: 'GET'
        , data: { skippedMatchIds: [1, 2, 3]}
        , dataType: 'json'
      })

      return nextMatch
    }

    changeStake = function(newStakeHash) {
      var newStake = parseInt(newStakeHash.substr(1), 10)/100
      data.prediction.stake = newStake.toFixed(2)
      calculateCoins()
      console.log('changing the stake to '+ newStake)
    }

    modalCloseRefresh = function() {
      $('#fsbModal').on('hide.bs.modal',function(e){
        document.location.reload()
      })
    }

    clearModalEvents = function() {
      $('#fsbModal').off('show.bs.modal')
    }

    turnRmgOn = function() {
      callback = modalCloseRefresh
      matchWidgetPost({
        endPointName: 'gameTypeRmg',
        callbackOnDone: callback
      })
    }

    updateBalanceDisplay = function() {
      console.log('updating balance display')
      FanbookzHeader.updateRmgBalance(scope.data.rmg.balance)
    }

    setBalance = function(response) {
      var amount = response.value

      if(scope.data.rmg.balance == 0 && amount != 0) {
        // this replaces the 'you haven't got any money' template
      scope.data.rmg.balance = (parseFloat(amount)).toFixed(2)
        renderUpcoming()
        scope.$el.find('.js-match__outcome--animated').animate( {'opacity':1 } ) // annoying
      } else {
        scope.data.rmg.balance = (parseFloat(amount)).toFixed(2)
      }

      if(amount == 0) {
        // load and display no money template if the user has no money
        renderNoCoins()
      }

      console.log('set balance to '+scope.data.rmg.balance)
      updateBalanceDisplay()
    }

    updateAndGetBalanceFromFSB = function() {

      matchWidgetPost({
        endPointName: 'updateAndGetBalanceFromFSB',
        callbackOnDone: setBalance
      })
      console.log('updating balance')

    }

    getBalanceFromCache = function() {

      matchWidgetPost({
        endPointName: 'getBalanceFromCache',
        callbackOnDone: setBalance
      })

      setTimeout(getBalanceFromCache, 30000)

    }

    showFsbLogin = function() {

      //open modal - at some point get a better way of doing this but for now it works without having to unbind and rebind menu events
      $('#fsbModal').modal('show')

    }

    openModalAt = function(pageName) {
      // obviously at some point we should just have a method
      // which takes what page we want to open the modal at and then open it
        var $rmgSwitch = $('.js-rmg-switch') 
        var email  = $rmgSwitch.data('email')
        var iframe = $('.header__modal--rmg-account-iframe') 
        var src    = $rmgSwitch.data('baseurl')+ pageName + "/?email=" + email
        src += '&languageId='+$rmgSwitch.data('languageid')
        iframe.attr({src: src});
        $('#fsbModal').modal('show')
    }

    controlRmgPopUps = function() {

      var showWarning = data.rmg && data.rmg.showWarning
      if(showWarning) {

        // show RMG menu tooltip
        $('.js-nav-dropdown').tooltip({
          trigger: 'manual',
          placement: 'bottom'
        }).tooltip('show');

        $('.js-nav-dropdown').hover(function hideTooltip(e) {
          $(e.currentTarget).tooltip('hide')
        })

        // show stake dropdown pop up
        $('.js-switched-to-rmg-alert').removeClass('hidden')

        scope.$el.on('click', $('.js-dismiss-rmg-alert'), function(){
          $('.js-switched-to-rmg-alert').addClass('hidden')
        })

      }

    }

    /**
     * refactor to use jquery deferred?
     * @param  string   endPointName string used as key in endpoints lookup table
     * @param  Function callbackOnDone     function called on success
     * @param  Function callbackOnFail     function called on error
     * @param  object   payload      post params
     * @param  string   urlParams    if params are in url they can be appended to the url as a string
     * @return void
     */
    var requestsPromises = []
    matchWidgetPost = function(params) {

      var endPoint = paths.base+'/'+data.locale+endPoints[params.endPointName].url+(params.urlParams ? params.urlParams : '')
      var method   = endPoints[params.endPointName].method
      var ajaxObj = {
        url: endPoint
        , type: method
        , data: params.payload
        , dataType: 'json'
      }

      var promiseWrapper = function() {

        var _promise = new $.Deferred(function( defer ) {

          $.ajax(ajaxObj).done(function (response, textStatus, jqXHR){

            defer.resolve()
            if (typeof params.callbackOnDone === 'function') {
              params.callbackOnDone(response)
            }
          }).fail(function(response, textStatus, jqXHR){

            // append a new modal
            var responseJSON = response ? response.responseJSON : null

            // if it's the invalid token request error and the iframe is already open
            // don't show the error message, complete the promise promptly
            var invalidAccessTokenError = responseJSON && responseJSON.type==="INVALID_ACCESS_TOKEN"
            var iframeIsShown = $('#fsbModal').data('bs.modal') && $('#fsbModal').data('bs.modal').isShown
            if(invalidAccessTokenError && iframeIsShown) {
              defer.reject()
              return
            }

            scope.$el.append(
              template.errorModal.render(responseJSON)
            )

            // when the modal gets closed, complete the promise,
            // this will let the other queued up ajax requests fire off
            scope.$el.find('.js-rmg-modal--error').modal('show').on('hide.bs.modal', function onErrorPopUpClose(e) {

              $(e.currentTarget).remove()
              defer.reject()
              if (typeof params.callbackOnFail === 'function') {
                params.callbackOnFail(responseJSON)
              }
              if(!iframeIsShown && invalidAccessTokenError) { // check if the iframe isn't open already
                readAndSetIFrameURLFromDOM()
                showFsbLogin()
              }
            })
          })

        }).promise()

        // when the promise completes, trigger the next one in queue
        _promise.always(function (d){

          requestsPromises.shift()
          if(requestsPromises.length) {
            requestsPromises[0]()
          }

        })
      }
      console.log("requestsPromises", requestsPromises);
      // check if a promise with the same URL does not already exist
      if ( requestsPromises.filter(function findSameRequests(_promise){
        return ajaxObj.url === _promise.url
      }).length === 0 ) {

        // queue up the new promise
        promiseWrapper.url = ajaxObj.url
        requestsPromises.push(promiseWrapper)
        // if there aren't any other queued up promises simply fire the one just created
        if (requestsPromises.length === 1) {
          requestsPromises[0]()
        }

      }

    }

  })(this, data)

  // Public Functions
  this.init = function (data) {

    // Wipe any state that was calculated for previous data
    initState()

    // If score is null change to 0 for user to see score
    if(data.score && data.score.team1.score === null){
      data.score.team1.score = 0
    }
    if(data.score && data.score.team2.score === null){
      data.score.team2.score = 0
    }
    if(data.score && data.score.team1.halfTime === ''){
      data.score.showHalfTime = false
    }
    // determine match status for view
    if(isLive(data.matchStatus)){
      data.isLive = true
    } else {
      data.isLive = false
    }
    if(isUpcoming(data.matchStatus)){
      data.isUpcoming = true
    } else {
      data.isUpcoming = false
    }
    if(isPostponed(data.matchStatus)){
      data.isPostponed = true
    } else {
      data.isPostponed = false
    }
    if(isFullTime(data.matchStatus)){
      data.isFullTime = true
    } else {
      data.isFullTime = false
    }
    this.$el = userOptions.el
    data.score.commentary = parseCommentary(data.score.commentary)


    // to-do these three if branches can be combined no need to test for data.user 3 times
    if(data.user) {
      data.user.is_rmg_registered = $('.js-rmg-switch').data('fsbregistered')
    }

    // enable real money gambling option?
    // if data.rmg.enabled === true this means
    // that the user CAN switch on real money gambling
    // when they are PLAYING real money gambling data.user.gameType === 'rmg'
    if(data.rmg && data.rmg.enabled && data.user && data.user.gameType === 'coins' && data.user.is_rmg_registered === 'unregistered')
    {
      FanbookzHeader.showRmgEnabled()
      this.bindModalEvents()
    }

    if(data.user && data.user.is_rmg_registered !== 'unregistered')
    {
      FanbookzHeader.showRmgMenu(data.user.gameType)
      this.bindModalMenuEvents()
      FanbookzHeader.subscribeMatchWidget(this) // navbar needs a pointer to matchwidget for switch
    }

    // to do - fix this whole section of if/thens
    if(data.user && data.user.gameType === 'rmg')
    {
      updateAndGetBalanceFromFSB()
      getBalanceFromCache()
    }

  }
  // unescape comment html
  if(data.mostPopularComment){
    data.mostPopularComment = $('<div/>').html(data.mostPopularComment).text()
  }
  this.render = function () {

    // Render base template
    calculatePercentages()
    // Calculate coins from bet data
    calculateCoins()
    calculateCountdown()

    // render base
    this.$el.html(template.base.render(this.data))

    this.delegateEvents()

    createTeamNameClasses(data)

    // Render match status
    buildView()
    renderFanzone()

    // Get match from server if upcoming or live
    if (data.widgetFormat !== 'mpu' && ( isLive(data.matchStatus) || isUpcoming(data.matchStatus) )){
      setTimeout(getMatchData, getMatchUpdateSpeed())
    }

    if (typeof state.commentaryListHeight === 'undefined') {
      state.commentaryListHeight = this.$el.find('.js-match-live-commentary-list').outerHeight()
    }

    if (typeof state.headerHeight === 'undefined') {
      state.headerHeight = $('.js-header').outerHeight()
    }
  }

  /**
   * public method called from the rmg toggle switch in the navbar
   * @return {[type]} [description]
   */
  this.turnRmgOff = function(defer) {

    var callbackOnFail = function() { defer.reject() }
    var callback = function() {document.location.reload()} // reload page
    matchWidgetPost({
      endPointName: 'gameTypeCoins',
      callbackOnDone: callback,
      callbackOnFail: callbackOnFail
    })

  }

  /**
   * public method called from the rmg toggle switch in the navbar
   * @return {[type]} [description]
   */
  this.turnRmgOn = function(defer) {

    var callbackOnFail = function() { defer.reject() }
    var callback = function() {document.location.reload()} // reload page
    matchWidgetPost({
      endPointName: 'gameTypeRmg',
      callbackOnDone: callback,
      callbackOnFail: callbackOnFail
    })

  }


  /**
   * this is a bit of a construction zone right now. - James
   * strategy is we clone delegate events - the 350 line method
   * and create 2 versions. a Fanbooks Coins version (fzc_delegateEvents)  and a
   * real money gambling version (rmg_delegateEvents) when we know that they both work we can try
   * refactor out the duplication but lets make it work first, without breaking the old one.
   */

  this.rmg_delegateEvents = function() {
    var scope = this
    // GA Tracking
    this.$el.find('[data-track]').on('click',function () {
      var attribute = $(this).attr('data-track')
      FanbookzGATracker.Send(attribute)
    })

    this.$el.find('.js-open-modal-at').off('click').on('click',function(e){
      e.preventDefault();
      e.stopPropagation();
      var classes = $(e.currentTarget).attr('class');
      var pageName = classes.match(/(js-at-page-)([\w-]+)/)[2];
      openModalAt(pageName)
    })

    /* state: initial outcome prectictable / unpredicted */

    /**
     * this stake menu handler really only needs to be here once
     * but at the moment there is no way we can say 'reload the current predictioin status template'
     * but we should refactor so there is - also for match status - and lift all dom manipulation
     * out of these event handlers
     */
    this.$el.find('.js-match__stake-menu-unpredicted').off('click').on('click', function(e) {
      changeStake(e.target.hash)
      var view = template.predictionStatus.upcomingUnpredicted.render(data)
      scope.$el.find('.js-match-widget__prediction-status').html(view)
      scope.$el.find('.js-match__outcome--animated').animate( {'opacity':1 } ) // annoying
      scope.delegateEvents()
    })
    this.$el.find('.js-match__home-win').on('click', function () {
      data.predictScoreWinnings = data.coins["1:0"]
      var view = template.predictionStatus.confirmHome.render(data)
      scope.$el.find('.js-match-widget__prediction-status').html(view)
      scope.delegateEvents()
      scope.$el.removeClass('match-widget--animated')
      // if we're dealing with the mpu widget there's some differences
      if(data.widgetFormat === 'mpu') {
        // n.b. don't forget to remove this class if user clicks back
        scope.$el.find('.match__outcome__odds').addClass('match__outcome__odds--show').removeClass('match__outcome__odds')
        scope.$el.find('.match__prediction__bar__crowd__writing').addClass('hidden')
      }
      changeHeader(scope.$el.find('.js-match__prompt--team1_win'))
    })
    this.$el.find('.js-match__away-win').on('click', function () {
      data.predictScoreWinnings = data.coins["0:1"]
      var view = template.predictionStatus.confirmAway.render(data)
      scope.$el.find('.js-match-widget__prediction-status').html(view)
      scope.delegateEvents()
      scope.$el.removeClass('match-widget--animated')
      // if we're dealing with the mpu widget there's some differences
      if(data.widgetFormat === 'mpu') {
        // n.b. don't forget to undo this clicks back
        scope.$el.find('.match__outcome__odds').addClass('match__outcome__odds--show').removeClass('match__outcome__odds')
        scope.$el.find('.match__prediction__bar__crowd__writing').addClass('hidden')
      }
      changeHeader(scope.$el.find('.js-match__prompt--team2_win'))
    })
    this.$el.find('.js-match__draw').on('click', function () {
      data.predictScoreWinnings = data.coins["0:0"]
      var view = template.predictionStatus.confirmDraw.render(data)
      scope.$el.find('.js-match-widget__prediction-status').html(view)
      scope.delegateEvents()
      scope.$el.removeClass('match-widget--animated')
      // if we're dealing with the mpu widget there's some differences
      if(data.widgetFormat === 'mpu') {
        // n.b. don't forget to undo this if user clicks back
        scope.$el.find('.match__outcome__odds').addClass('match__outcome__odds--show').removeClass('match__outcome__odds')
        scope.$el.find('.match__prediction__bar__crowd__writing').addClass('hidden')
      }
      changeHeader(scope.$el.find('.js-match__prompt--draw'))
    })
    /* end initial outcome prectictable / unpredicted */


    /* state: confirm home */
    this.$el.find('.js-match__stake-menu-confirm-home').off('click').on('click', function(e) {
      changeStake(e.target.hash)
      data.predictScoreWinnings = data.coins["1:0"]
      var view = template.predictionStatus.confirmHome.render(data)
      scope.$el.find('.js-match-widget__prediction-status').html(view)
      scope.$el.find('.js-match__outcome--animated').animate( {'opacity':1 } ) // annoying
      scope.delegateEvents()
    })

    var makeBet = function(e, newBetOddsId, stake, payload) {

      // change text to give a visual indication
      var originalText = $(e.currentTarget).html()
      $(e.currentTarget).text( template.predictionStatus.submitting.render(data) )

      var callbackOnDone = function() {
        buildView()
        renderFanzone()
      }
      var callbackOnFail = function() {
        $(e.currentTarget).html(originalText)
      }
      var urlParams = '/' + stake + '/' + newBetOddsId

      matchWidgetPost({
        endPointName: 'submitBet'
        , callbackOnDone: callbackOnDone
        , callbackOnFail: callbackOnFail
        , payload: payload
        , urlParams: urlParams
      })

    }

    this.$el.find('.js-match__home-win__predict-score').on('click', function () {
      scope.data.prediction =
        { team1: 1
        , team2: 0
        , outcome: 'team1'
        , stake: scope.data.prediction.stake
        , status: 'predicted-outcome'
        , coins: data.coins['team1']
        , WDW:  true
        , quote:  data.odds['team1'].odds
        }
      var view = template.matchStatus.score.render(data)
      scope.$el.find('.js-match-widget__match-status').html(view)
      updateCountdown()
      if (data.coins[scope.data.prediction.team1+':'+scope.data.prediction.team2] != undefined) {
        scope.data.prediction.winnings = calculateScoreCoins(scope.data.prediction.team1, scope.data.prediction.team2)
      }
      // change prediction status view
      var view = template.predictionStatus.upcomingOutcomePredicted.render(data)
      scope.$el.find('.js-match-widget__prediction-status').html(view)
      disableScoreButtons()
      changeHeader(scope.$el.find('.js-match__prompt--predict-score'))
      scope.delegateEvents()
    })

    this.$el.find('.js-match__home-win__confirm').on('click', function (e) {

      scope.data.prediction =
      { team1: undefined
        , team2: undefined
        , outcome: 'team1'
        , stake: scope.data.prediction.stake
        , status: 'predicted'
        , coins: data.coins['team1']
        , WDW:  true
        , quote:  data.odds['team1'].odds
        , winnings : data.coins['team1']
        , predictedTeam : data.teams.team1.name
      }

      // get ready to make bet
      var newBetOddsId = scope.data.odds.team1.oddsId
      var stake = scope.data.prediction.stake
      makeBet(e, newBetOddsId, stake)

    })



    /* state: confirm away */
    this.$el.find('.js-match__stake-menu-confirm-away').off('click').on('click', function(e) {
      changeStake(e.target.hash)
      data.predictScoreWinnings = data.coins["0:1"]
      var view = template.predictionStatus.confirmAway.render(data)
      scope.$el.find('.js-match-widget__prediction-status').html(view)
      scope.$el.find('.js-match__outcome--animated').animate( {'opacity':1 } ) // annoying
      scope.delegateEvents()
    })

    this.$el.find('.js-match__away-win__predict-score').on('click', function () {
      scope.data.prediction =
        { team1: 0
        , team2: 1
        , outcome: 'team2'
        , stake: scope.data.prediction.stake
        , status: 'predicted-outcome'
        , coins: data.coins['team2']
        , WDW:  true
        , quote:  data.odds['team2'].odds
        , winnings : data.coins['team2']
        , predictedTeam : data.teams.team2.name
        }
      var view = template.matchStatus.score.render(data)
      scope.$el.find('.js-match-widget__match-status').html(view)
      updateCountdown()
      if (data.coins[scope.data.prediction.team1+':'+scope.data.prediction.team2] != undefined) {
        scope.data.prediction.winnings = calculateScoreCoins(scope.data.prediction.team1, scope.data.prediction.team2)
      }
      // change prediction status view
      var view = template.predictionStatus.upcomingOutcomePredicted.render(data)
      scope.$el.find('.js-match-widget__prediction-status').html(view)
      disableScoreButtons()
      changeHeader(scope.$el.find('.js-match__prompt--predict-score'))
      scope.delegateEvents()
    })

    this.$el.find('.js-match__away-win__confirm').on('click', function (e) {
      scope.data.prediction =
        { team1: undefined
        , team2: undefined
        , outcome: 'team2'
        , stake: scope.data.prediction.stake
        , status: 'predicted'
        , coins: data.coins['team2']
        , WDW:  true
        , quote:  data.odds['team2'].odds
        , winnings : data.coins['team2']
        , predictedTeam : data.teams.team2.name
        }

        // get ready to make bet
        var newBetOddsId = scope.data.odds.team2.oddsId
        var stake = scope.data.prediction.stake
        makeBet(e, newBetOddsId, stake)

    })

    /* state: confirm draw */
    this.$el.find('.js-match__stake-menu-confirm-draw').off('click').on('click', function(e) {
      changeStake(e.target.hash)
      data.predictScoreWinnings = data.coins["0:0"]
      var view = template.predictionStatus.confirmDraw.render(data)
      scope.$el.find('.js-match-widget__prediction-status').html(view)
      scope.$el.find('.js-match__outcome--animated').animate( {'opacity':1 } ) // annoying
      scope.delegateEvents()
    })
    // Draw outcome confirmation btns
    this.$el.find('.js-match__draw-win__predict-score').on('click', function () {
      // if we're dealing with the mpu widget there's some differences
      if(data.widgetFormat === 'mpu') {
        scope.$el.find('.match__team__home').addClass('hidden')
        scope.$el.find('.match__team__away').addClass('hidden')
        scope.$el.find('.match__vs').addClass('hidden')
        scope.$el.find('.match__skip').addClass('hidden')
      }
      scope.data.prediction =
        { team1: 0
        , team2: 0
        , outcome: 'draw'
        , stake: scope.data.prediction.stake
        , status: 'predicted-outcome'
        , coins: data.coins['draw']
        , WDW:  true
        , quote:  data.odds['draw'].odds
        }
      var view = template.matchStatus.score.render(data)
      scope.$el.find('.js-match-widget__match-status').html(view)
      updateCountdown()
      if (data.coins[scope.data.prediction.team1+':'+scope.data.prediction.team2] != undefined) {
        scope.data.prediction.winnings = calculateScoreCoins(scope.data.prediction.team1, scope.data.prediction.team2)
      }
      // change prediction status view
      var view = template.predictionStatus.upcomingOutcomePredicted.render(data)
      scope.$el.find('.js-match-widget__prediction-status').html(view)
      disableScoreButtons()
      changeHeader(scope.$el.find('.js-match__prompt--predict-score'))
      scope.delegateEvents()
    })

    this.$el.find('.js-match__draw-win__confirm').on('click', function (e) {
      scope.data.prediction =
        { team1: undefined
        , team2: undefined
        , outcome: 'draw'
        , stake: scope.data.prediction.stake
        , status: 'predicted'
        , coins: data.coins['draw']
        , WDW:  true
        , quote:  data.odds['draw'].odds
        , winnings : data.coins['draw']
      }
      // get ready to make bet
      var newBetOddsId = scope.data.odds.draw.oddsId
      var stake = scope.data.prediction.stake
      makeBet(e, newBetOddsId, stake)

    })

    // Back to
    this.$el.find('.js-match__unconfirm').on('click', function () {
      var view = template.matchStatus.upcoming.render(data)
      scope.$el.find('.js-match-widget__match-status').html(view)
      // if we're dealing with the mpu widget there's some differences
      if(data.widgetFormat === 'mpu') {
        scope.$el.find('.match__outcome__odds--show').addClass('match__outcome__odds').removeClass('match__outcome__odds--show')
        scope.$el.find('.match__prediction__bar__crowd__writing').removeClass('hidden')
        scope.$el.find('.match__team__home').removeClass('hidden')
        scope.$el.find('.match__team__away').removeClass('hidden')
        scope.$el.find('.match__vs').removeClass('hidden')
        scope.$el.find('.match__skip').removeClass('hidden')
        scope.$el.find('.match__stake').css('display','hidden')
      }
      updateCountdown()
      var view = template.predictionStatus.upcomingUnpredicted.render(data)
      scope.$el.find('.js-match-widget__prediction-status').html(view)
      scope.delegateEvents()
      changeHeader(scope.$el.find('.js-match__prompt--initial'))
    })


    /* state: predict score */
    this.$el.find('.js-match__stake-menu-predict').off('click').on('click', function(e) {
      changeStake(e.target.hash)
      if (data.coins[scope.data.prediction.team1+':'+scope.data.prediction.team2] != undefined) {
        scope.data.prediction.winnings = calculateScoreCoins(scope.data.prediction.team1, scope.data.prediction.team2)
      }
      var view = template.predictionStatus.upcomingOutcomePredicted.render(data)
      scope.$el.find('.js-match-widget__prediction-status').html(view)
      scope.$el.find('.js-match__outcome--animated').animate( {'opacity':1 } ) // annoying
      scope.delegateEvents()
    })


    // Comments anchor button
    this.$el.find('.js-goto-anchor').on('click', function(e) {
      e.preventDefault()
      scrollToClass('.js-comment-post')
    })

    // Bind score prediction buttons
    this.$el.find('.js-match-action-score-team1-increase').on('click', function (){
      increaseScore('team1')
    })
    this.$el.find('.js-match-action-score-team1-decrease').on('click', function (){
      decreaseScore('team1')
    })
    this.$el.find('.js-match-action-score-team2-increase').on('click', function (){
      increaseScore('team2')
    })
    this.$el.find('.js-match-action-score-team2-decrease').on('click', function (){
      decreaseScore('team2')
    })

    // final submission of the bet
    this.$el.find('.js-match-action-score-prediction-predict').on('click', function (e) {
      if (data.coins[scope.data.prediction.team1+':'+scope.data.prediction.team2] != undefined) {
          var buttonsBeforeSubmitting = $(this).html()
          $(this).text(template.predictionStatus.submitting.render(data))
          scope.data.prediction.status = 'predicted'
          scope.data.prediction.WDW = false
          scope.data.prediction.team1 = (scope.data.prediction.team1 === '-') ? undefined : scope.data.prediction.team1
          scope.data.prediction.team2 = (scope.data.prediction.team2 === '-') ? undefined : scope.data.prediction.team2
          scope.data.prediction.team2 = (scope.data.prediction.team2 === '-') ? undefined : scope.data.prediction.team2


        // get ready to make bet
        var score = scope.data.prediction.team1+':'+scope.data.prediction.team2
        var newBetOddsId = scope.data.odds[score].oddsId
        var stake = scope.data.prediction.stake
        var payload = {}

        var callbackOnSuccess = function() {
          // manually build prediction confirm
          var extras =
              { yourPrediction: messages.prediction.yourPrediction()
              }
            , dataClone = _.clone(data)
            , viewData = _.extend(dataClone, extras)
          var view = template.matchStatus.predictionConfirm.render(viewData)
          scope.$el.find('.js-match-widget__match-status').html(view)
          var view = template.predictionStatus.nextFixture.render(data)
          scope.$el.find('.js-match-widget__prediction-status').html(view)
          // update header to prediction
          var teamName = ''
          switch(data.prediction.outcome){
            case 'team1':
              teamName = data.teams.team1.name
              break
            case 'team2':
              teamName = data.teams.team2.name
              break
            case 'draw':
              teamName = template.predictionStatus.messageOutcomeADraw.render(data)
              break
          }
          var textOriginal = scope.$el.find('.js-match__prompt--prediction--original').text()
            , textReplaced = textOriginal.replace('***', teamName)
          scope.$el.find('.js-match__prompt--prediction').text(textReplaced)
          // show header
          changeHeader(scope.$el.find('.js-match__prompt--prediction'))
          renderFanzone()
        }
        var callbackOnFail = function() {
          $(e.currentTarget).html(buttonsBeforeSubmitting)
        }
        var urlParams = '/' + stake + '/' + newBetOddsId

        matchWidgetPost({
          endPointName: 'submitBet',
          callbackOnDone: callbackOnSuccess,
          callbackOnFail: callbackOnFail,
          payload: payload,
          urlParams: urlParams
        })

      }
    })


    // leave rest alone it's exactly same as in fbz delagate events so we should really refactor
    this.$el.find('.js-match-live-commentary-list-toggle').on('click', function (e){
      e.preventDefault()
      if(state.commentaryListOpen){
          commentaryListContract()
          scope.$el.find('.js-match-view__live__commentary__toggle--more').show()
          scope.$el.find('.js-match-view__live__commentary__toggle--less').hide()
      } else {
          commentaryScrollToTop()
          commentaryListExpand()
          scope.$el.find('.js-match-view__live__commentary__toggle--more').hide()
          scope.$el.find('.js-match-view__live__commentary__toggle--less').show()
      }
      state.commentaryListOpen = !state.commentaryListOpen
    })
    this.$el.find('.js-match-live-tab--commentary').on('click', function(){
      if($(window).width() < 768){
        var commentaryTabTopNew = $(this).offset().top - 10
        $('html, body').animate({
          scrollTop: (commentaryTabTopNew - state.headerHeight) + 'px'
        }, 200)
      }
    })
    this.$el.find('.js-match-live-tab--match-info').on('click', function(){
      if(typeof(data.score.stats)!=='undefined'){
        drawMatchCharts(data.score.stats)
      }
    })
    $(window).resize(function(){
      if(typeof(data.score.stats)!=='undefined'){
        drawMatchCharts(data.score.stats)
      }
    })

  } // end rmg_deletage events





  /**
   * below is the FZC (non real money gambling) delagate events which
   * you should not change.
   */
  this.fzc_delegateEvents = function () {
    var scope = this

    // GA Tracking
    this.$el.find('[data-track]').on('click',function () {
      var attribute = $(this).attr('data-track')
      FanbookzGATracker.Send(attribute)
    })

    // Skip to next predicted match - using off() to prevent multiple click handlers
    // only used in mpu
    this.$el.find('.js-match__skip').off('click').on('click', function (e) {
      afterSubmitMPU('skip')
      return false
    })

    // Initial outcome prediction events
    this.$el.find('.js-match__home-win').on('click', function () {
      data.predictScoreWinnings = data.coins["1:0"]
      var view = template.predictionStatus.confirmHome.render(data)
      scope.$el.find('.js-match-widget__prediction-status').html(view)
      scope.delegateEvents()
      scope.$el.removeClass('match-widget--animated')
      // if we're dealing with the mpu widget there's some differences
      if(data.widgetFormat === 'mpu') {
        // n.b. don't forget to remove this class if user clicks back
        scope.$el.find('.match__outcome__odds').addClass('match__outcome__odds--show').removeClass('match__outcome__odds')
        scope.$el.find('.match__prediction__bar__crowd__writing').addClass('hidden')
      }
      changeHeader(scope.$el.find('.js-match__prompt--team1_win'))
    })
    this.$el.find('.js-match__away-win').on('click', function () {
      data.predictScoreWinnings = data.coins["0:1"]
      var view = template.predictionStatus.confirmAway.render(data)
      scope.$el.find('.js-match-widget__prediction-status').html(view)
      scope.delegateEvents()
      scope.$el.removeClass('match-widget--animated')
      // if we're dealing with the mpu widget there's some differences
      if(data.widgetFormat === 'mpu') {
        // n.b. don't forget to undo this clicks back
        scope.$el.find('.match__outcome__odds').addClass('match__outcome__odds--show').removeClass('match__outcome__odds')
        scope.$el.find('.match__prediction__bar__crowd__writing').addClass('hidden')
      }
      changeHeader(scope.$el.find('.js-match__prompt--team2_win'))
    })
    this.$el.find('.js-match__draw').on('click', function () {
      data.predictScoreWinnings = data.coins["0:0"]
      var view = template.predictionStatus.confirmDraw.render(data)
      scope.$el.find('.js-match-widget__prediction-status').html(view)
      scope.delegateEvents()
      scope.$el.removeClass('match-widget--animated')
      // if we're dealing with the mpu widget there's some differences
      if(data.widgetFormat === 'mpu') {
        // n.b. don't forget to undo this if user clicks back
        scope.$el.find('.match__outcome__odds').addClass('match__outcome__odds--show').removeClass('match__outcome__odds')
        scope.$el.find('.match__prediction__bar__crowd__writing').addClass('hidden')
      }
      changeHeader(scope.$el.find('.js-match__prompt--draw'))
    })

    // Home win outcome confirmation btns
    this.$el.find('.js-match__home-win__predict-score').on('click', function () {
      // if we're dealing with the mpu widget there's some differences
      if(data.widgetFormat === 'mpu') {
        scope.$el.find('.match__team__home').addClass('hidden')
        scope.$el.find('.match__team__away').addClass('hidden')
        scope.$el.find('.match__vs').addClass('hidden')
        scope.$el.find('.match__skip').addClass('hidden')
      }
      scope.data.prediction =
        { team1: 1
        , team2: 0
        , outcome: 'team1'
        , stake: scope.data.prediction.stake
        , status: 'predicted-outcome'
        , coins: data.coins['team1']
        , WDW:  true
        , quote:  data.odds['team1'].odds
        }

      var view = template.matchStatus.score.render(data)
      scope.$el.find('.js-match-widget__match-status').html(view)
      updateCountdown()
      if (data.coins[scope.data.prediction.team1+':'+scope.data.prediction.team2] != undefined) {
        scope.data.prediction.winnings = calculateScoreCoins(scope.data.prediction.team1, scope.data.prediction.team2)
      }
      var view = template.predictionStatus.upcomingOutcomePredicted.render(data)
      scope.$el.find('.js-match-widget__prediction-status').html(view)
      scope.$el.find('.match__stake').css('display','inline-block') // only effects MPU version
      disableScoreButtons()
      changeHeader(scope.$el.find('.js-match__prompt--predict-score'))
      scope.delegateEvents()
    })
    this.$el.find('.js-match__home-win__confirm').on('click', function () {
      scope.data.prediction =
        { team1: undefined
        , team2: undefined
        , outcome: 'team1'
        , stake: scope.data.prediction.stake
        , status: 'predicted'
        , coins: data.coins['team1']
        , WDW:  true
        , quote:  data.odds['team1'].odds
        , winnings : data.coins['team1']
        , predictedTeam : data.teams.team1.name
        }

      if(data.widgetFormat === 'mpu') {
        // do this if we're looking at mpu predictor
        submitPrediction(function(){
          afterSubmitMPU()
        })
      } else {
        submitPrediction(function(){
          buildView()
          renderFanzone()
        })
      }  // end if

    })

    // Away win outcome confirmation btns
    this.$el.find('.js-match__away-win__predict-score').on('click', function () {
      // if we're dealing with the mpu widget there's some differences
      if(data.widgetFormat === 'mpu') {
        scope.$el.find('.match__team__home').addClass('hidden')
        scope.$el.find('.match__team__away').addClass('hidden')
        scope.$el.find('.match__vs').addClass('hidden')
        scope.$el.find('.match__skip').addClass('hidden')
      }
      scope.data.prediction =
        { team1: 0
        , team2: 1
        , outcome: 'team2'
        , stake: scope.data.prediction.stake
        , status: 'predicted-outcome'
        , coins: data.coins['team2']
        , WDW:  true
        , quote:  data.odds['team2'].odds
        , winnings : data.coins['team2']
        , predictedTeam : data.teams.team2.name
        }
      var view = template.matchStatus.score.render(data)
      scope.$el.find('.js-match-widget__match-status').html(view)
      updateCountdown()
      if (data.coins[scope.data.prediction.team1+':'+scope.data.prediction.team2] != undefined) {
        scope.data.prediction.winnings = calculateScoreCoins(scope.data.prediction.team1, scope.data.prediction.team2)
      }
      var view = template.predictionStatus.upcomingOutcomePredicted.render(data)
      scope.$el.find('.js-match-widget__prediction-status').html(view)
      scope.$el.find('.match__stake').css('display','inline-block') // only effects MPU version
      disableScoreButtons()
      changeHeader(scope.$el.find('.js-match__prompt--predict-score'))
      scope.delegateEvents()
    })
    this.$el.find('.js-match__away-win__confirm').on('click', function () {
      scope.data.prediction =
        { team1: undefined
        , team2: undefined
        , outcome: 'team2'
        , stake: scope.data.prediction.stake
        , status: 'predicted'
        , coins: data.coins['team2']
        , WDW:  true
        , quote:  data.odds['team2'].odds
        , winnings : data.coins['team2']
        , predictedTeam : data.teams.team2.name
        }

      if(data.widgetFormat === 'mpu') {
        // do this if we're looking at mpu predictor
        submitPrediction(function(){
          afterSubmitMPU()
        })
      } else {
        submitPrediction(function(){
          buildView()
          renderFanzone()
        })
      }  // end if
    })

    // Draw outcome confirmation btns
    this.$el.find('.js-match__draw-win__predict-score').on('click', function () {
      // if we're dealing with the mpu widget there's some differences
      if(data.widgetFormat === 'mpu') {
        scope.$el.find('.match__team__home').addClass('hidden')
        scope.$el.find('.match__team__away').addClass('hidden')
        scope.$el.find('.match__vs').addClass('hidden')
        scope.$el.find('.match__skip').addClass('hidden')
      }
      scope.data.prediction =
        { team1: 0
        , team2: 0
        , outcome: 'draw'
        , stake: scope.data.prediction.stake
        , status: 'predicted-outcome'
        , coins: data.coins['draw']
        , WDW:  true
        , quote:  data.odds['draw'].odds
        }
      var view = template.matchStatus.score.render(data)
      scope.$el.find('.js-match-widget__match-status').html(view)
      updateCountdown()
      if (data.coins[scope.data.prediction.team1+':'+scope.data.prediction.team2] != undefined) {
        scope.data.prediction.winnings = calculateScoreCoins(scope.data.prediction.team1, scope.data.prediction.team2)
      }
      var view = template.predictionStatus.upcomingOutcomePredicted.render(data)
      scope.$el.find('.js-match-widget__prediction-status').html(view)
      disableScoreButtons()
      changeHeader(scope.$el.find('.js-match__prompt--predict-score'))
      scope.delegateEvents()
    })
    this.$el.find('.js-match__draw-win__confirm').on('click', function () {
      scope.data.prediction =
      { team1: undefined
      , team2: undefined
      , outcome: 'draw'
      , stake: scope.data.prediction.stake
      , status: 'predicted'
      , coins: data.coins['draw']
      , WDW:  true
      , quote:  data.odds['draw'].odds
      , winnings : data.coins['draw']
      }

      if(data.widgetFormat === 'mpu') {

        // do this if we're looking at mpu predictor
        submitPrediction(function(){
          afterSubmitMPU()
        })

      } else {

        submitPrediction(function(){
          buildView()
          renderFanzone()
        })

      }  // end if
    })

    // Back to
    this.$el.find('.js-match__unconfirm').on('click', function () {
      var view = template.matchStatus.upcoming.render(data)
      scope.$el.find('.js-match-widget__match-status').html(view)
      // if we're dealing with the mpu widget there's some differences
      if(data.widgetFormat === 'mpu') {
        scope.$el.find('.match__outcome__odds--show').addClass('match__outcome__odds').removeClass('match__outcome__odds--show')
        scope.$el.find('.match__prediction__bar__crowd__writing').removeClass('hidden')
        scope.$el.find('.match__team__home').removeClass('hidden')
        scope.$el.find('.match__team__away').removeClass('hidden')
        scope.$el.find('.match__vs').removeClass('hidden')
        scope.$el.find('.match__skip').removeClass('hidden')
        scope.$el.find('.match__stake').css('display','hidden')
      }
      updateCountdown()
      var view = template.predictionStatus.upcomingUnpredicted.render(data)
      scope.$el.find('.js-match-widget__prediction-status').html(view)
      scope.delegateEvents()
      changeHeader(scope.$el.find('.js-match__prompt--initial'))
    })

    // Outcome confirmation btns

    // Stake increase/decrease buttons
    this.$el.find('.js-match-stake__increase').on('click', function (){
      scope.data.prediction.stake = scope.data.prediction.stake + 1
      scope.$el.find('.js_match__stake').text(scope.data.prediction.stake)
    })
    this.$el.find('.js-match-stake__decrease').on('click', function (){
      if(scope.data.prediction.stake > 1){
        scope.data.prediction.stake = scope.data.prediction.stake - 1
        scope.$el.find('.js_match__stake').text(scope.data.prediction.stake)
      }
    })

    // Comments anchor button
    this.$el.find('.js-goto-anchor').on('click', function(e) {
      e.preventDefault()
      scrollToClass('.js-comment-post')
    })

    // Bind score prediction buttons
    this.$el.find('.js-match-action-score-team1-increase').on('click', function (){
      increaseScore('team1')
    })
    this.$el.find('.js-match-action-score-team1-decrease').on('click', function (){
      decreaseScore('team1')
    })
    this.$el.find('.js-match-action-score-team2-increase').on('click', function (){
      increaseScore('team2')
    })
    this.$el.find('.js-match-action-score-team2-decrease').on('click', function (){
      decreaseScore('team2')
    })
    this.$el.find('.js-match-action-score-prediction-predict').on('click', function () {
      if (data.coins[scope.data.prediction.team1+':'+scope.data.prediction.team2] != undefined) {
          $(this).text(template.predictionStatus.submitting.render(data))
          scope.data.prediction.status = 'predicted'
          scope.data.prediction.WDW = false
          scope.data.prediction.team1 = (scope.data.prediction.team1 === '-') ? undefined : scope.data.prediction.team1
          scope.data.prediction.team2 = (scope.data.prediction.team2 === '-') ? undefined : scope.data.prediction.team2
          scope.data.prediction.team2 = (scope.data.prediction.team2 === '-') ? undefined : scope.data.prediction.team2

          if(data.widgetFormat === 'mpu') {
            // do this if we're looking at mpu predictor
            submitPrediction(function(){
              afterSubmitMPU()
            })
          } else {
            // do this if we're looking at fullscreen predictor
            submitPrediction(function(){
              // buildView()
              // manually build prediction confirm
              var extras =
                  { yourPrediction: messages.prediction.yourPrediction()
                  }
                , dataClone = _.clone(data)
                , viewData = _.extend(dataClone, extras)
              var view = template.matchStatus.predictionConfirm.render(viewData)
              scope.$el.find('.js-match-widget__match-status').html(view)
              var view = template.predictionStatus.nextFixture.render(data)
              scope.$el.find('.js-match-widget__prediction-status').html(view)
              // update header to prediction
              var teamName = ''
              switch(data.prediction.outcome){
                case 'team1':
                  teamName = data.teams.team1.name
                  break
                case 'team2':
                  teamName = data.teams.team2.name
                  break
                case 'draw':
                  teamName = template.predictionStatus.messageOutcomeADraw.render(data)
                  break
              }
              var textOriginal = scope.$el.find('.js-match__prompt--prediction--original').text()
                , textReplaced = textOriginal.replace('***', teamName)
              scope.$el.find('.js-match__prompt--prediction').text(textReplaced)
              // show header
              changeHeader(scope.$el.find('.js-match__prompt--prediction'))
              renderFanzone()
            })

        }   // end if widget
      }
    })
    this.$el.find('.js-match-live-commentary-list-toggle').on('click', function (e){
      e.preventDefault()
      if(state.commentaryListOpen){
          commentaryListContract()
          scope.$el.find('.js-match-view__live__commentary__toggle--more').show()
          scope.$el.find('.js-match-view__live__commentary__toggle--less').hide()
      } else {
          commentaryScrollToTop()
          commentaryListExpand()
          scope.$el.find('.js-match-view__live__commentary__toggle--more').hide()
          scope.$el.find('.js-match-view__live__commentary__toggle--less').show()
      }
      state.commentaryListOpen = !state.commentaryListOpen
    })
    this.$el.find('.js-match-live-tab--commentary').on('click', function(){
      if($(window).width() < 768){
        var commentaryTabTopNew = $(this).offset().top - 10
        $('html, body').animate({
          scrollTop: (commentaryTabTopNew - state.headerHeight) + 'px'
        }, 200)
      }
    })
    this.$el.find('.js-match-live-tab--match-info').on('click', function(){
      if(typeof(data.score.stats)!=='undefined'){
        drawMatchCharts(data.score.stats)
      }
    })
    $(window).resize(function(){
      if(typeof(data.score.stats)!=='undefined'){
        drawMatchCharts(data.score.stats)
      }
    })
  }    // end fzc_deletage events

  /**
   * this public method is sent to the window.passAccessToken
   * to recieve the token from fsb
   */
  this.recieveRegistrationToken = function(token){
    var payload = {accessToken: token}
    clearModalEvents()
    // to do define a callback and send it
    matchWidgetPost({
      endPointName: 'sendToken',
      callbackOnDone: turnRmgOn,
      payload: payload
    })
  }

  this.recieveLoginToken = function(token){
    var payload = {accessToken: token}

    // to do define a callback and send it
    matchWidgetPost({
      endPointName: 'sendToken',
      callbackOnDone: null,
      payload: payload
    })
  }

  /**
   * this binds en events to the bootstrapmodal so that it can pass in the user email
   * to do  -- maybe cache the jQuery pointer to the modal
   */
  this.bindModalEvents = function() {
    // pass call back to window.passAccessToken
    window.passAccessToken(null,this.recieveRegistrationToken)

    $('#fsbModal').on('show.bs.modal',function(e){
      var triggerButton = $(e.relatedTarget)
      if( triggerButton.data('fsbregistered') !== 'unregistered' ) { // is user registered?
        callback = function() {document.location.reload()}
        matchWidgetPost({
          endPointName: 'gameTypeRmg',
          callbackOnDone: callback
        })
        return false
      }
      // user isn't registered so proceed to open modal for registration
      var email  = triggerButton.data('email')
      var iframe = $(this).find('.header__modal--rmg-account-iframe')
      var src    = triggerButton.data('baseurl')+"register/?email=" + email
      src += '&languageId='+triggerButton.data('languageid')
      iframe.attr({src: src});
      // debug
      console.log($('.header__modal--rmg-account-iframe').attr('src'))
    })
  }

  this.bindModalMenuEvents = function() {
        // this next line was a quick fix there may be a more sensible place for this

    window.passAccessToken(null,this.recieveLoginToken)
    $('#fsbModal').on('show.bs.modal',function(e){
      var iframe = $(this).find('.header__modal--rmg-account-iframe')
      var url = e.relatedTarget ? e.relatedTarget.href : iframe.attr('src') // this could be improved? if we triggered iframe opening with javascript there is no related target
      iframe.attr({src: url});
    })

    $('#fsbModal').on('hide.bs.modal',function(e){
      updateAndGetBalanceFromFSB()
    })
  }

  window.closeFSBModal = function() {
    $('#fsbModal').modal('hide')
  }

  // switch between the delegateEvents method depending on whther real money gambling is enabled
  this.delegateEvents = this.data.user && this.data.user.gameType === 'rmg' ? this.rmg_delegateEvents : this.fzc_delegateEvents

  template = loadTemplates()  // assign a value to the template local variable

  this.getCoins = function (prediction) {
    return data.coins[prediction]
  }
  this.getCountdown = function () {
    return data.countdown
  }
  this.setOptions(userOptions)

  this.init(data)
}
