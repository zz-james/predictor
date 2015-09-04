  /**
   * view component that handles showing score for predicting outcome
   * @param  {jQuery object} element - the DOM element controlled
   * @param  {object} options object ...
   */
ScoreView = function(element, options) {
  this.$el = element
  var scope = this
      , currentState = options.initialState
      , model        = options.model
      , eventDispatcher = EventDispatcher.getInstance()
      , template     = {
        scorePrediction: Hogan.compile($('.temp__match-status__score').html())
      }
      , state      = {
         wdw    : {
          delegateEvents : function() {
            scope.$el.find('.js-match-action-score-team1-increase').on('click', function (){
              increaseScore('team1')
              model.setPredictionState('scorePrediction')
            })
            scope.$el.find('.js-match-action-score-team2-increase').on('click', function (){
              increaseScore('team2')
              model.setPredictionState('scorePrediction')
            })
          }
        }
        ,scorePrediction : {
          delegateEvents : function() {
            // because in this case we're not rerendering elements we need to take off previous handlers
            scope.$el.find('.js-match-action-score-team1-increase').off('click').on('click', function (){
              increaseScore('team1')
            })
            scope.$el.find('.js-match-action-score-team1-decrease').off('click').on('click', function (){
              decreaseScore('team1')
            })
            scope.$el.find('.js-match-action-score-team2-increase').off('click').on('click', function (){
              increaseScore('team2')
            })
            scope.$el.find('.js-match-action-score-team2-decrease').off('click').on('click', function (){
              decreaseScore('team2')
            })
          }
        }
      }

  /* ------------------ model listeners ------------------ */
  model.on('predictionStateChange', setState)
  model.on('updateScores', updateScores)

  /* ------------------- public methods ------------------- */
  this.render = function(name) {
    var html = template[name].render(model)
    element.html(html)
    return this
  }


  /* ----------------- private functions ------------------ */
  function showScore() {
    model.setHeader('.js-match__prompt--predict-score')
    scope.render('scorePrediction')
    scope.$el.find('.js-match-prediction-score-team1').text('-')
    scope.$el.find('.js-match-prediction-score-team2').text('-')
    disableScoreButtons()

    if(model.user.gameType === 'rmg') {
      new RmgStakeView(scope.$el.find('.js_stake_holder'), {
          model: model
      }).render().initialise()
    } else {
      new CoinsStakeView(scope.$el.find('.js_stake_holder'), {
        model: model
      }).render().initialise()
    }
  }

  function setState(newState) {
    switch(newState) {
      case 'confirmHome':
      case 'confirmAway':
      case 'confirmDraw':
        eventDispatcher.trigger('MATCHWIDGET:STOP_ANIMATIONS')
        currentState = 'wdw'
        showScore()
        state[currentState].delegateEvents()
        showScorePredictionTooltip()

        break
      case 'scorePrediction':
        if(currentState != 'scorePrediction') {
          currentState = 'scorePrediction'
          state[currentState].delegateEvents()
        }
        break
    }
  }
  function showScorePredictionTooltip() {
    var content = scope.$el.find('.js-tooltip-msg').html()
    var showWarning = model.rmg && model.rmg.showWarning
      showWarning = true
      if(showWarning) {
        // there are two - one sits inside score.html template, and the other one
        // in default.html or rmg-default
        $matchScorePrediction = scope.$el.closest('.js-match-widget').find('.js-match-prediciton-score')
        $matchScorePrediction.tooltip({
          template: Hogan.compile($('.temp__rmg-tooltip').html()).render({
            errorClass: 'match__outcome__score__tooltip friendly'
          })
          , placement: 'top'
          , trigger: 'manual'
          , title: content
          , html: true
        }).tooltip('show')

        var timeout = setTimeout(function(){
          $matchScorePrediction.tooltip('destroy')
        }, 5000)

        var hasTooltip = typeof ($matchScorePrediction.data('bs.tooltip')) !== 'undefined'
        $matchScorePrediction.one('shown.bs.tooltip', function () {
          $('body').one('click', function() {
            if (hasTooltip) {
              $matchScorePrediction.tooltip('destroy')
              clearTimeout(timeout)
            }
          })
        })

      }

  }

  function increaseScore(team) {
    // check if score is a no decision '-:-'
    if (model.prediction.team1 === '-'){
      model.setPredictionProperty('team1',0)
      model.setPredictionProperty('team2',0)
    } else{
      if(team === 'team2' && model.prediction.team2 < 10){
        model.setPredictionProperty('team2',model.prediction.team2 + 1)
      }
      if(team === 'team1' && model.prediction.team1 < 10){
        model.setPredictionProperty('team1',model.prediction.team1 + 1)
      }
    }
  }

  function decreaseScore(team) {
    // check if score has already been predicted
    if(model.prediction.team1 !== '-'){
      if(team === 'team1' && model.prediction.team1 >= 1){
        model.setPredictionProperty('team1',model.prediction.team1 - 1)
      }
      if(team === 'team2' && model.prediction.team2 >= 1){
        model.setPredictionProperty('team2',model.prediction.team2 - 1)
      }
    }
  }

  // is this for real. can this be simplified?
  function disableScoreButtons() {
    var drawOutcomeBlank = (model.prediction.team1 === '-')
      // If team 1 score is 0 disable - button
      , team1Zero = (model.prediction.team1 === 0)
      // If team 2 score is 0 disable - button
      , team2Zero = (model.prediction.team2 === 0)
      // If team 1 score is 10 disable + button
      , team1Ten  = (model.prediction.team1 === 10)
      // if team 2 score is 10 disable + button
      , team2Ten  = (model.prediction.team2 === 10)

      // Figure out which btns to disable
      , team1IncreaseDisable = team1Ten
      , team2IncreaseDisable = team2Ten
      , team1DecreaseDisable = team1Zero
      , team2DecreaseDisable = team2Zero

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

    if (model.coins[model.prediction.team1+':'+model.prediction.team2] == undefined) {
      model.setOddsError(true)
    } else if(model.oddsError) {
      model.setOddsError(false)
    }
  }

  function updateScores() {
    scope.$el.find('.js-match-prediction-score-team1').text(model.prediction.team1)
    scope.$el.find('.js-match-prediction-score-team2').text(model.prediction.team2)

    disableScoreButtons()
    if (model.coins[model.prediction.team1+':'+model.prediction.team2] != undefined) {
      model.setPredictionProperty( 'winnings', model.coins[model.prediction.team1+':'+model.prediction.team2] )
      model.setPredictionProperty( 'quote', model.odds[model.prediction.team1+':'+model.prediction.team2].odds )
    }
  }

  return this
}
