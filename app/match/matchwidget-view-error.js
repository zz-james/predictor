/**
 * displays errors to user
 * @param {[type]} element [description]
 * @param {[type]} options [description]
 */

// TODO
// don't show the same error if it's already visible - flickers
ErrorView = function(element, options) {
  this.$el = element
  var scope = this
    , model        = options.model
    , headerModel  = options.headerModel
    , eventDispatcher = EventDispatcher.getInstance()


  /* ------------------ Functions ------------------ */
 var  createCookie
    , deleteCookie
    , iFrameIsShown
    , handleAjaxError
    , handleBalanceUpdateError


  this.initialise = function() {

    // extend the error view class
    ErrorMixinView.call(this)

    model.on('AJAX:betFailed', handleAjaxError)
    headerModel.on('AJAX:setGameModeFailed', handleAjaxError)

    // balance update errors
    headerModel.on('Ajax:FSBBalanceUpdateFail', handleBalanceUpdateError)
    headerModel.on('Ajax:FSBBalanceGetFail', handleBalanceUpdateError)

    // TODO this doesn't make sense in terms of UX, because the modal is open at this point
    headerModel.on('AJAX:sendTokenFail', handleAjaxError)

    return this

  }


  /* ------------------ Show Ajax Error ------------------ */

  var handleAjaxError = function(response) {

    headerModel.hasError = true
    var deferred = null

    var errorObj = (typeof response !== 'undefined' && response.responseJSON) ? response.responseJSON : {}
      , errorType = errorObj ? errorObj.type : '' // TODO generic error

    switch(errorType){
      case 'NOT_LOGGED_IN':
          eventDispatcher.trigger('ERROR_CALLBACK:NOT_LOGGED_IN')
        break
      case 'INVALID_ACCESS_TOKEN':
        if (!iFrameIsShown()) {
          // clear cookies, force login
          deleteCookie('AppSession')
          _.extend(errorObj, {
              severityLevel: 2
              , cta: { log_in: true }
          })
          deferred = scope.appendErrorTooltip(errorObj, $('.js-nav-with-rmg-switch')).done(function(){
            eventDispatcher.trigger('ERROR_CALLBACK:INVALID_ACCESS_TOKEN')
          })
        }
        break
      case 'API_UNREACHABLE':
        // TODO this one hasn't been implemented on the back end just yet
        _.extend(errorObj, {
            severityLevel: 0
          , cta: { play_for_fun: true }
        })
        var d = $.Deferred()
        d.done(function(){
          eventDispatcher.trigger('MATCHWIDGET:TURN_RMG_OFF')
        })
        eventDispatcher.trigger('ERROR_CALLBACK:API_UNREACHABLE', errorObj, d)
        break
      case 'RMG_DISABLED':
        deferred = scope.appendErrorTooltip(errorObj, $('.js-nav-with-rmg-switch'))
        break
      case 'ODDS_NOT_FOUND':
        eventDispatcher.trigger('ERROR_CALLBACK:ODDS_NOT_FOUND')
        break
      case 'INVALID_PRICE_ID':
        eventDispatcher.trigger('ERROR_CALLBACK:ODDS_NOT_FOUND')
        break
      case 'BET_ALREADY_PLACED':
        _.extend(errorObj, {
            severityLevel: 1
        })
        deferred = scope.appendErrorTooltip(errorObj, $('.js_match__stake'), 'top').done(function(){
          eventDispatcher.trigger('MATCHWIDGET:TURN_RMG_OFF')
        })
        break
      case 'MAX_STAKE_EXCEEDED':
        _.extend(errorObj, {
            severityLevel: 0
          , cta: { play_for_fun: true }
        })
        deferred = scope.appendErrorTooltip(errorObj, $('.js_match__stake'), 'top').done(function(){
          eventDispatcher.trigger('MATCHWIDGET:TURN_RMG_OFF')
        })
        break
      case 'INSUFFICIENT_FUNDS':
        _.extend(errorObj, {
            severityLevel: 0
          , cta: { deposit: true }
        })
        deferred = scope.appendErrorTooltip(errorObj, $('.js_match__stake'), 'top').done(function(){
          eventDispatcher.trigger('ERROR_CALLBACK:INSUFFICIENT_FUNDS')
        })
        break
      default:
        // eg. ERROR_NOT_LOGGED_IN, ERROR_GENERIC
        deferred = scope.appendErrorTooltip(_.extend(errorObj, {
            severityLevel: 0
        }), $('.js_match__stake'), 'top') // tODO generic error
        break
    }

    if (deferred) {
      deferred.done(function(){
        headerModel.hasError = true
      })
    }
  }

  var handleBalanceUpdateError = function(response) {

    headerModel.hasError = true
    var deferred = null

    var errorObj = (typeof response !== 'undefined' && response.responseJSON) ? response.responseJSON : {}
      , errorType = errorObj.type

    _.extend(errorObj, {
        severityLevel: 0
      , balanceError: true
    })
    switch(errorType){
      // TODO this could be actually combined with the one above
      // TODO mark the balance red when building the new nav and RMG switch
      case 'INVALID_ACCESS_TOKEN':
        if (!iFrameIsShown()) {
          deleteCookie('__smToken')
          _.extend(errorObj, {
            cta: { log_in: true }
          })
          deferred = scope.appendErrorTooltip(errorObj, $('.js-nav-with-rmg-switch'), 'bottom').done(function(){
            eventDispatcher.trigger('ERROR_CALLBACK:INVALID_ACCESS_TOKEN')
          })
        }
        break
      default:
        _.extend(errorObj, {
            severityLevel: 0
        })
        deferred = scope.appendErrorTooltip(errorObj, $('.js-nav-with-rmg-switch'))
        break
    }

    if (deferred) {
      deferred.done(function(){
        headerModel.hasError = true
      })
    }

  }


  /* ------------------ Helper functions ------------------ */

  var createCookie = function(name,value,days) {

    if (days) {
        var date = new Date()
        date.setTime(date.getTime()+(days*24*60*60*1000))
        var expires = "; expires="+date.toGMTString()
    }
    else var expires = ""
    document.cookie = name+"="+value+expires+"; path=/"

  }

  var deleteCookie = function(name) {
    createCookie(name,"",-1)
  }

  var iFrameIsShown = function() {
    return $('#fsbModal').data('bs.modal') && $('#fsbModal').data('bs.modal').isShown
  }


  return this
}
