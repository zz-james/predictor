/////////////////// combination betting model extends match widget model ////////////////////////////
//       here we can override model methods and trigger events in the scope of the page model      //

function CombinationMatchWidgetModel(superClass) {

  var self = this
  , combinationModel
  , superClass = superClass

  /* ------------------ model listeners ------------------ */
  self.on('initialisePredictedMatch', onSetPredicted)


  /* ------------------- public methods ------------------- */

  this.initialise = function() {

    combinationModel = FANBOOKZ.combinationBet.subscribeMatchWidget(self)
    combinationModel.on('removeMatchFromCombination', self.onRemovePredictionsFromCombination)

  }


  /**
   * this overrides the mini match widgets set prediction method and exports the relevant prediction info
   * to the combinationModel. We don't need a seperate setBet method as the data exported is the same in
   * both cases and the matchwidget-mini is simpler if it is left in coins mode. the combinationModel will
   * decide whether the information is used in a bet or a prediction
   */
  this.setPrediction = function() {
      // if this is an exact score prediction the key to the odds table is different to just a win-draw-win
      var odds_key = self.prediction.WDW ? self.prediction.outcome : self.prediction.team1+':'+self.prediction.team2

      if (typeof self.odds[odds_key] === 'undefined') {
        self.trigger('Error:Mini:NoOdds')
        return
      }
      var data = {
         // TODO are team1Name & team2Name  used??
         // data is now duplicated from data.teams
         team1Name   :self.teams.team1.name
        ,team2Name   :self.teams.team2.name

        ,matchId     :self.matchId
        ,oddsId      :self.odds[odds_key].oddsId
        ,oddsValue   :self.odds[odds_key].odds
        ,prediction  : {
          isScorePrediction: self.prediction.status === 'scorePrediction' ? true : false
        , footerFormattedOutcome: (function(){
            if (self.prediction.status === 'scorePrediction') {
              return null
            }
            switch(self.prediction.outcome) {
              case 'team1':
                return { team1: true }
                break
              case 'team2':
                return { team2: true }
                break
              default:
                return { draw: true }
                break
            }
        })()
        , outcome: self.prediction.outcome
        , team1: self.prediction.team1
        , team2: self.prediction.team2
        , teams: self.teams
        }
      }
      if(combinationModel.createCombinationData(data)) {
        self.setPredictionState('upcomingPredicted')
        return
      }
      // else
      self.trigger('Error:Mini:Generic')
  }

  this.onRemovePredictionsFromCombination = function(matchId) {


    if (self.matchId === matchId) {
      self.setPredictionState('unpredicted')
    }

  }

  this.removeFromCombination = function() {

    combinationModel.removeMatchFromCombination(self.matchId)

  }

  /* ----------------- private functions ------------------ */

  function onSetPredicted(prediction) {
      superClass.setPrediction(prediction, true)
      self.setPredictionState('upcomingPredicted')
  }


}
