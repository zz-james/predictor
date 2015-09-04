/**
 * displays templates when predictor cannot be shown: noCoins, logged out
 * @param  {jQuery object} element we're using
 * @param  {object} options optional
 */
NoPredictorView = function(element, options) {
  this.$el = element
  var scope = this
      , model        = options.model
      , eventDispatcher = EventDispatcher.getInstance()
      , LEVELS = model.ERROR_LEVELS
      , template     = {
           login: Hogan.compile($('.temp__prediction-status__login').html())
          , noCoins: Hogan.compile($('.temp__prediction-status__no-coins').html())
          , noOdds: Hogan.compile($('.temp__prediction-status__no-odds').html())
          , noMoney: Hogan.compile($('.temp__rmg-prediction-status__no-coins').html())
          , genericErrorTemplate: Hogan.compile($('.temp__rmg-error').html())
          //TODO rename this one
          , genericErrorTemplateContent: Hogan.compile($('.temp__rmg-error-content').html())

          , unpredictable: Hogan.compile($('.temp__prediction-status__unpredictable').html())
          , Postponed: Hogan.compile($('.temp__prediction-status__postponed').html())
      }
      , status

  /* ------------------ model listeners ------------------ */



  /* ------------------- public methods ------------------- */
  this.render = function() {
    if (status) {
      var html = template[status].render(model)
      scope.$el.html(html)
      // hide stake from match status view
      eventDispatcher.trigger('hideStake')
    }
    return this
  }

  this.initialise = function() {

    scope.setStatus()
    bindEvents()

    if (status === 'login') {
      // TODO should this not be an event listener?
      if(model.isUpcoming()){
        model.setHeader('.js-match__prompt--initial')
      } else {
        model.setHeader('.js-match__prompt--competition')
      }
      return this
    }
    return this

  }

  this.getStatus = function() {
    this.setStatus()
    return status = typeof status !== 'undefined' ? status : null
  }

  this.setStatus = function() {
    if (!model.isUserLoggedIn()) {
      status = 'login'
      return this
    }
    if(!model.predictable) {
      status = 'unpredictable'
      return this
    }
    if(model.isPostponed()) {
      status = 'Postponed'
      return this
    }
    if (model.user.gameType==='coins' && model.user.balance === 0) {
      status = 'noCoins'
      return this
    }
    if (model.user.gameType==='rmg' && model.rmg.balance === 0) {
      status = 'noMoney'
      return this
    }
    if (model.prediction.status === 'unpredicted' && $.isEmptyObject(model.odds)) {
      status = 'noOdds'
      return this
    }

    status = undefined
    return this
  }

  /* ----------------- private functions ------------------ */

  bindEvents = function() {
    $('body').on('click', '.js-modal-deposit-money', function () {
      eventDispatcher.trigger('RMG:OpenDepositMoneyPage')
    })
    eventDispatcher.on('ERROR_CALLBACK:ODDS_NOT_FOUND', function(){
      status = 'noOdds'
      scope.render()
    })
    eventDispatcher.on('ERROR_CALLBACK:API_UNREACHABLE', function(errorObj, d){
      status = 'fsbUnreachable'

      var cssClass = ''
      if (errorObj) {
        cssClass += ' ' + (errorObj.cta ? 'has-cta' : '')
        // if severity hasn't been defined, set it to "warning"
        cssClass += ' ' + (typeof errorObj.severityLevel === 'number' ? LEVELS[errorObj.severityLevel] : LEVELS[2])
      }

      var htmlErrorContent = template.genericErrorTemplateContent.render(errorObj)
      var html = template.genericErrorTemplate.render({
          errorClass: cssClass
      })

      $('body').one('click', '.js-rmg-error-cta', function(e){
        d.resolve()
      })

      scope.$el.html(html)
      $('.js-rmg-error-inner').html(htmlErrorContent)
    })

  }

  return this
}