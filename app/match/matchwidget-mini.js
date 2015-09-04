/* jshint unused: false */
function MiniMatchWidget(userOptions, data) {


  // Private Variables //
  var matchModel
      , eventDispatcher
      , messages
      , visiCheck

  // Private Functions
  var initialise;
  var self = this;
  var predictionStatusView
    , noPredictorView
    , matchStatusView
    , fanzoneView

  (function (scope, data) {
    // TODO remove hardcoded values
    data.kickOffPrettyDay = data.kickOffPretty.date
    data.kickOffPrettyTime = data.kickOffPretty.time
    /**
     * setup the internal modules
     */
    initialise = function() {

      if(data.user){
        // overwrite game mode for the mini predictor
        // in combination bet situation this will not be
        // relevant since the winnings/stake etc are handled by
        // the footer
        data.user.gameType = 'coins'
      }

      // create Event Dispatcher
      eventDispatcher = EventDispatcher.getInstance()

      // here's where we do something a little different if this mini widget is on the combinaton betting page
      if(data.combiPredictor)
      {
        // in the combination controller we don't have this data, so just add in an empty object
        data.currentPredictions = {}
        data.coins = []
        data.user = {gameType:'coins'}
        data.userId = true
        data.matchStatus = 'PreMatch'
        data.predictable = true
        data.prediction = {status:'unpredicted', winnings: 0} // they always start unpredicted ?
        CombinationMatchWidgetModel.prototype = new MatchWidgetModel(data)
        matchModel = new CombinationMatchWidgetModel(CombinationMatchWidgetModel.prototype) // pass in pointer to super model
      } else {
        // or this is a mini widget thats not on the combination page
        matchModel =  new MatchWidgetModel(data)
      }

      matchModel.initialise()
      bindEvents()
  }

  // TODO don't need this?
  // module that generates messages from translations in dom passed into modules that need it
  // when they are first instanced
  messages = {
    prediction : {
      yourPrediction: function () {

        var template = {
          messageOutcomeAwayWin: Hogan.compile($('.temp__prediction-message-outcome-away-win').html())
        , messageOutcomeAwayWinScore: Hogan.compile($('.temp__prediction-message-outcome-away-win--score').html())
        , messageOutcomeDraw: Hogan.compile($('.temp__prediction-message-outcome-draw').html())
        , messageOutcomeDrawScore: Hogan.compile($('.temp__prediction-message-outcome-draw--score').html())
        , messageOutcomeHomeWin: Hogan.compile($('.temp__prediction-message-outcome-home-win').html())
        , messageOutcomeHomeWinScore: Hogan.compile($('.temp__prediction-message-outcome-home-win--score').html())
        }

        // To Win
        if(data.prediction.outcome === 'team1'){
          if(data.prediction.team1 !== undefined  &&  data.prediction.team1 !== null){
            return template.messageOutcomeHomeWinScore.render(data)
          } else {
            return template.messageOutcomeHomeWin.render(data)
          }
        }
        if(data.prediction.outcome === 'team2'){
          if(data.prediction.team1 !== undefined  &&  data.prediction.team1 !== null){
            return template.messageOutcomeAwayWinScore.render(data)
          } else {
            return template.messageOutcomeAwayWin.render(data)
          }
        }


        // To draw
        if(data.prediction.outcome === 'draw'){
          if(data.prediction.team1 !== undefined  &&  data.prediction.team1 !== null){
            return template.messageOutcomeDrawScore.render(data)
          } else {
            return template.messageOutcomeDraw.render(data)
          }
        }

      } // end your prediction function
    }
  }

  var bindEvents = function() {

      //// event listeners ////
      eventDispatcher.on('ERROR_CALLBACK:NOT_LOGGED_IN', function(){
        matchModel.setUserId(null)
        noPredictorView.setStatus().render()
      })

      // event dispatcher is a global class, so we need to specify the match id
      // otherwise all mini predictors will listen to the event
      eventDispatcher.on('ERROR_CALLBACK:RESET_PREDICTION_STATUS:'+matchModel.matchId, function(){
        matchModel.setPredictionState('unpredicted')
      })

      matchModel.on('predictionStateChange', function predictionStateChange(state){
        if (state==='upcomingPredicted') {
          // save the height of the widget
          // the predicted view el is positioned absolutely,
          // and we need to maintain the widget's height
          var cachedHeight = self.$el.height()
          new MiniPredictedView(self.$el.find('.js-match-widget__prediction-status'), {
              model: matchModel
            , messages: messages
            , height: cachedHeight
          }).render().initialise()
        }

        if (state==='confirmHome'
          || state==='confirmAway'
          || state==='confirmDraw') {
            // matchStatusView.clearTimer()
            if (typeof fanzoneView !== 'undefined') {
              fanzoneView.clear()
            }
            self.$el.find('.js-kickoff-view').children().hide()
        }

        if (state==='unpredicted') {
          // reset the date view
          self.$el.find('.js-kickoff-view').children().show()
        }
      })
    }

  })(this, data)

  //////////////////////////////////////////////////////////////////////////
  ////////////////////// public matchwidget methods ////////////////////////
  //////////////////////////////////////////////////////////////////////////

  this.setOptions = function(userOptions) {
    userOptions = $.extend(this.options, userOptions)
  }

  this.init = function() {
    this.$el = userOptions.el
    initialise()
  }

  this.render = function() {

    // if predictor is not visible do not render
    if(!userOptions.visChecker.percentage()) {
      self.visiCheck = new VisSense.VisMon(userOptions.visChecker, {
        strategy: [
          new VisSense.VisMon.Strategy.PollingStrategy({ interval: 500 })
        ],
        visible: function() {
          self.render()  // call render when element becomes visible
          self.visiCheck = null
        }
      }).start();
      return
    }

    // Render base
    var baseTemplate =  Hogan.compile($('.temp__match-widget-mini').html())
    this.$el.html(baseTemplate.render(data))

    // this is a hack because webkit does not support keep-all value of word-break property!
    if(!(data.teams.team1.name.indexOf(' ') >= 0)) { this.$el.find('.match__team__name__1 span').css('white-space','nowrap') } // there is no space in team1 name
    if(!(data.teams.team2.name.indexOf(' ') >= 0)) { this.$el.find('.match__team__name__2 span').css('white-space','nowrap') } // there is no space in team2 name


    // cache these dom queries as they're used a few times
    var $predictionStatusDiv = this.$el.find('.js-match-widget__prediction-status')
    var $matchStatusDiv      = this.$el.find('.js-match-widget__match-status')
    var $team1ShirtDiv       = this.$el.find('.js-match__home-team')
    var $team2ShirtDiv       = this.$el.find('.js-match__away-team')
    var $team1ScoreDropDown  = $team1ShirtDiv.find('.js-match-prediction-small')
    var $team2ScoreDropDown  = $team2ShirtDiv.find('.js-match-prediction-small')

    // check if we are in a state we can't make a prediction
    noPredictorView = new NoPredictorView(this.$el.find('.js-match-widget__prediction-status'), {
        model: matchModel
    }).initialise().render()

    predictionStatusView = new PredictionStatusView( $predictionStatusDiv, {
          model: matchModel
        , messages: messages
        , initialState: data.prediction.status
    })

    // console.log("matchModel.isUserLoggedIn()
    // && matchModel.isPredictable(", matchModel.isUserLoggedIn()
    // && matchModel.isPredictable());

    if ( matchModel.isUserLoggedIn() && matchModel.isPredictable() ) {
      // we can make a prediction
      predictionStatusView.beforeRender().render().initialise()
    } else {
      if (matchModel.prediction.status === 'predicted' ||
        matchModel.prediction.status === 'upcomingPredicted') {
        new MiniPredictedView(self.$el.find('.js-match-widget__prediction-status'), {
            model: matchModel
          , messages: messages
        }).render().initialise()
      }
    }

    new MobileScoreDropDown($team1ScoreDropDown, {
        model: matchModel
      , eventDispatcher: eventDispatcher
      , otherTeamElement: $team2ScoreDropDown // sometimes we need to communicate to other drop-down
      , team: 'team1'
    }).initialise()

    new MobileScoreDropDown($team2ScoreDropDown, {
        model: matchModel
      , eventDispatcher: eventDispatcher
      , otherTeamElement: $team1ScoreDropDown // sometimes we need to communicate to other drop-down
      , team: 'team2'
    }).initialise()

    // TODO
    var errorView = new ErrorMiniView(this.$el, {
      model: matchModel
    , eventDispatcher: eventDispatcher
    }).initialise()

    if (!matchModel.combiPredictor) {
      fanzoneView = new FanZoneView(this.$el.find('.js-match-widget__fanzone'), {
        model: matchModel
      , isMini: true
      }).render().initialise()
    }

    // no point in activating the clickable shirts if can't make a prediction
    // shirts will still render as they're part of the main template
    if ( [null, 'noMoney'].indexOf(noPredictorView.getStatus()) >=0 ) {
      // team shirts - in model home team is referred to as team1 and away as team2
      var homeShirt = new TeamShirtView(this.$el.find('.js-match__home-team'), {
       model: matchModel
       ,team: 'team1'
       ,homeOrAway: 'home'
       ,eventDispatcher: eventDispatcher
      }).initialise()

      var awayShirt = new TeamShirtView(this.$el.find('.js-match__away-team'), {
       model: matchModel
       ,team: 'team2'
       ,homeOrAway: 'away'
       ,eventDispatcher: eventDispatcher
      }).initialise()
    }

    // google analytics
    this.$el.find('[data-track]').on('click',function () {
      var attribute = $(this).attr('data-track')
      FanbookzGATracker.Send(attribute)
    })

  }  // end of render function


  this.setOptions(userOptions)
  this.init()
}
