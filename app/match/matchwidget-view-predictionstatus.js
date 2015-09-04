///////////////////////////////////////////////////////////////////

/**
 * view component that handles the prediction process buttons
 * @param  {jQuery object} element - for the DOM element controlled
 * @param  {object} options object ...
 */
PredictionStatusView = function(element, options) {
    this.$el = element
    var scope = this
        ,currentState        = options.initialState
        ,model               = options.model
        ,messages            = options.messages
        ,eventDispatcher     = EventDispatcher.getInstance()
        ,$confirmButton
        ,liveEnabled
        ,template     = function() {
          var tmp = {
              // these 8 states are used to make a prediction
              unpredicted: Hogan.compile($('.temp__prediction-status__upcoming-unprediction').html())
            , upcomingUnpredicted: Hogan.compile($('.temp__prediction-status__upcoming-unprediction').html())
            , confirmHome: Hogan.compile($('.temp__prediction-status__confirm--home').html())
            , confirmAway: Hogan.compile($('.temp__prediction-status__confirm--away').html())
            , confirmDraw: Hogan.compile($('.temp__prediction-status__confirm--draw').html())
            , scorePrediction: Hogan.compile($('.temp__prediction-status__upcoming-score-prediction').html())
            , predicted: Hogan.compile($('.temp__prediction-status__upcoming-prediction').html())
            // response to successfully placing bet/prediction
            // used to change bet/prediction submit button text
            , submitting: Hogan.compile($('.temp__prediction-submitting').html())

            // live or full-time templates
            , tabs: Hogan.compile($('.temp__match-widget__tabs').html())
            , correct: Hogan.compile($('.temp__prediction-status__fulltime-correct').html())
            , wrong: Hogan.compile($('.temp__prediction-status__fulltime-wrong').html())
          }
          if(model.user && model.user.gameType === 'rmg') {
            tmp = _.extend(tmp,{
                // these 8 states are used to make a prediction
                unpredicted: Hogan.compile($('.temp__rmg-prediction-status__upcoming-unprediction').html())
              , upcomingUnpredicted: Hogan.compile($('.temp__rmg-prediction-status__upcoming-unprediction').html())
              , confirmAway: Hogan.compile($('.temp__rmg-prediction-status__confirm--away').html())
              , confirmDraw: Hogan.compile($('.temp__rmg-prediction-status__confirm--draw').html())
              , confirmHome: Hogan.compile($('.temp__rmg-prediction-status__confirm--home').html())
              , scorePrediction: Hogan.compile($('.temp__rmg-prediction-status__upcoming-score-prediction').html())
              , predicted: Hogan.compile($('.temp__rmg-prediction-status__upcoming-prediction').html())
              // response to successfully placing bet/prediction
            })
          }
          return tmp
        }()
        ,state        = {
           unpredicted : {
            delegateEvents : function() {

              if($.isEmptyObject(model.odds)) {
                return;
              }

              scope.$el.find('.js-match__home-win').on('click', function () {
                // if we're dealing with the mpu widget there's some differences
                model.setHeader('.js-match__prompt--team1_win')
                model.setPredictionProperty('outcome','team1')
                model.setPredictionProperty('WDW', true)
                model.setPredictionState('confirmHome')
              })

              scope.$el.find('.js-match__away-win').on('click', function () {
                // if we're dealing with the mpu widget there's some differences
                model.setHeader('.js-match__prompt--team2_win')
                model.setPredictionProperty('outcome','team2')
                model.setPredictionProperty('WDW', true)
                model.setPredictionState('confirmAway')
              })

              scope.$el.find('.js-match__draw').on('click', function () {
                // if we're dealing with the mpu widget there's some differences
                model.setHeader('.js-match__prompt--draw')
                model.setPredictionProperty('outcome','draw')
                model.setPredictionProperty('WDW', true)
                model.setPredictionState('confirmDraw')
              })


              scope.$el.find('.js-match__skip').on('click', function(){
                document.location.href = model.nextFixture.url
              })
            }
           }
          ,confirmHome : {
            delegateEvents : function() {

              $confirmButton = scope.$el.find('.js-match__home-win__confirm')
              $confirmButton.originalText = $confirmButton.html()
              $confirmButton.on('click', function (e) {
                $(e.currentTarget).find('.button__text').html( template.submitting.render(model) )
                model.setPrediction({
                    team1: undefined
                  , team2: undefined
                  , outcome: 'team1'
                  , stake: model.prediction.stake
                  , coins: model.coins['team1']
                  , WDW:  true
                  , quote:  model.odds['team1'].odds
                  , winnings : model.coins['team1']
                  , predictedTeam : model.teams.team1.name
                })
                e.stopPropagation()
              })

            }
          }
          ,confirmAway : {
            delegateEvents : function() {

              $confirmButton = scope.$el.find('.js-match__away-win__confirm')
              $confirmButton.originalText = $confirmButton.html()

              // Away win outcome confirmation btns
              $confirmButton.on('click', function (e) {
                $(e.currentTarget).find('.button__text').html( template.submitting.render(model) )
                model.setPrediction({
                    team1: undefined
                  , team2: undefined
                  , outcome: 'team2'
                  , stake: model.prediction.stake
                  , status: 'predicted'
                  , coins: model.coins['team2']
                  , WDW:  true
                  , quote:  model.odds['team2'].odds
                  , winnings : model.coins['team2']
                  , predictedTeam : model.teams.team2.name
                  })
              })

            }
          }
          ,confirmDraw : {
            delegateEvents : function() {

              $confirmButton = scope.$el.find('.js-match__draw-win__confirm')
              $confirmButton.originalText = $confirmButton.html()

              $confirmButton.on('click', function (e) {
                $(e.currentTarget).find('.button__text').html( template.submitting.render(model) )
                model.setPrediction({
                  team1: undefined
                , team2: undefined
                , outcome: 'draw'
                , stake: model.prediction.stake
                , coins: model.coins['draw']
                , WDW:  true
                , quote:  model.odds['draw'].odds
                , winnings : model.coins['draw']
                })
                e.stopPropagation()
                // triggers submit prediction
              })

            }
          }
          ,scorePrediction : {
            delegateEvents : function() {
                  $confirmButton = scope.$el.find('.js-match-action-score-prediction-predict')
                  $confirmButton.originalText = $confirmButton.html()
                  $confirmButton.on('click', function (e) {
                    $(e.currentTarget).find('.button__text').html( template.submitting.render(model) )
                    model.setPredictionProperty( 'team1', (model.prediction.team1 === '-') ? undefined : model.prediction.team1 )
                    model.setPredictionProperty( 'team2', (model.prediction.team2 === '-') ? undefined : model.prediction.team2 )
                    model.setPredictionProperty( 'WDW', false)
                    // then final submission of the bet?
                    model.setPrediction(model.prediction)
                    e.stopPropagation()
                  })

              model.setOddsError(false) // ensure odds error is not shown - this should maybe be the default?
            }
          }
          ,predicted : {
            delegateEvents : function() {} // no events to handle in this state
          }
          ,upcomingPredicted : {  // response to ajax when prediction or bet is successfully complete
            delegateEvents : function() {} // no events to handle in this state
          }
          ,wrong : {
            delegateEvents : function() {} // no events to handle in this state
          }
          ,correct : {
            delegateEvents : function() {} // no events to handle in this state
          }
        }

    /* ------------------- model listeners ------------------- */
    model.on('predictionStateChange', predictionStateChange)
    model.on('updateWinningsAmount', updateWinningsAmount)
    model.on('showOddsError',showOddsError)
    model.on('hideOddsError',hideOddsError)
    model.on('lessThan30secs',less30Secs)
    model.on('matchStateChange', function(matchStatus) {
      if( model.isLive() || model.isFullTime()  ) {
        model.off('predictionStateChange')
      }
    })

    /* ------------------- public methods ------------------- */

    /**
     * set up currency converter for templates,render a template depending on a status
     */
    this.render = function(templateName) {
      if(!templateName) {templateName = currentState}
      var html = template[templateName].render(model)
      element.html(html)
      return this
    }

    this.clear = function() {

      element.empty()
      return this

    }


    function less30Secs() {
      if(liveEnabled) { return } // don't do this more than once
      currentState = 'tabs'
      scope.render()
      // is this a good idea?
      liveEnabled = new LiveView( scope.$el, {
          model: model
        , tabPredictionElement : scope.$el.find('.js-match-live-prediction')
        , tabInfoElement       : scope.$el.find('.js-match-live-match-info')
        , messages: messages
      } ).initialise().render()  // run intitialise before render in this case
    }

    /**
     * account for quirks, hack the data around
     */
    this.beforeRender = function() {
      // when match is live or fulltime we need the prediction status element
      // to show the tabs template.
      if( model.isLive() || model.isFullTime()  ) {
        currentState = 'tabs'
      }
      return this
    }

    /**
     * initialise events
     */
    this.initialise = function() {
      if( model.isLive() || model.isFullTime()  ) {
        return this
      }

      state[currentState].delegateEvents();
      return this
    }

    /* ----------------- private functions ------------------ */

    function predictionStateChange(newState) {

      // return if the state isn't realy changing, or
      // rely on PredictedView if it is upcomingPredicted 
      if (currentState === newState) {
        return
      }
      currentState = newState

      if (newState === 'upcomingPredicted' ||
        newState === 'predicted') {
        return
      }
      scope.beforeRender().render(currentState).initialise()
    }

    function reRender() {
      scope.render()
      state[currentState].delegateEvents();
    }


    function delegateSharedEvents() {
      // back button shared accress states
      scope.$el.on('click', '.js-match__unconfirm', function (e) {
        e.preventDefault()
        e.stopPropagation()
        eventDispatcher.trigger('MATCHWIDGET:STOP_ANIMATIONS')
        model.trigger('updateCountdown')
        // maybe this reset should be a method in the model?
        model.setPredictionState('unpredicted')
        model.prediction.team1 = 0
        model.prediction.team2 = 0
        model.setHeader('.js-match__prompt--initial')
        model.trigger('matchStateReset')
      })


      model.one('AJAX:predictionComplete', function(response){
        var extras  = { yourPrediction: messages.prediction.yourPrediction() }
        model       = _.extend(model, extras)
        model.setPredictionState('upcomingPredicted')
        model.setHeader('.js-match__prompt--prediction')
      })

      model.on('AJAX:PredictionFailed', function(response){
        scope.$el.find('.js-match-submit-error').text(response.error)  // maybe roll this into the new errors at some point
      })

      model.on('AJAX:betComplete', function(){
        var extras  = { yourPrediction: messages.prediction.yourPrediction() }
        model       = _.extend(model, extras)
        model.setPredictionState('upcomingPredicted')
        model.setHeader('.js-match__prompt--prediction')
      })

      model.on('AJAX:betFailed', function(response, textStatus, jqXHR) {
        console.log("response, textStatus, jqXHR", response, textStatus, jqXHR);
        $confirmButton.html($confirmButton.originalText)
      })

      model.on('Error:Mini:NoOdds Error:Mini:Generic', function(response, textStatus, jqXHR) {
        $confirmButton.html($confirmButton.originalText)
      })
    } // end delegate shared events


    function updateWinningsAmount() {
      if(model.user && model.user.gameType === 'rmg'){
        var w = CurrencyFormatter.getInstance().formatAmount(model.prediction.winnings)
        scope.$el.find('.js-match-action-score-odds').html(w)
      } else {
        scope.$el.find('.js-match-action-score-odds').text('+' + model.prediction.winnings)
      }
      reRender()
    }
    function showOddsError() {
      scope.$el.find('.js-match-action-score-prediction-predict').hide()
      scope.$el.find('.js-match-score-odds-error').show()
    }
    function hideOddsError() {
      scope.$el.find('.js-match-score-odds-error').hide()
      scope.$el.find('.js-match-action-score-prediction-predict').show()
    }


    delegateSharedEvents()
    return this
}
