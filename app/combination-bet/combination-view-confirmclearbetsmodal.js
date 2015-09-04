/**
 * some description goes here
 * @param  {jQuery object} element we're using
 * @param  {object} options optional
 * @return {ConfirmClearBetsModalView} return itself for chaining
 */
ConfirmClearBetsModalView = function(element,options) {
  this.$el = element
  var scope = this
      ,initialState = options.initialState
      ,model        = options.model
      ,overlay      = options.$overlay
      ,template     = {
          confirm: Hogan.compile($('.temp__combination__clear-selection_confirm').html())
      }

  /* ------------------ model listeners ------------------ */
  model.on('confirmClearCombinationBets', showModal)
  model.on('cancelConfirmClearCombinationBets', hideModal)

  /* ------------------- public methods ------------------- */
  scope.render = function() {
    var html = template.confirm.render(model)
    scope.$el.html(html)
    return this
  }

  scope.initialise = function() {
    delegateEvents()
    return this
  }

  /* ----------------- private functions ------------------ */
  function delegateEvents() {
    overlay.on('click', '.js-combi-bet-clear', function clearCombinationBet(e) {
      model.clearMatchList()
      confirmState = false
    })

    overlay.on('click', '.js-combi-bet-cancel', function cancelClearCombinationBet (e) {
      hideModal()
      e.preventDefault()
    })
  }

  function showModal() {
    scope.render()
    overlay.fadeIn()
  }

  function hideModal() {
    overlay.fadeOut()
  }

  return this
}
