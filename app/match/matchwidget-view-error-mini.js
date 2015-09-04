/**
 * displays errors with a mini predictor
 * @param {[type]} element [description]
 * @param {[type]} options [description]
 */

ErrorMiniView = function(element, options) {
    this.$el = element
  var scope = this
    , model        = options.model
    , eventDispatcher = EventDispatcher.getInstance()


  /* ------------------ Functions ------------------ */
  var appendErrorTooltip
      , handleError

  this.initialise = function() {

    // extend the error view class
    ErrorMixinView.call(this)
    model.on('Error:Mini:NoOdds', handleError)
    scope = this

    return this

  }


  /* ------------------ Show Error ------------------ */
  var handleError = function() {
    var errorObj = {}
      // , errorType = errorObj.type

    _.extend(errorObj, {
        severityLevel: 0
      , message: scope.$el.find('.js-match-score-odds-error').html()
      , cta: { back: true }
    })

    scope.appendErrorTooltip(errorObj, scope.$el.find('.js-shirts-and-score'), 'top').done(function(){
      eventDispatcher.trigger('ERROR_CALLBACK:RESET_PREDICTION_STATUS:'+model.matchId)
    })

  }



  /* ------------------ Helper functions ------------------ */

  return this
}

// _.extend( ErrorMiniView.prototype, ErrorMixinView );