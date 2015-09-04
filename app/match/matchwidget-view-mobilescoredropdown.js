/**
 * score drop down is a component that is used only on mobile
 * screens, it allows user to predict a score using a drop down
 * @param  {jQuery object} element we're using
 * @param  {object} options optional
 * @return {MobileScoreDropDown} return itself for chaining
 */
MobileScoreDropDown = function(element,options) {
  this.$el = element
  var scope = this
    , model            = options.model
    , team             = options.team
    , otherTeamElement = options.otherTeamElement
    , eventDispatcher  = EventDispatcher.getInstance()
    , state            = 'unpredicted'

  /* ------------------ model listeners ------------------ */
  model.on('predictionStateChange', setState)
  model.on('updateScores', updateScores)

  /* ------------------- public methods ------------------- */

  this.initialise = function() {
    scope.$el.find('.js-match__score-menu').change(inputScore)

    scope.$el.find('.js-match__score-menu').on('click',function(e){
      e.stopPropagation()
    })
  }

  /* ----------------- private functions ------------------ */
  function inputScore(e) {
    var newScore = e.currentTarget.value
    if(scope.state !== 'scorePrediction') {
      model.setPredictionState('scorePrediction')
    }
    model.setPredictionProperty(team,newScore | 0) // cast newScore to int

    $container = $(e.currentTarget).closest('.js-match-team')
    $container.addClass('highlighted')
    setTimeout(function(){$container.removeClass('highlighted')},500)

  }

  // this method is also bound to model and keeps the drop down
  // view updated with score already predicted
  function updateScores() {
    scope.$el.find('.js-score-value').text(model.prediction[team])
  }

  function setState(newState) {
    scope.state = newState
    switch(newState) {
      case 'confirmHome':
      case 'confirmAway':
      case 'confirmDraw':
        scope.$el.removeClass('is-hidden')
        otherTeamElement.removeClass('is-hidden')
        scope.$el.find('.js-score-value').text('-')
        break
      case 'scorePrediction':
        model.setPredictionProperty(team, 0)
        break
      case 'unpredicted':
        scope.$el.addClass('is-hidden')
        otherTeamElement.addClass('is-hidden')
        break
    }
  }

  return this
}
