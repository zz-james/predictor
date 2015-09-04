/**
 * displays errors within combination
 * @param {[type]} element [description]
 * @param {[type]} options [description]
 * @return {ErrorCombinationView} return itself for chaining
 */

ErrorCombinationView = function(element, options) {
    this.$el = element
  var scope = this
    , model        = options.model

  /* ------------------ Functions ------------------ */
  var appendErrorTooltip
      , handleLimitExceededError

  this.initialise = function() {

    // extend the error view class
    ErrorMixinView.call(this)
    model.on('Error:Combination:LimitExceeded:Predictions', _.partial(handleLimitExceededError, 'predictions'))
    model.on('Error:Combination:LimitExceeded:Winnings', _.partial(handleLimitExceededError, 'winnings'))
    model.on('Error:Combination:Ajax', handleAjaxError)
    scope = this

    return this

  }

  /* ------------------ Show Error ------------------ */
  var handleLimitExceededError = function(limitType) {
    var errorObj = {}
      // , errorType = errorObj.type

    _.extend(errorObj, {
      severityLevel: 1
      ,message: scope.$el.find('.js-footer-error-limit-exceeded-'+limitType).html()
    })
    scope.appendErrorTooltip(errorObj, scope.$el.find('.js-combi-bet-submit'), 'top')

  }

  var handleAjaxError = function(response) {
    var deferred = null

    var errorObj = (typeof response !== 'undefined' && response.responseJSON) ? response.responseJSON : {}
      , errorType = errorObj ? errorObj.type : ''

    if ('NOT_LOGGED_IN' === errorType)
    {
      _.extend(errorObj, {
        severityLevel: 0
        , cta: { log_in: true }
      })
      deferred = scope.appendErrorTooltip(errorObj, scope.$el.find('.js-combi-bet-submit'), 'top').done(function() {
        FANBOOKZ.loginSlider.openLoginSlider()
        FANBOOKZ.loginSlider.jumpToLoginForm() // ensure is not registration form
      })
      return
    }

    _.extend(errorObj, {
      severityLevel: 0
    })
    scope.appendErrorTooltip(errorObj, scope.$el.find('.js-combi-bet-submit'), 'top')

  }


  return this
}
