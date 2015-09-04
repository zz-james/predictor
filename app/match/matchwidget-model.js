////////////////////////// model ////////////////////////////

/**
 * Constructor for the model, we pass the matchwidget data object to this
 * and it gets wrapped in an event emmitter and accessor methods that trigger
 * those events
 * @param {macthwidget data} data the data sent from the server
 */
MatchWidgetModel = function(data) {

  var self = observable(data)
      , requestsArray = []
      , endPoints = { // data.matchEventsApiUrl already has locale prefix
        matchData                  :{ url:data.matchEventsApiUrl,                     method: 'GET'  }
        , sendPrediction             :{ url:data.predictorApiUrl,                       method: 'POST' }
        , sendToken                  :{ url:paths.base+'/'+data.locale+'/api/fsb/access-token',    method: 'POST' }
        , submitBet                  :{ url:paths.base+'/'+data.locale+'/api/fsb/make-bet',        method: 'POST' }
      }
      , hasClockRunning     = false

  self.ERROR_LEVELS = {
    0: 'block'
    , 1: 'error'
    , 2: 'warning'
    , 3: 'info'
  }

  self.setPredictionState = function(predictionStatus) {
    data.prediction.status = predictionStatus
    self.trigger('predictionStateChange', predictionStatus);
  }

  self.setPrediction = function(prediction, silent) {
    data.prediction = prediction

    // set prediction is called at the start of
    // the score prediction,
    // we don't trigger the ajax post in this case.
    // This pattern may change.
    if(silent) { return }


    if(data.user && data.user.gameType === 'coins') {
      self.trigger('sendPrediction')
    } else {
      createAndSendBet()
    }

  }

  self.setPredictionProperty = function(property, value) {
    data.prediction[property] = value

    // handle unique cases for specific properties
    switch(property) {
      case 'winnings':
        // updates quote in the prediction status view
        if (typeof value === 'undefined') {
          self.trigger('showOddsError')
        } else {
          self.trigger('updateWinningsAmount')
        }
        break;
      case 'stake':
        calculateCoins()
        self.trigger('updateStake')
        break;
      case 'team1':
      case 'team2':
        // update the outcome shown in the prediction
        if(data.prediction.team1 > data.prediction.team2) {
          data.prediction.outcome = 'team1'
        } else if(data.prediction.team1 < data.prediction.team2) {
          data.prediction.outcome = 'team2'
        } else  if(data.prediction.team1 === data.prediction.team2){
          data.prediction.outcome = 'draw'
        }
        self.trigger('updateScores')
    }
  }

  self.setBet = function(bet) {
    data.bet = bet
    self.trigger('sendBet')
  }

  self.setHeader = function(cssclass) {
    self.trigger('headerChange',cssclass);
  }

  self.setclock = function(clockObject) {
    data.clock = clockObject
    self.trigger('updateMatchClock')
  }

  self.setPotentialCoins = function(potcoins) {
    if (typeof potcoins === 'undefined') {
      return
    }
    data.potentialCoins = potcoins
    // self.trigger('updateUnpredictedFullTime')
  }


  self.setUserId = function(userId) {
    data.userId = userId
  }



  self.setCountown = function() {
    var filter = self.isDone() ? 'completed' : 'active';
    self.items(filter).forEach(function(item) {
      self.toggle(item.id);
    })
  }


  self.setCrowdPercentages = function() {
    var totalCrowd = data.currentPredictions.team1 + data.currentPredictions.team2
        , overlap = 10
        , team1Percentage = calculatePercentage(data.currentPredictions.team1, totalCrowd)
        , team2Percentage = calculatePercentage(data.currentPredictions.team2, totalCrowd)
        , crowdPercentages =
        { crowdPercentageTeam1: parseFloat(team1Percentage) + overlap
          , crowdPercentageTeam2: parseFloat(team2Percentage) + overlap
          // , crowdLeader: ( team1Percentage > team2Percentage ? 'team1-ahead' : 'team2-ahead')
        }

    data.crowdPercentages = crowdPercentages
  }

  /**
   * an odds error occurs during a score prediction
   * when a user attempts to predict a score with no odds
   * @param {bool} errorState - true or false
   */
  self.setOddsError = function(errorState) {
    data.oddsError = errorState
    if(data.oddsError) {
      self.trigger('showOddsError')
    } else {
      self.trigger('hideOddsError')
    }
  }

  self.setErrorState = function(error) {
    //
  }

  /**
   * publid accessor for calculate countdown function
   * if countdown < 30 seconds it triggers a event
   */
  self.calculateCountdown = function() {
    if(calculateCountdown()) {
      self.trigger('lessThan30secs')
    }
  }

  /**
   * before and during match new match data can be supplied through
   * the matchData endpoint which is polled on a timer
   * makes use of the makeRequest method returns a promise
   */
  self.getMatchData = function() {
    makeRequest({
      endPointName: 'matchData'
      ,urlParams  : '?matchId=' + data.matchId
    }).then(
        function callbackOnDone(response, textStatus, jqXHR){
          // console.log("callback on done",  response, textStatus, jqXHR);
          self.trigger('AJAX:matchDataComplete', response, textStatus, jqXHR)
        },
        function callBackOnFail(response, textStatus, jqXHR) {
          console.log("callback on fail response, textStatus, jqXHR", response, textStatus, jqXHR);
          //self.trigger('AJAX:matchDataFailed', response, textStatus, jqXHR)
        })

    if(self.isLive() || self.isUpcoming()){
      setTimeout(self.getMatchData, data.matchUpdateSpeed)
    }
  }


  /**
   * calculate potential winnings in RM
   * only used by the predicted view so far
   */
  self.calculateWinningsRMG = function(params){
    if(!_.isUndefined(data.prediction.team1) &&
       !_.isUndefined(data.prediction.team2) &&
       !!data.prediction.team1 &&
       !!data.prediction.team2) {
      key = data.prediction.team1+':'+data.prediction.team2
    } else {
      key = data.prediction.outcome
    }
    var quote = data.odds[key].odds
    return (quote * params.stake).toFixed(2)
  }


  /* ----------------- some useful boolean for queryinh match stats------------------ */

  self.isLive = function () {
    var liveStatuses =
        [ 'FirstHalf'
          , 'HalfTime'
          , 'Halftime'
          , 'SecondHalf'
          , 'ExtraFirstHalf'
          , 'ExtraSecondHalf'
          , 'ExtraHalfTime'
          , 'ShootOut']
    return liveStatuses.indexOf(data.matchStatus) > -1
  }
  self.isFullTime = function () {
    return data.matchStatus === 'FullTime'
  }
  self.isPostponed = function () {
    return data.matchStatus === 'Postponed'
  }
  self.isUpcoming = function () {
    return data.matchStatus === 'PreMatch'
  }
  self.isUserLoggedIn = function(){
    return !!data.userId
  }
  self.isUserRMGRegister = function(){
    return data.user.is_rmg_registered !== 'unregistered'
  }
  self.isPredicted = function(){
    return data.prediction.status === 'predicted' ||
           data.prediction.status === 'wrong' ||
           data.prediction.status === 'correct'
  }

  /**
   * @return {[Boolean]} Returns true or false depending if the game can be predicted by the user
   */
  self.isPredictable = function() {
    if(!data.predictable) {
      return false
    }
    if(data.isPostponed()) {
      return false
    }
    if (data.isLive()) {
      return false
    }
    if (data.isFullTime()) {
      return false
    }
    if (data.user && data.user.gameType==='coins' && data.user.balance === 0) {
      return false
    }
    if (self.isRMGMode() && data.rmg.balance  === 0) {
      return false
    }
    if (data.prediction.status === 'unpredicted' && $.isEmptyObject(data.odds)) {
      return false
    }
    if (data.prediction.status === 'predicted' ||
        data.prediction.status === 'upcomingPredicted') {
      return false
    }
    if (self.isPredicted()) {
      return false
    }

    return true
  }

  self.isRMGMode = function() {
    return data.user && data.user.gameType == 'rmg'
  }

  /* ----------------- event listeners ------------------ */

  // send prediction to server
  self.on('sendPrediction', function() {

    data.prediction.matchId = data.matchId  // you need to add matchID to the prediction. not my fault!
    makeRequest({
      endPointName: 'sendPrediction'
      , payload: data.prediction
    }).then(
        function callbackOnDone(response, textStatus, jqXHR){
          self.trigger('AJAX:predictionComplete')
        },
        function callBackOnFail(response, textStatus, jqXHR) {
          // TODO handle errors - could we just use the existing prediction failed?
          self.trigger('AJAX:PredictionFailed', response, textStatus, jqXHR)
        })
  })

  self.on('sendBet',function() {
    console.log('sending bet' + data.bet)

    var stake = data.bet.stake
    var newBetOddsId = data.bet.oddsId
    var urlParams = '/' + stake + '/' + newBetOddsId

    makeRequest({
      endPointName: 'submitBet'
      , urlParams: urlParams
    }).then(
        function callbackOnDone(response, textStatus, jqXHR){
          self.trigger('AJAX:betComplete')
        },
        function callBackOnFail(response, textStatus, jqXHR) {
          // TODO handle generic errors
          // eg
          // message: "We’re just receiving new odds for this result, try refreshing the page"
          // type: "INVALID_PRICE_ID"
          self.trigger('AJAX:betFailed', response, textStatus, jqXHR)
        })
  })

  self.on('AJAX:matchDataComplete',function(response){

    data.matchStatus = response.matchStatus
    self.trigger('matchStateChange',data.matchStatus)

    // replace null scores with zeros
    if(response.team1 && response.team1.score === null || response.team1.score === ''){
      response.team1.score = 0
    }
    if(response.team2 && response.team2.score === null || response.team2.score === ''){
      response.team2.score = 0
    }
    self.trigger('renderGoals' , response)


    if(self.isLive()) {

      if(response.matchStatus === 'SecondHalf' && !data.hasClockRunning){
        data.halftimekickOff = response.halftimekickOff.date
        self.trigger('startClock')
      }

      // this showHalfTime flag does not appear to get used?
      if(!response.team1.halfTime){
        response.showHalfTime = false
      } else {
        response.showHalfTime = true
      }

      self.trigger('renderCommentary', response.commentary)
      self.trigger('renderStats' , response)
      self.trigger('renderCharts', response.stats)
      self.trigger('renderScore' , response) // only when live
      self.trigger('renderLivePrediction' , response)

    } else if (self.isFullTime()) {

      data.score = response // set the score to next determine if the prediction was correct
      if(data.prediction.status !== 'unpredicted'){
        predictionCorrect()
      }
      self.trigger('renderFulltimePrediction' , response)
    }
  })

  self.on('AJAX:predictionComplete', function(response){
    incrementCurrentPredictions(data.prediction.outcome)
  })


  /**
   * sets up the match clock
   * only happens in live state
   */
  self.on('startClock',   function() {
    var kickoff = new Date(data.kickOff).getTime()
        , startTime = 0

    if (data.halftimekickOff != "") {
      kickoff = new Date(data.halftimekickOff).getTime()
      startTime = 45
    }

    var currentDate =  new Date().getTime()
        , countdown = kickoff - currentDate
        , oneMinute = 60 * 1000
        , oneHour = 60 * 60 * 1000
        , minutes = Math.abs((countdown)/(oneMinute)) / 60.0
        , clockMinutes = Math.floor((minutes - Math.floor(minutes) ) * 60.0)

    self.setclock({
      minutes : (data.matchStatus == 'Halftime') ? 'HT' : startTime + clockMinutes
      , seconds : 0
    })

  })



  /* ------------------------------------------------------ */
  /* ----------------- private functions ------------------ */
  /* ------------------------------------------------------ */

  /**
   * initialise the model
   * @return {[type]} [description]
   */
  function init() {

    if(self.isRMGMode()) {
      // if dealing with real money initial stake is 50p
      // this must be done before calculateCoins() is called
      data.prediction.stake = (0.5).toFixed(2)
    }
    calculatePercentages()
    calculateCoins()
    calculateCountdown()
    // this came from the old code. not sure the point of it being like this
    // other than might make it obvious where to set and change these times
    var matchUpdateSpeed = { upcoming: 10000, live: 10000 }
    if ( self.isLive() ) {
      return data.matchUpdateSpeed = matchUpdateSpeed.live
    } else if ( self.isUpcoming() ) {
      return data.matchUpdateSpeed = matchUpdateSpeed.upcoming
    }

    // If score is null change to 0 for user to see score
    if(data.score && data.score.team1.score === null){
      data.score.team1.score = 0
    }
    if(data.score && data.score.team2.score === null){
      data.score.team2.score = 0
    }
    if(data.score && data.score.team1.halfTime === ''){
      data.score.showHalfTime = false
    }

    // in combination bets more we don't have this data
    if(data.score) {
      self.trigger('renderCommentary',data.score.commentary)
    }
  }

  /**
   * calculates the time since kick off
   * clock is rendered by matchStatusview
   */
  function updateMatchClock() {
    data.clock.seconds++

    if (data.clock.seconds === 60 && data.matchStatus !== 'Halftime'){
      data.clock.minutes++
      data.clock.seconds = 0
    }
    if (data.clock.seconds < 10) {data.clock.seconds = "0" + data.clock.seconds};

    self.trigger('updateMatchClock')

    if(!data.hasClockRunning){
      data.hasClockRunning = true
      setTimeout(function () {
        data.hasClockRunning = false
        updateMatchClock()
      }, 1000)
    }

  }

  function dealWithNewMatchData(response) {

  }

  function createAndSendBet() {
    var key // the way we obtain the odds id is different if we have predicted a score

    if(data.prediction.WDW) {
      key = data.prediction.outcome
    } else {
      key = data.prediction.team1+':'+data.prediction.team2
    }
    var newBetOddsId = data.odds[key].oddsId
    var newStake = data.prediction.stake
    self.setBet( {oddsId : newBetOddsId, stake:newStake} )
  }

  // Calculate coins from bet data
  function calculateCoins() {
    // fanbookz coins version
    fzc_calculateCoins = function () {
      for (var score in data.odds) {
        var quote = data.odds[score].odds
        data.coins[score] = Math.round(quote * data.prediction.stake)
      }
    }
    // real money gambling version
    rmg_calculateCoins = function () {
      for (var score in data.odds) {
        var quote = data.odds[score].odds
        data.coins[score] = (quote * data.prediction.stake).toFixed(2)
      }
    }
    // the code that switches for real money gambling or fanbookz coins
    self.isRMGMode() ? rmg_calculateCoins() : fzc_calculateCoins()
  }

  function calculatePercentages() {

    // calculate percentage of predicted outcomes
    var totalPredictions =
            data.currentPredictions.team1 +
            data.currentPredictions.team2 +
            data.currentPredictions.draw
        , team1Percentage =
            calculatePercentage(
                data.currentPredictions.team1, totalPredictions)
        , team2Percentage =
            calculatePercentage(
                data.currentPredictions.team2, totalPredictions)
        , drawPercentage =
            calculatePercentage(
                data.currentPredictions.draw, totalPredictions)

    data.currentPredictions.team1PercentagePretty = _.isNaN(team1Percentage) ? 33 : team1Percentage.toFixed(0)
    data.currentPredictions.team2PercentagePretty = _.isNaN(team2Percentage) ? 33 : team2Percentage.toFixed(0)
    data.currentPredictions.drawPercentagePretty = _.isNaN(drawPercentage) ? 33 : drawPercentage.toFixed(0)

    data.currentPredictions.team1Is100 = (team1Percentage == 100)
    data.currentPredictions.team2Is100 = (team2Percentage == 100)
    data.currentPredictions.drawIs100 = (drawPercentage == 100)

    data.currentPredictions.team1IsZero = (team1Percentage == 0)
    data.currentPredictions.team2IsZero = (team2Percentage == 0)
    data.currentPredictions.drawIsZero = (drawPercentage == 0)

    data.currentPredictions.team1Percentage = _.isNaN(team1Percentage) ? 33.33 : team1Percentage
    data.currentPredictions.team2Percentage = _.isNaN(team2Percentage) ? 33.33 : team2Percentage
    data.currentPredictions.drawPercentage = _.isNaN(drawPercentage) ? 33.33 : drawPercentage

  }

  function calculatePercentage(number, total) {
    var percentage = 100 * (parseFloat(number, 10) / parseFloat(total, 10))
    return percentage
  }

  /**
   * this gets called when you know the prediction
   * @param  {[type]} outcome [description]
   */
  function incrementCurrentPredictions(outcome) {
    data.currentPredictions[outcome]++
    calculatePercentages()
    self.trigger('renderFanZone')
  }


  /**
   * updates the models internal countdown to kick off
   * @return {boolean} true if we have less than 30 seconds.
   */
  function calculateCountdown() {
    var currentDate = Date.now()
        , matchDate = new Date(data.kickOff).getTime()
        , countdown = matchDate - currentDate
        , oneDay = 24 * 60 * 60 * 1000
        , oneHour = 60 * 60 * 1000
        , oneMinute = 60 * 1000
    // , dateIsInFuture = currentDate.getTime()
        , days = Math.floor(Math.abs((countdown)/(oneDay)))
        , hours = Math.abs((countdown)/(oneHour)) / 24.0
        , minutes = Math.abs((countdown)/(oneMinute)) / 60.0
        , secs = Math.abs((countdown)/1000) / 60.0

    if(new Date(currentDate).getTime() > matchDate){
      data.countdown =
      { days: 0
        , hrs: 0
        , mins: 0
        , secs: 0
      }
    } else {
      data.countdown =
      { days: days
        , hrs: Math.floor((hours - Math.floor(hours) ) * 24.0)
        , mins: Math.floor((minutes - Math.floor(minutes) ) * 60.0)
        , secs: Math.floor((secs - Math.floor(secs) ) * 60.0)
      }
    }

    // If 30 seconds before kickoff
    if(new Date(currentDate).getTime() + (30*1000) > matchDate){
      if(new Date(currentDate).getTime() > matchDate){
        return false // match status should be live now
      }
      return true
    }

    return false
  }

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
   * sets data.prediction.status to either correct or wrong
   * called at fulltime
   * @param  {Function} callback
   */
  function predictionCorrect (callback) {

    if(data.prediction.team1 === null || data.prediction.team2 === null){
      // user predicted win or draw
      switch(data.prediction.outcome){
        case 'team1':
          var predictionCorrect = data.score.team1.score > data.score.team2.score
          self.setPredictionState( (predictionCorrect) ? 'correct' : 'wrong' )
          break
        case 'team2':
          var predictionCorrect = data.score.team2.score > data.score.team1.score
          self.setPredictionState( (predictionCorrect) ? 'correct' : 'wrong' )
          break
        case 'draw':
          var predictionCorrect = data.score.team1.score === data.score.team2.score
          self.setPredictionState( (predictionCorrect) ? 'correct' : 'wrong' )
          break
      }

    } else {
      // user predicted a score
      var isTeam1ScoreCorrect = data.prediction.team1 == data.score.team1.score
          , isTeam2ScoreCorrect = data.prediction.team2 == data.score.team2.score
          , predictionCorrect = isTeam1ScoreCorrect && isTeam2ScoreCorrect

      self.setPredictionState( (predictionCorrect) ? 'correct' : 'wrong' )

    }

    if (callback && typeof(callback) === 'function') callback()

  }


  init()
  return self
};
