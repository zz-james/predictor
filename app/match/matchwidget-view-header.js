/**
 * hides or shows a H2 element that contains title text
 * @param  {jQuery object} element we're using
 * @param  {object} options optional
 * @return {HeaderView} return itself for chaining
 */
HeaderView = function(element,options) {
  this.$el = element
  var scope = this
      ,initialState = options.initialState
      ,model        = options.model

  /* ------------------ model listeners ------------------ */
  model.on('headerChange', headerChange)

  /* ------------------- public methods ------------------- */
  this.render = function(cssclass) {

    scope.$el.find('h2').addClass('is--hidden')

    if(model.prediction.status == 'predicted' ||
      model.prediction.status == 'upcomingPredicted') {
      return
    }
    if(cssclass){
      scope.$el.find(cssclass).removeClass('is--hidden')
    }
  }

  this.initialise = function() {
    headerChange('.js-match__prompt--initial') // initial text
  }

  /* ----------------- private functions ------------------ */
  function headerChange(cssclass) {
    scope.render(cssclass);
  }

  return this
}