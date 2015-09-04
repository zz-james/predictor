/**
 *
 * @param  {jQuery object} element we're using
 * @param  {object} options optional
 * @return {ModalController} return itself for chaining
 */
FSBModalController = function(model, turnRmgOn) {
  var self = this
      ,model        = model
      ,eventDispatcher = EventDispatcher.getInstance()
      , $fsbModal
      , $iframe
      , PAGE = {
          LOGIN: 'login'
        , REGISTER: 'register'
        , MAKEDEPOSIT: 'make-deposit'
        , RESPONSIBLEGAMING: 'responsible-gaming'
        , BETTINGRULES: 'betting-rules'
        , TANDC: 'terms-and-conditions'
        , HISTORY: 'bet-history'
        , ACCOUNTHISTORY: 'account-history'

      }

  /* ------------------- public methods ------------------- */

  this.initialise = function() {

    $fsbModal = $('#fsbModal')
    $iframe = $('.header__modal--rmg-account-iframe')

    if(model.user.is_rmg_registered !== 'unregistered') {
      self.bindModalMenuEvents()
    } else if(model.rmg && model.rmg.enabled) {
      self.bindModalEventsForUnregisteredUser()
    }

    model.on('AccessTokenReceived', function recieveAccessToken(token) {

      if( model.user.is_rmg_registered === 'unregistered') {
        var payload = {accessToken: token}

        model.on('AJAX:sendTokenDone', function() {
          clearModalEvents()
          $('#fsbModal').one('hide.bs.modal',function(e){
            console.log("turnRmgOn")
            turnRmgOn()
          })
        })
      }

      model.setToken(token)

    })
    return self
  }


  /**
   * this binds events to the bootstrapmodal so that it can pass in the user email
   */
  this.bindModalEventsForUnregisteredUser = function() {

    $fsbModal.on('show.bs.modal',function(e){

      // user isn't registered so proceed to open modal for registration
      var $target = e.relatedTarget ? $(e.relatedTarget) : null
      var src = getiFrameURLFromElementData(PAGE.REGISTER, $target)

      $iframe.attr({src: src});
    })
  }

  /**
   * a method called only for RMG game
   * exposes window methods for FSB to plug into
   * binds events for the FSB modal window
   * @return {[type]} [description]
   */
  this.bindModalMenuEvents = function() {
    // this next line was a quick fix there may be a more sensible place for this

    $fsbModal.on('show.bs.modal',function(e){
      var url = $iframe.attr('src')
      if (e.relatedTarget) {
        url = e.relatedTarget.href
      } else if (url==='javascript:void(0)') {
        url = getiFrameURLFromElementData('')
      }

      $iframe.attr({src: url})
    })

    $fsbModal.on('hide.bs.modal',function(e){
      model.updateAndGetBalanceFromFSB()
    })

    window.closeFSBModal = function() {
      $fsbModal.modal('hide')
    }
  }

  /**
   * Open modal, default page is login when looged out
   */
  this.showFsbLogin = function() {

    //open modal - at some point get a better way of doing this but for now it works without having to unbind and rebind menu events
    $fsbModal.modal('show')

  }

  /**
   * Set the iframe URL a given page eg. 'make-deposit', 'login', open modal
   * If pageName isn't given, we open wih login page
   */
  this.openModalAt = function(pageName) {
    var src = getiFrameURLFromElementData(pageName, null)
    $iframe.attr({src: src});

    $fsbModal.modal('show')

  }

  /**
   * this public method is sent to the window.passAccessToken
   * to recieve the registration token from FSB
   */
  this.recieveRegistrationToken = function(token){
    var payload = {accessToken: token}

    model.on('AJAX:sendTokenDone', function() {
    clearModalEvents()
      console.log("turnRmgOn")
      self.turnRmgOn()
    })
    model.setToken(token)
  }

  /**
   * this public method is sent to the window.passAccessToken
   * to recieve the login token from FSB
   */
  this.recieveLoginToken = function(token){
    model.setToken(token)
  }


  /* ------------------ model listeners ------------------ */
  eventDispatcher.on('RMG:OpenDepositMoneyPage', self.openModalAt.bind(self, PAGE.MAKEDEPOSIT))
  eventDispatcher.on('ERROR_CALLBACK:INSUFFICIENT_FUNDS', self.openModalAt.bind(self, PAGE.MAKEDEPOSIT))
  eventDispatcher.on('ERROR_CALLBACK:INVALID_ACCESS_TOKEN', self.openModalAt.bind(self, PAGE.ACCOUNTHISTORY))
  eventDispatcher.on('RMG:responsible-gaming', self.openModalAt.bind(self, PAGE.RESPONSIBLEGAMING))
  eventDispatcher.on('RMG:betting-rules', self.openModalAt.bind(self, PAGE.BETTINGRULES))
  eventDispatcher.on('RMG:terms-and-conditions', self.openModalAt.bind(self, PAGE.TANDC))


  /* ----------------- private functions ------------------ */

  function getiFrameURLFromElementData(pageName, $element) {

    if (!$element) {
      $element = $('.js-rmg-switch, .js-rmg-toggle, .js-header-predictor')
    }

    if (!$element.length) {
      return null
    }

    var emailParam = '?email=' + $element.data('email')
    var languageParam = '&languageId=' + $element.data('languageid')
    var currencyParam = '&currencyCode=' + $element.data('currencycode')
    var href = $element.data('baseurl') + (pageName ? pageName+'/' : '')
    href += emailParam
    href += languageParam
    href += currencyParam
    return href

  }

  clearModalEvents = function() {
    $fsbModal.off('show.bs.modal')
  }

  //==============================================================================
  // modal iframe plugin in rmg uses this passAccessToken to act as a pipe
  // between the iframe and the match widget
  //==============================================================================
  window.passAccessToken = function(token){

    if(!token) {
      return
    }

    if (token) {
      model.trigger('AccessTokenReceived', token)
    }
  }


  /**
   * @param  {String} page optional, only accepts null or 'predictor' for now
   * A window method exposed for FSB to call
   * Closes the modal, and optionally (if parameter 'page' is set to 'predictor'),
   * changes location to the predictor page
   */
  window.closeModalAndGoTo = function(page) {

    $fsbModal.modal('hide')

    // go to the predictor page if we aren't currently there already
    if (page === 'predictor') {
      var isPredictorPage =  $('.js-match-widget-full').length
      if (isPredictorPage) {
        return
      }
      window.location.href = '/' + locale + '/football/match/next'
    }

    return

  }


  return this
}
