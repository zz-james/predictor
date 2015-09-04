/**
 * view component that handles the element above the prediction buttons
 * @param  {jQuery object} element - the DOM element controlled
 * @param  {object} options object ...
 */
MatchStatusView = function(element, options) {
  this.$el = element
  var scope=this
      ,currentState    = options.initialState
      ,model           = options.model
      ,eventDispatcher = EventDispatcher.getInstance()
      ,template        = {
          upcoming: Hogan.compile($('.temp__match-status__upcoming').html())
        , PreMatch: Hogan.compile($('.temp__match-status__upcoming').html())
        , live: Hogan.compile($('.temp__match-status__live').html())
        , FullTime: Hogan.compile($('.temp__match-status__fulltime').html())
        , Postponed: Hogan.compile($('.temp__match-status__postponed').html())
        , predictionConfirm: Hogan.compile($('.temp__prediction-confirm').html())
       }
      ,hasCountdownRunning = false
      ,isStopped = false
      ,$team1goals = $('.js-match__team1-goals')
      ,$team2goals = $('.js-match__team2-goals') // todo: we should make a view for these as they're not really in scope for this view

  if(model.user && model.user.gameType === 'rmg')  {
    template.predictionConfirm = Hogan.compile($('.temp__rmg-prediction-confirm').html())
  }

  /* ------------------ model listeners ------------------ */
  model.on('matchStateChange', matchStateChange)
  model.on('updateMatchClock', updateMatchClock)
  model.on('renderScore' , renderScore)
  model.on('renderGoals' , renderGoals)
  model.on('matchStateReset', matchStateReset)
  model.on('updateCountdown', updateCountdown)


  /* ------------------- public methods ------------------- */
  this.render = function(templateName) {
    if(!templateName) {templateName = currentState}
    var html = template[templateName].render(model)
    element.html(html)
    return this
  }

  this.initialise = function() {
    if(currentState == 'FullTime') {
      renderGoals(model.score)
    }
    if(model.isPredictable() && currentState == 'PreMatch' && model.user) {

      if(model.user.gameType === 'rmg') {
        new RmgStakeView(scope.$el.find('.js_stake_holder'), {
            model: model
        }).render().initialise()
      } else {
        new CoinsStakeView(this.$el.find('.js_stake_holder'), {
          model: model
        }).render().initialise()
      }

    }
    updateCountdown()
    return this
  }

  this.clearTimer = function() {
    isStopped = true
    this.$el.empty() //ultimately we should just remove the timer element
    return this

  }

  /* ----------------- private functions ------------------ */

  // this is here to put back the clock when you hit back from the score prediction display
  function matchStateReset() {
    scope.render()
    scope.initialise()
    updateCountdown()
  }


  function matchStateChange(matchStatus) {
    if(currentState === matchStatus) { return } // don't rerender if state is not changed

    // to-do build a score prediction view rather than use
    // match status view to handle the score prediction ui
    if(model.prediction.status === "scorePrediction" ||
       model.prediction.status === "confirmHome"     ||
       model.prediction.status === "confirmAway"     ||
       model.prediction.status === "confirmDraw" ) { return } // match status view is currently overtaken rendering predict score

    if(model.isLive()) {
      matchStatus = 'live'
    }
    scope.render(matchStatus)
    updateCountdown()
  }

  function updateCountdown() {
    model.calculateCountdown()
    // timer has 3 cols shows seconds and hides days when kick off < 24hrs away
    if(model.countdown.days) {
      scope.$el.find('.js-match-countdown__secs').parent().addClass('hidden')
    } else {
      scope.$el.find('.js-match-countdown__days').parent().addClass('hidden')
    }

    // all clock nos are zero padded to 2 sig fig
    var textDays = ('0'+model.countdown.days).slice(-2)
    var textHrs  = ('0'+model.countdown.hrs).slice(-2)
    var textMins = ('0'+model.countdown.mins).slice(-2)
    var textSecs = ('0'+model.countdown.secs).slice(-2)

    scope.$el.find('.js-match-countdown__days').text(textDays)
    scope.$el.find('.js-match-countdown__hrs').text(textHrs)
    scope.$el.find('.js-match-countdown__mins').text(textMins)
    scope.$el.find('.js-match-countdown__secs').text(textSecs)
    if(!isStopped && !hasCountdownRunning){
      hasCountdownRunning = true
      setTimeout(function () {
        hasCountdownRunning = false
        updateCountdown()
      }, 1000)
    }
  }


  // ---------- live stuff -------------- //


  function updateMatchClock() {
    scope.$el.find('.js-match__outcome__clock--live').text(model.clock.minutes)
  }

  function renderScore(data) {
    scope.$el.find('.js-match__outcome__score--home').html(data.team1.score | 0) // cast to int
    scope.$el.find('.js-match__outcome__score--away').html(data.team2.score | 0) // if value is null becomes 0
  }

  /**
   * this needs to move, but it is not urgent
   * @param  {object} response - data from matchevents end point
   */
  function renderGoals(response) {

    // make a view with these elements in scope
    $team1goals.html('')
    $team2goals.html('')

    if(response.team1.goals.length > 0){
      response.team1.goals.forEach(function (goal, index, array) {
        switch(goal.type){
          case 'Goal':
            $team1goals.append('<li class="match__live__goal">' + goal.name + ' (' + goal.minute + ')' + '</li>')
            break
          case 'Own':
            $team1goals.append('<li class="match__live__goal">' + goal.name + ' (' + goal.minute + ')' + ' (og)</li>')
            break
        case 'Penalty':
            $team1goals.append('<li class="match__live__goal">' + goal.name + ' (' + goal.minute + ')' + '</li>')
            break
          case 'Yellow':
            $team1goals.append('<li class="match__live__yellow">' + goal.name + ' (' + goal.minute + ')' + '</li>')
            break
          case 'SecondYellow':
          case 'StraightRed':
            $team1goals.append('<li class="match__live__red">' + goal.name + ' (' + goal.minute + ')' + '</li>')
            break
        }
      })
    }
    if(response.team2.goals.length > 0){
      response.team2.goals.forEach(function (goal, index, array) {
        switch(goal.type){
          case 'Goal':
            $team2goals.append('<li class="match__live__goal">' + goal.name + ' (' + goal.minute + ')' + '</li>')
            break
          case 'Own':
            $team2goals.append('<li class="match__live__goal">' + goal.name + ' (' + goal.minute + ')' + ' (og)</li>')
            break
          case 'Penalty':
            $team2goals.append('<li class="match__live__goal">' + goal.name + ' (' + goal.minute + ')' + '</li>')
            break
          case 'Yellow':
            $team2goals.append('<li class="match__live__yellow">' + goal.name + ' (' + goal.minute + ')' + '</li>')
            break
          case 'SecondYellow':
          case 'StraightRed':
            $team2goals.append('<li class="match__live__red">' + goal.name + ' (' + goal.minute + ')' + '</li>')
            break
        }
      })
    }
  }

  return this

}
