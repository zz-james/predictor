////////////////////////// model ////////////////////////////

/**
 * Constructor for the combination bet model,
 * uses observable to set/trigger events
 */
CombinationBetModel = function() {

  var self = observable(this)
  , endPoints = {
    submitBet : { url:paths.base+'/'+locale+'/api/fsb/make-bet', method: 'POST' }
  }

  self.matchList       = localStorage.getItem('matchList') ? JSON.parse(localStorage.getItem('matchList')) : []
  self.stake           = "0.50"
  self.winnings        = 0
  self.combinationOdds = 0
  self.competitionId   = 'all'  // initialise with all competitions

  self.initialise = function() {
    calculateWinnings()  // if there is a match list in local storage we need to calculate winnings for that on load
  }

  // when a predictor subscribes to this model we call
  // initialise predictor, if it is in the matchlist
  self.initialisePredictor = function(predictor) {
    var match = _.findWhere(self.matchList, {'matchId':predictor.matchId}) // should only find one
    if( match ) {
      refreshOdds(match, predictor) // as predictors in match list subscribe to events we refresh any stored odds
      predictor.trigger('initialisePredictedMatch', match.prediction)
      calculateWinnings()
    }
  }

  /**
   * stake setter
   * @param {float} value  - the value to set the stake to
   */
  self.setStake = function(value) {
    self.stake = value
    calculateWinnings()
  }

  self.setCompetition = function(id) {
    self.competitionId = id
    self.trigger('updateCompetition')
  }

  self.clearMatchList = function() {
    _.each(self.getMatchIdList(), function(matchId){
      self.trigger('removeMatchFromCombination', matchId)
    })
    self.trigger('cancelConfirmClearCombinationBets')
    self.matchList = []
    self.updateCombinationData()
  }

  /**
   * use this when bet is successfull to prepare for another bet
   * @return {[type]} [description]
   */
  self.resetMatchList = function() {
    _.each(self.getMatchIdList(), function(matchId){
      self.trigger('removeMatchFromCombination', matchId)
    })
    self.matchList = []
  }

  self.createCombinationData = function(data) {

    if (self.matchList.length >= 15) {
      self.trigger('Error:Combination:LimitExceeded:Predictions')
      return false
    }

    // check if match is in list, if not put it in.
    if(!_.where(self.matchList, {'matchId':data.matchId}).length) {
      self.matchList.push(data)
      localStorage.setItem('matchList', JSON.stringify(self.matchList))
    }

    calculateWinnings()


    // handle max winnings exceeded error
    if (self.winnings > 100000) {
      self.removeMatchFromCombination(data.matchId) // revert back
      self.trigger('Error:Combination:LimitExceeded:Winnings')
      return false
    }

    return true
  }

  self.updateCombinationData = function() {

    calculateWinnings()
    localStorage.setItem('matchList', JSON.stringify(self.matchList))
    self.trigger('updateCombination')

  }

  self.removeMatchFromCombination = function(matchId){
    self.matchList = _.filter(self.matchList, function(item) {
         return item.matchId !== matchId
    });
    self.trigger('removeMatchFromCombination', matchId)
    calculateWinnings()
    localStorage.setItem('matchList', JSON.stringify(self.matchList))
  }

  self.sendCombinationBet = function() {
    self.trigger('modal:showWaiting')

    var oddsIdArray    = _.map(self.matchList, function(match){ return match.oddsId; })
    var urlParams      = '/'+self.stake+'/'+oddsIdArray.join('/')

    var endPoint = endPoints['submitBet'].url+urlParams
    var method   = endPoints['submitBet'].method

    $.ajax({
      url: endPoint
      , method: method
    }).done(function() {
      self.trigger('modal:showSuccess')
      self.winnings = 0
      self.resetMatchList()
      localStorage.removeItem('matchList')
    }).fail(function(response) {
      self.trigger('cancelCombinationBet')
      self.trigger('Error:Combination:Ajax', response)
    })

    // Cookies.expire('matchList')
  }

  self.getMatchIdList = function() {
    return _.map(self.matchList, function(match){ return match.matchId; })
  }

  /* ----------------- private functions ------------------ */

  /**
   * takes a reference to a predictor as it loads and the entry in matchList with the same matchId
   * uses the new predictor to refresh the values in the matchList
   * @param  {object in matchlist} match
   * @param  {object matchwidget model} predictor
   */
  function refreshOdds(match, predictor) {
    var odds_key = match.prediction.isScorePrediction ? match.prediction.team1+':'+match.prediction.team2 : match.prediction.outcome
    var newOdds = predictor.odds[odds_key]
    match.oddsId = newOdds.oddsId
    match.oddsValue = newOdds.odds
  }

  function calculateWinnings() {
    self.combinationOdds = 0
    if(self.matchList.length) {
      self.combinationOdds = _.reduce(self.matchList, function(memo, num){
        return memo * num.oddsValue;
      }, 1)
    }
    self.winnings = self.stake * self.combinationOdds
    self.trigger('updateWinnings')
  }

}
