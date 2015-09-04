/**
 * view component that handles the dom after a match is predicted
 * @param  {jQuery object} element - the parent DOM element controlled
 * @param  {object} options object ...
 */
MiniPredictedView = function(element, options) {
  this.$el = element
  var scope=this
      ,model        = options.model
      ,messages     = options.messages
      ,status       = null
      ,height       = options.height
      ,isCombination = true
      ,template     = function() {
        var tmp = {
          upcomingPredicted: Hogan.compile($('.temp__mini-prediction-status__upcoming-prediction').html())
        }
        return tmp
      }()

  /* ------------------ model listeners ------------------ */


  /* ------------------- public methods ------------------- */
  this.render = function(templateName) {
    var extras  = {}
    extras.yourPrediction = {}

    if (!isCombination) {
      extras.yourPrediction.message = messages.prediction.yourPrediction()
    }

    // attach 1 or 2 shirts (if draw)
    if (model.prediction.outcome === 'draw') {
      extras.yourPrediction.shirtSize = 70
      extras.yourPrediction.shirt1 = model.teams['team1'].slug
      extras.yourPrediction.shirt2 = model.teams['team2'].slug
    } else {
      extras.yourPrediction.shirtSize = 88
      extras.yourPrediction.shirt1 = model.teams[model.prediction.outcome].slug
    }

    // render
    if(!templateName) {templateName = model.prediction.status}
    var html = template[templateName].render(_.extend(model, extras))
    this.$el.html(html)

    // this is a hack, but needs to stay
    // the predicted view el is positioned absolutely,
    // and we need to maintain the widget's height
    this.$el.closest('.js-match-widget').height(height)

    // remove the tick / success icon
    window.setTimeout(function(){
      scope.$el.find('.js-upcoming-predicted').removeClass('active')
    }, 3000);

    return this

  }

  this.initialise = function() {

    scope.$el.on('click', '.js-remove-prediction', function removePrediction(e) {
      var matchId = scope.$el.closest('.js-match-widget').data().widgetData.matchId
      model.removeFromCombination()
    })
    return this

  }

  /* ----------------- private functions ------------------ */


  return this

}

