/**
 * some description goes here
 * @param  {jQuery object} element we're using
 * @param  {object} options optional
 * @return {ConfirmBetModalView} return itself for chaining
 */
ConfirmBetModalView = function(element,options) {
  this.$el = element
  var scope = this
      ,initialState = options.initialState
      ,model        = options.model
      ,overlay      = options.$overlay
      ,template     = {
          confirm: Hogan.compile($('.temp__combination-confirm-modal__confirm').html())
        , waiting: Hogan.compile($('.temp__combination-confirm-modal__waiting').html())
        , success: Hogan.compile($('.temp__combination-confirm-modal__success').html())
        , fail   : Hogan.compile($('.temp__combination-confirm-modal__fail').html())
      }
      ,state = 'confirm'

  /* ------------------ model listeners ------------------ */
  model.on('confirmCombinationBet', showModal)
  model.on('cancelCombinationBet', hideModal)
  model.on('modal:showWaiting', showWaiting)
  model.on('modal:showSuccess', showSuccess)
  model.on('modal:showFail', showFail)

  /* ------------------- public methods ------------------- */
  scope.render = function() {
    model.displayOdds = model.combinationOdds.toFixed(2)
    var html = template[state].render(model)
    scope.$el.html(html)

    return this
  }


  scope.initialise = function() {
    delegateEvents()
    return this
  }

  /* ----------------- private functions ------------------ */
  function delegateEvents() {

    scope.$el.on('click', '.js-combi-bet-confirm', function confirmCombinationBet(e) {
      model.sendCombinationBet()
    })

    scope.$el.on('click', '.js-combi-bet-cancel', function cancelCombinationBet(e) {
      model.trigger('cancelCombinationBet')
    })

    scope.$el.on('click', '.js-combi-bet-another', function cancelCombinationBet(e) {
      model.trigger('cancelCombinationBet')
    })

  }


  function showModal() {
    scope.render()
    overlay.fadeIn()
  }

  function hideModal() {
    state = 'confirm'
    overlay.fadeOut()
  }

  function showWaiting() {
    state = 'waiting'
    scope.render()
  }

  function showSuccess() {
    state = 'success'
    scope.render()
  }

  function showFail() {
    state = 'fail'
    scope.render()
  }

  return this
}
