/**
 * handles interaction and rendering around the team shirts
 * @param  {jQuery object} element we're using
 * @param  {object} options optional
 */
TeamShirtView = function(element, options) {
  this.$el = element
  var scope = this
      , model = options.model
      , team  = options.team
      , homeOrAway = options.homeOrAway.charAt(0).toUpperCase() + options.homeOrAway.substr(1).toLowerCase()

      , $scoreValue
      , $desktopScoreValue

  /* ------------------ model listeners ------------------ */
  model.on('predictionStateChange', predictionStateChange)

  /* ------------------- public methods ------------------- */
  this.render = function() {

  }

  this.initialise = function() {
    if ( homeOrAway !== 'Home' ) {
      if( homeOrAway !== 'Away' ) {
        console.error(homeOrAway + ' is not a valid homeOrAway value')
      }
    }
    scope.$el.find('.match__team__name').addClass(createTeamNameClass(model.teams[team].name))
    scope.$el.find('.match__team__shirt').css('cursor','pointer')
    bindEvents()
  }

  bindEvents = function() {
    scope.$el.on('click', function (e){
      if(model.prediction.status == "scorePrediction" && $('.match-prediction__small-score').is(":visible")) { return }
      model.setHeader('.js-match__prompt--'+team+'_win')
      model.setPredictionProperty('outcome',team)
      model.setPredictionProperty('WDW', true)
      model.setPredictionState('confirm'+homeOrAway)
    })
  }


  /* ----------------- private functions ------------------ */

  function predictionStateChange(state) {
    if('confirm'+homeOrAway === state) {
      scope.$el.find('.js-match-team').addClass('highlighted')
    } else {
      scope.$el.find('.js-match-team').removeClass('highlighted')
    }
  }

  function createTeamNameClass(teamName) {
    if(teamName.length > 12 && teamName.length < 20){
      return 'small'
    } else if(teamName.length >= 20){
      return 'smaller'
    } else {
      return ''
    }
  }

  return this
}
