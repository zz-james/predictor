////////////////////////// model ////////////////////////////

/**
 * Constructor for the model, we pass the matchwidget header data object to this
 * and it gets wrapped in an event emmitter and accessor methods that trigger
 * those events
 * Singleton class - obtain ref by calling HeaderModel.getInstance(data)
 * @param {macthwidget data} data the data sent from the server
 */
HeaderModel = (function() {

  // Instance stores a reference to the Singleton
  var instance
  var self
      , requestsArray = []
      , endPoints = {}


  /* ----------------- event listeners ------------------ */



  /* ------------------------------------------------------ */
  /* ----------------- private functions ------------------ */
  /* ------------------------------------------------------ */

  /**
   * @param  string   endPointName string used as key in endpoints lookup table
   * @param  Function callbackOnDone     function called on success
   * @param  Function callbackOnFail     function called on error
   * @param  object   payload      post params
   * @param  string   urlParams    if params are in url they can be appended to the url as a string
   * @return Deferred AjaxRequest an Ajax Deferred object or a dummy Promise
   */
  function makeRequest(params) {
    var endPoint = endPoints[params.endPointName].url+(params.urlParams ? params.urlParams : '')
    var method   = endPoints[params.endPointName].method
    var newAjaxObj = {
      url: endPoint
      , type: method
      , data: params.payload
      , dataType: 'json'
    }
    // TODO could this be memoised?
    var newRequestWrapperObj = {
      ajaxObj: newAjaxObj,

      // create a wrapper promise, which passes on the response from Ajax
      // (due to a limitation of not being able to create a deferred Ajax obj without
      // promptly triggeerring it)
      deferred: $.Deferred()
    }

    //console.log("requestsArray", requestsArray);

    if (!requestWithTheSameURLAlreadyExists()) {
      var newRequestWrappper = queueUpTheNewRequest(newRequestWrapperObj)
      return newRequestWrappper.deferred
    } else {
      return newRequestWrapperObj.deferred
    }


    ////// local functions /////
    function requestWithTheSameURLAlreadyExists() {
      return requestsArray.filter(function findSameRequests(r){
        return newAjaxObj.url === r.ajaxObj.url
      }).length > 0
    }

    function queueUpTheNewRequest(_newRequestWrapperObj) {
      // queue up the new promise
      requestsArray.push(_newRequestWrapperObj)

      // if there aren't any other queued up promises simply fire the one just created
      if (requestsArray.length === 1) {
        callAjaxWith(_newRequestWrapperObj)
      }
      return _newRequestWrapperObj
    }

    function callAjaxWith(requestWrapperObj) {

      var _ajaxPromise = $.ajax(requestWrapperObj.ajaxObj)

      // when the promise completes, trigger the next one in queue
      _ajaxPromise
        .then(
          function(response, textStatus, jqXHR){
            // just pass on the ajax response
            // (due to a limitation of not being able to create a deferred ajax obj without
            // promptly triggeerring it)
            requestWrapperObj.deferred.resolveWith(self, [response, textStatus, jqXHR])
          },
          function(response, textStatus, jqXHR){
            // just pass on the ajax response
            requestWrapperObj.deferred.rejectWith(self, [response, textStatus, jqXHR])
          })
        .always(function removeRequestObjFromArray(response, textStatus, jqXHR){
          requestsArray.shift()
          if(requestsArray.length) {
            callAjaxWith(requestsArray[0])
          }

        })
    }
  }


  /**
   * initialise the model
   * @return {[type]} [description]
   */
  function init(data) {

    self = observable(data)
    self.hasError = false

    endPoints = { // data.matchEventsApiUrl already has locale prefix
        sendToken                  :{ url:paths.base+'/'+data.locale+'/api/fsb/access-token',    method: 'POST' }
      , gameTypeRmg                :{ url:paths.base+'/'+data.locale+'/api/fsb/game-type/rmg',   method: 'POST' }
      , gameTypeCoins              :{ url:paths.base+'/'+data.locale+'/api/fsb/game-type/coins', method: 'POST' }
      , showTutorial0              :{ url:paths.base+'/'+data.locale+'/tutorial/rmg/0',          method: 'POST' }
      , showTutorial1              :{ url:paths.base+'/'+data.locale+'/tutorial/rmg/1',          method: 'POST' }
      , showTutorial2              :{ url:paths.base+'/'+data.locale+'/tutorial/rmg/2',          method: 'POST' }
      , showTutorial3              :{ url:paths.base+'/'+data.locale+'/tutorial/rmg/3',          method: 'POST' }
      , showTutorial4              :{ url:paths.base+'/'+data.locale+'/tutorial/rmg/4',          method: 'POST' }
      , getBalanceFromCache        :{ url:paths.base+'/'+data.locale+'/api/fsb/get-balance',     method: 'GET'  }
      , updateAndGetBalanceFromFSB :{ url:paths.base+'/'+data.locale+'/api/fsb/update-balance',  method: 'POST' }
    }

    self.ERROR_LEVELS = {
        0: 'block'
      , 1: 'error'
      , 2: 'warning'
      , 3: 'info'
    }

    self.setToken = function(accessToken) {
      var makeRequestPromise = makeRequest({
        endPointName: 'sendToken',
        payload: {accessToken: accessToken}
      }).done(function(response){
        self.user.is_rmg_registered = 'registered'
        self.trigger('AJAX:sendTokenDone', response)
      }).fail(function(response){
        // TODO deal with errors
        self.trigger('AJAX:sendTokenFail', response)
        console.log("setting the token went wrong");
      })
    }

    self.setGameMode = function(gameMode) {

      var endPointName;
      if (gameMode === 'rmg') {
        endPointName = 'gameTypeRmg'
      }
      if (gameMode === 'coins') {
        endPointName = 'gameTypeCoins'
      }

      var makeRequestPromise = makeRequest({
        endPointName: endPointName
      })

      // return promise
      return makeRequestPromise
    }

    self.setTutorialStage = function(showTutorial) {

      var endPointName;
      if (showTutorial == 0) {
        endPointName = paths.base+'/tutorial/rmg/0'
      }
      if (showTutorial == 1) {
        endPointName = paths.base+'/tutorial/rmg/1'
      }
      if (showTutorial == 2) {
        endPointName = paths.base+'/tutorial/rmg/2'
      }
      if (showTutorial == 3) {
        endPointName = paths.base+'/tutorial/rmg/3'
      }
      if (showTutorial == 4) {
        endPointName = paths.base+'/tutorial/rmg/4'
      }

      $.ajax({
        type: 'POST'
        , data: showTutorial
        , url: endPointName
        , success: function(data){
          //console.log(data)
        }
      })

    }

    self.setRmgBalance = function(response) {

      var amount = response.balance

      var wasNull = (data.rmg.balance == 0 && amount != 0)
        data.rmg.balance = (parseFloat(amount)).toFixed(2)
      console.log('set balance to ' + data.rmg.balance)
      self.trigger('BalanceChange', data.rmg.balance, wasNull)

    }

    self.updateAndGetBalanceFromFSB = function() {

      var makeRequestPromise = makeRequest({
        endPointName: 'updateAndGetBalanceFromFSB'
      }).then(function onSuccess(response, text, XMR) {

        // console.log("balance UPDATE response, text, XMR", response);
        self.setRmgBalance(response)

      }, function onFail(response, textStatus, jqXHR) {

        // console.log("UPDATE response, textStatus, jqXHR", response, textStatus, jqXHR)
        self.trigger('Ajax:FSBBalanceUpdateFail', response)

      }); window.ppp = makeRequestPromise;

    }

    self.getBalanceFromCache = function() {

      var makeRequestPromise = makeRequest({
        endPointName: 'getBalanceFromCache'
      }).then(function onSuccess(response, text, XMR) {

        // console.log("balance GET response", response);
        self.setRmgBalance(response)

      }, function onFail(response, textStatus, jqXHR) {

        // console.log("GET response, text, XMR", response, textStatus, jqXHR);
        self.trigger('Ajax:FSBBalanceGetFail', response)

      })

      makeRequestPromise.always(function always(response, textStatus, jqXHR){

        setTimeout(self.getBalanceFromCache, 30000)

      })

    }

    /**
     * @return {[Boolean]} Returns true or false depending if the user is in RMG mode
     */
    self.isRMGMode = function() {
      return data.user && data.user.gameType == 'rmg'
    }

    return self

  }


  return {

    // Get the Singleton instance if one exists
    // or create one if it doesn't
    getInstance: function () {

      if ( !instance ) {
        var dataAttr = $('.js-header-predictor').data()

        if (dataAttr && dataAttr.initialdata) {

          data = dataAttr.initialdata
          locale = dataAttr.locale
          _.extend(data, {
            locale: locale
          })
          instance = init(data, this)

        } else {
          return null
        }

      }

      return instance
    }

  }
})()
