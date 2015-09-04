/* jshint unused: false */
function MatchWidget(userOptions, data) {

  // Private Variables //
  var matchModel
      , eventDispatcher
      , messages
      , predictionStatusView
      , noPredictorView

      , addCurrencyFormattingPower
      , bindEvents

  // Private Functions
  var initialise;
  var self = this;
  (function (scope, data) {
    /**
     * setup the internal modules
     */
    initialise = function() {


      // create Event Dispatcher
      eventDispatcher = EventDispatcher.getInstance()

      // create model
      matchModel = new MatchWidgetModel(data)

      // FSB modal

      if(matchModel.isUserLoggedIn()) {

        data.user.is_rmg_registered = $('.js-rmg-switch').data('fsbregistered')  // find out if they are registered with fsb

      }

      addCurrencyFormattingPower()

      // RMG related functionality
      if(matchModel.isUserLoggedIn()) {

        if(matchModel.isRMGMode()) {
          matchModel.realMoneyClass = 'rmg' // this for easy reference in template
        }

      }

      bindEvents()

      // the matchwidget polls the server for match events both before and during the match
      if (matchModel.widgetFormat !== 'mpu' &&
        ( matchModel.isLive() || matchModel.isFullTime() || matchModel.isUpcoming() )){
        setTimeout(matchModel.getMatchData, matchModel.matchUpdateSpeed)
      }


      // this is kind of from the old code
      // so maybe it will change?
      // but it is used in the fanzone.html template
      // {{#FullTime}}
      if(matchModel.isFullTime(matchModel.matchStatus)){
        matchModel.FullTime = true
      } else {
        matchModel.FullTime = false
      }


      // this is an ugly HACK to make the league dropdown work
      // I could continue debugging Bootstrap to find out what is wrong,
      // but this module is about to be changed all together
      $('.dropdown-toggle').dropdown('toggle');
      $('.dropdown-toggle').dropdown('toggle');

    }

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

    var addCurrencyFormattingPower = function() {

      var currencyCode = null;
      if (matchModel.isUserLoggedIn()) {
        currencyCode = matchModel.user.currencyCode
      }

      // for users unregistered with RMG, backend defaults to GBP (regardless of locale)
      // we need to overwrite it
      if (matchModel.isUserLoggedIn() && !matchModel.isUserRMGRegister()) { // TODO write test methods for the model
        if (locale === 'de') {
          matchModel.user.currencyCode = "EUR"
          currencyCode = matchModel.user.currencyCode
        }
      }

     CurrencyFormatter.initialiseWithCurrencyCode({currencyCode: currencyCode})
      var convertCurrency = function() {
        return function(amount, render) {
          var tmpl = Hogan.compile(amount)
          var output = tmpl.c.compile(amount).render(matchModel)
          return (CurrencyFormatter.getInstance().formatAmount(output))
        }
      }
      _.extend(matchModel, {
        convertCurrency: convertCurrency
      })

    }

    var bindEvents = function() {

      //// event listeners ////
      eventDispatcher.on('ERROR_CALLBACK:NOT_LOGGED_IN', function(){
        matchModel.setUserId(null)
        noPredictorView.setStatus().render()
      })

      eventDispatcher.one('MATCHWIDGET:STOP_ANIMATIONS', function() {
        // we don't want fade in buttons to happen all the time
        // bug fix! - to-do change way we handle animation off/on to a per-element basis
        if($(window).width() > 768){
          scope.$el.find('.match__team__shirt-and-name--home').css('transform','translateX(40px)')
          scope.$el.find('.match__team__shirt-and-name--away').css('transform','translateX(-40px)')
        }
        scope.$el.removeClass('match-widget--animated')
      })

      if (matchModel.isUserLoggedIn()) {
        FanbookzHeader.Model.on('BalanceChange', function(newBalance, wasNull) {

          //if was 0 an now is different
          if (wasNull) {
            predictionStatusView.render().initialise()
            return
          }

          if (noPredictorView.getStatus() === 'noMoney') {
            noPredictorView.render()
          }

        })
        matchModel.on('AJAX:betComplete', function(){
          FanbookzHeader.Model.updateAndGetBalanceFromFSB()
        })
      }

      matchModel.one('renderFulltimePrediction', function renderFulltimePrediction() {
        new FullTimeView( self.$el.find('.js-match-widget__prediction-status'), {
          model: matchModel
          , initialState: matchModel.prediction.status
          , tabPredictionElement : self.$el.find('.js-match-live-prediction')
          , tabInfoElement       : self.$el.find('.js-match-live-match-info')
          , messages: messages
        } ).initialise().render()  // run intitialise before render in this case

      })

      matchModel.on('predictionStateChange', function predictionStateChange(state){
        if (state==='upcomingPredicted') {
          self.$el.find('.js-prediction').remove()
          new PredictedView(self.$el.find('.js-match-widget__prediction-status'), {
            model: matchModel
            , messages: messages
          }).render().initialise()
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

    // Render base
    var baseTemplate = (matchModel.user && matchModel.user.gameType === 'rmg') ? Hogan.compile($('.temp__rmg-match-widget').html()) : Hogan.compile($('.temp__match-widget').html())
    this.$el.html(baseTemplate.render(data))

    // control animationos
    if($(window).width() > 768){
      this.$el.addClass('match-widget--animated')
    }

    // cache some jquery selector results that we use more than once
    var $predictionStatusDiv = this.$el.find('.js-match-widget__prediction-status');
    var $matchStatusDiv      = this.$el.find('.js-match-widget__match-status')
    var $team1ShirtDiv       = this.$el.find('.js-match__home-team')
    var $team2ShirtDiv       = this.$el.find('.js-match__away-team')
    var $team1ScoreDropDown  = $team1ShirtDiv.find('.js-match-prediction-small')
    var $team2ScoreDropDown  = $team2ShirtDiv.find('.js-match-prediction-small')

    // Binds the header view
    new HeaderView(this.$el.find('.match__prompt'),{
      model: matchModel
    }).initialise()

    // Binds the matchStatus view
    new MatchStatusView($matchStatusDiv, {
      model: matchModel
      , initialState: matchModel.isLive() ? 'live' : data.matchStatus
    }).render().initialise()


    // predictionStatusView - we instance this in all situations as is needed
    // for live and fulltime view to work we defer rendering until later
    predictionStatusView = new PredictionStatusView( $predictionStatusDiv, {
      model: matchModel
      , messages: messages
      , initialState: data.prediction.status
    })

    // check if we are in a state we can't make a prediction if we can't display message to
    // user as to the reason why - e.g. not logged in, no odds
    noPredictorView = new NoPredictorView(this.$el.find('.js-match-widget__prediction-status'), {
      model: matchModel
    }).initialise().render()


    /* ===== match is predicatable ===== */
    if ( matchModel.isPredictable() && matchModel.isUserLoggedIn() ) {

      // prediction status view mainly handles prediction buttons
      predictionStatusView.beforeRender().render().initialise()

      // no point in activating the clickable shirts if can't make a prediction
      // shirts will still render if not as they're part of the main template
      var homeShirt = new TeamShirtView($team1ShirtDiv, {
        model: matchModel
        ,team: 'team1'
        ,homeOrAway: 'home'
      }).initialise()

      var awayShirt = new TeamShirtView($team2ShirtDiv, {
        model: matchModel
        ,team: 'team2'
        ,homeOrAway: 'away'
      }).initialise()

      // this one is not rendered immediately it appears when prediction state = scoreprediction
      // it is subscribe to the predictionStateChange event
      new ScoreView( $matchStatusDiv, {
        model: matchModel
        , initialState: 'score'
      })

      // in mobile view these 2 MobileScoreDropDowns take the place of the ScoreView
      new MobileScoreDropDown($team1ScoreDropDown, {
        model: matchModel
        , otherTeamElement: $team2ScoreDropDown // sometimes we need to communicate to other drop-down
        , team: 'team1'
      }).initialise()

      new MobileScoreDropDown($team2ScoreDropDown, {
        model: matchModel
        , otherTeamElement: $team1ScoreDropDown // sometimes we need to communicate to other drop-down
        , team: 'team2'
      }).initialise()

      // in mobile view we need to make another instance of the rmg stake menu which displays under the buttons
      // depends on game type : we know user is logged in here so can just check gametype
      if(matchModel.isRMGMode())
      {
        new RmgStakeView(this.$el.find('.match__stake--mobile .js_stake_holder'), {
          model: matchModel
        }).render().initialise()
      } else {
        new CoinsStakeView(this.$el.find('.match__stake--mobile .js_stake_holder'), {
          model: matchModel
        }).render().initialise()
      }



    }
    /* ===== end of predictable ===== */


    // this match has been predicted, but is not full time and not live
    if (!matchModel.isFullTime()
     && !matchModel.isLive()
     && matchModel.isUserLoggedIn()
     && matchModel.isPredicted() ) {
      this.$el.find('.js-prediction').remove()
      new PredictedView($predictionStatusDiv, {
        model: matchModel
        , messages: messages // TODO what is this exactly
      }).render().initialise()
    }

    // when match is live, PredictionStatusView loads 'tabs' template which
    // contains the js-match-live-prediction element that live view uses.
    // (ie. liveview depends on predictorstatusview doing the right thing)
    if(matchModel.isLive())
    {
      predictionStatusView.beforeRender().render().initialise()
      new LiveView( $predictionStatusDiv, {
        model: matchModel
        , tabPredictionElement : this.$el.find('.js-match-live-prediction')
        , tabInfoElement       : this.$el.find('.js-match-live-match-info')
        , messages: messages
      } ).initialise().render()  // run intitialise before render in this case
    }


    /* ===== Full Time View ===== */
    // when match is fulltime, PredictionStatusView loads 'tabs' template which
    // contains the js-match-live-prediction element that FulltTime view uses.
    // (ie. liveview depends on predictorstatusview doing the right thing)
    if(matchModel.isFullTime())
    {
      // slightly hacky. we need to show the teamnames in the fulltime view
      // they are not in the element scope for the fulltime view component
      // so just do it here.
      this.$el.find('.match__team__name').removeClass('hidden')

      predictionStatusView.beforeRender().render().initialise()
      new FullTimeView( $predictionStatusDiv, {
        model: matchModel
        , initialState: matchModel.prediction.status
        , tabPredictionElement : self.$el.find('.js-match-live-prediction')
        , tabInfoElement       : self.$el.find('.js-match-live-match-info')
        , messages: messages
      } ).initialise().render()  // run intitialise before render in this case
    }

    // handle errors
    if (matchModel.isUserLoggedIn()) {
      new ErrorView(this.$el, {
        model: matchModel
        , headerModel: HeaderModel.getInstance()
      }).initialise()
    }

    // fanzone svg data vis of current voting on this match sitewide
    new FanZoneView(this.$el.find('.js-match-widget__fanzone'), {
      model: matchModel
    }).render()

    // footer links
    this.$el.find('.js-open-modal-at').off('click').on('click',function(e){
      e.preventDefault();
      e.stopPropagation();
      var classes = $(e.currentTarget).attr('class');
      var pageName = classes.match(/(js-at-page-)([\w-]+)/)[2];
      eventDispatcher.trigger('RMG:'+pageName)
    })

    // ------------ todo- the stuff below probably should be in another method---------------- //

    // unescape comment html
    if(matchModel.mostPopularComment){
      matchModel.mostPopularComment = $('<div/>').html(matchModel.mostPopularComment).text()
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

