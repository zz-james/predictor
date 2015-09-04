/**
 * some description goes here
 * @param  {jQuery object} element we're using
 * @param  {object} options optional
 * @return {XxxxView} return itself for chaining
 */
XxxxView = function(element,options) {
  this.$el = element
  var scope = this
      ,initialState = options.initialState
      ,model        = options.model
      ,template     = // hogan compile

  /* ------------------ model listeners ------------------ */
  model.on('event', handler)

  /* ------------------- public methods ------------------- */
  this.render = function() {
    // scope.$el
    return this
  }

  this.initialise = function() {

    return this
  }

  /* ----------------- private functions ------------------ */
  function someMethod() {

  }

  function handler() {

  }

  return this
}