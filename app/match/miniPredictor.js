/* jshint unused: false */
function MiniPredictor(userOptions) {
  // Private variables
  var matchUpdateSpeed =
      { upcoming: 10000
      , live: 10000
      }
    , hasCountdownRunning = false
    , hasClockRunning = false

  // Public Variables
  this.setOptions = function(userOptions) {
    userOptions = $.extend(this.options, userOptions)
  }

  this.data = {}

  // Private Functions
  var calculateCountdown
    , calculatePercentages
    , calculatePercentage
    , calculateCrowdPercentages
    , updatePercentages
    , renderLess30Secs

  ;(function (scope) {

    calculateCountdown = function() {
      var currentDate = Date.now()
        , matchDate = new Date(scope.data.kickOff).getTime()
        , countdown = matchDate - currentDate
        , oneDay = 24 * 60 * 60 * 1000
        , oneHour = 60 * 60 * 1000
        , oneMinute = 60 * 1000
        , days = Math.floor(Math.abs((countdown)/(oneDay)))
        , hours = Math.abs((countdown)/(oneHour)) / 24.0
        , minutes = Math.abs((countdown)/(oneMinute)) / 60.0
        , secs = Math.abs((countdown)/1000) / 60.0

      if(new Date(currentDate).getTime() > matchDate){
        scope.data.countdown =
          { days: 0
          , hrs: 0
          , mins: 0
          , secs: 0
          }
      } else {

        scope.data.countdown =
          { days: days
          , hrs: Math.floor((hours - Math.floor(hours) ) * 24.0)
          , mins: Math.floor((minutes - Math.floor(minutes) ) * 60.0)
          , secs: Math.floor((secs - Math.floor(secs) ) * 60.0)
          }
      }

      // If 30 seconds before kickoff
      if(new Date(currentDate).getTime() + (30*1000) > matchDate){
        renderLess30Secs()
      }

    }
    // update countdown functionality
    updateCountdown = function () {
      calculateCountdown()
      scope.$el.find('.js-mini-countdown__days').text(scope.data.countdown.days)
      scope.$el.find('.js-mini-countdown__hours').text(scope.data.countdown.hrs)
      scope.$el.find('.js-mini-countdown__mins').text(scope.data.countdown.mins)
      scope.$el.find('.js-mini-countdown__secs').text(scope.data.countdown.secs)
      if(!hasCountdownRunning){
        // console.log('update')
        hasCountdownRunning = true
        setTimeout(function () {
          hasCountdownRunning = false
          updateCountdown()
        }, 1000)
      }
    }
    calculatePercentages = function () {
      // calculate percentage of predicted outcomes
      var totalPredictions =
            scope.data.currentPredictions.team1 +
            scope.data.currentPredictions.team2 +
            scope.data.currentPredictions.draw
        , team1Percentage =
            calculatePercentage(
              scope.data.currentPredictions.team1, totalPredictions)
        , team2Percentage =
            calculatePercentage(
              scope.data.currentPredictions.team2, totalPredictions)
        , drawPercentage =
            calculatePercentage(
              scope.data.currentPredictions.draw, totalPredictions)
          , crowdPercentage =
              100 -
              calculatePercentage( scope.data.currentPredictions.team1, totalPredictions) -
              calculatePercentage( scope.data.currentPredictions.team2, totalPredictions)

      // Add percentage predicted outcomes to data
      scope.data.currentPredictions.team1Percentage = team1Percentage
      scope.data.currentPredictions.team1PercentagePretty = Math.floor(team1Percentage)
      scope.data.currentPredictions.team2Percentage = team2Percentage
      scope.data.currentPredictions.team2PercentagePretty = Math.floor(team2Percentage)
      scope.data.currentPredictions.drawPercentage = drawPercentage
      scope.data.currentPredictions.drawPercentagePretty = Math.floor(drawPercentage)
      scope.data.currentPredictions.crowdPercentage = crowdPercentage
    }
    calculatePercentage = function (number, total) {
      var percentage = 100 * (parseFloat(number, 10) / parseFloat(total, 10))
      // @todo needs to not show 33.33 on view
      return _.isNaN(percentage) ? 33.33 : percentage.toFixed(0)
    }
    calculateCrowdPercentages = function () {
      var totalCrowd = scope.data.currentPredictions.team1 + scope.data.currentPredictions.team2
        , overlap = 10
        , team1Percentage = calculatePercentage(scope.data.currentPredictions.team1, totalCrowd)
        , team2Percentage = calculatePercentage(scope.data.currentPredictions.team2, totalCrowd)
        , crowdPercentages =
          { crowdPercentageTeam1: parseFloat(team1Percentage) + overlap
          , crowdPercentageTeam2: parseFloat(team2Percentage) + overlap
          , crowdLeader: ( team1Percentage > team2Percentage ? 'team1-ahead' : 'team2-ahead')
          }

      return crowdPercentages
    }
    renderSupporters = function () {
      $('.js-mini-supporters--team1').text('Fans ' + scope.data.currentPredictions.team1PercentagePretty + '%')
      $('.js-mini-supporters--team2').text('Fans ' + scope.data.currentPredictions.team2PercentagePretty + '%')
      $('.js-mini-supporters--draw').text('Fans ' + scope.data.currentPredictions.drawPercentagePretty + '%')
    }
    renderLess30Secs = function () {
      $('.js-predictor-mini__outcomes').remove()
      $('.js-predictor-mini__status--kickoff').show()
    }
  })(this)

  this.init = function() {
    this.$el = userOptions.el
    this.data.kickOff = this.$el.data('kickoff')
    this.data.currentPredictions =
      { team1: parseInt(this.$el.data('currentpredictionsTeam1'))
      , team2: parseInt(this.$el.data('currentpredictionsTeam2'))
      , draw: parseInt(this.$el.data('currentpredictionsDraw'))
      }
  }
  this.render = function () {
    // Render base template
    calculatePercentages()
    // Calculate coins from bet data

    calculateCountdown()
    var crowdPercentages = calculateCrowdPercentages()

    updateCountdown()
    renderSupporters()
  }
  this.getCountdown = function () {
    return data.countdown
  }
  this.setOptions(userOptions)
  this.init()
}
