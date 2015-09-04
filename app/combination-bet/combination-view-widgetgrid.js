/**
 * module to control the combination betting grid of widgets
 * @param  {jQuery object} element we're using
 * @param  {object} options optional
 * @return {WidgetGridView} return itself for chaining
 */
WidgetGridView = function(element,options) {
  this.$el = element
  var scope = this
      ,initialState = options.initialState
      ,model        = options.model
      ,$mpus        = $('.js-combination-bet__predictors__predictor')

  /* ------------------ model listeners ------------------ */
  model.on('updateCompetition', showCompetition)

  /* ------------------- public methods ------------------- */
  this.render = function() {
    return this
  }

  this.initialise = function() {
    return this
  }

  /* ----------------- private functions ------------------ */

  function showCompetition() {
    if(model.competitionId == 'all') {
      $mpus.fadeIn(400, function() {
        model.trigger('showtutorial')
      })
    } else {
      $mpus.fadeOut()
      $( '.js-competition-id-'+model.competitionId ).fadeIn(400, function() {
         model.trigger('showtutorial')
      })
    }

  }

  return this
}
