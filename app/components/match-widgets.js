/* jshint unused: false */
var FanbookzMatchWidgets = (function($) {

  // Module object to be returned
  var module = {}

  /**
   * Initialise
   */
  module.init = function() {


    // check for combination predictors
    var isCombiPredictor = !!$('.js-combination-bet__predictors').length


    // init mini predictors
    var $miniPredictors = $('.js-match-widget-mpu')

    if ($miniPredictors.length) {
      $miniPredictors.map(function(index, miniPredictor){

        var $this = $(this)

        var widgetData = $this.data('widget-data')
        widgetData.combiPredictor = isCombiPredictor


        var mv = new MiniMatchWidget({
          el: $this
          ,visChecker: VisSense(this) // VisSense allows us to check visibility of element
        }, widgetData)
        mv.render()

      })
    }

    // init full predictor
    // doesn't need a loop really but whatev
    var fullPredictors = $('.js-match-widget-full')

    if (fullPredictors.length) {

      fullPredictors.map(function() {
        var $this = $(this)

        var widgetData = $this.data('widget-data')

        var mv = new MatchWidget({
            el: $this
        }, widgetData)

        mv.render()
      })

    }
  }

  return module

})(window.jQuery)
