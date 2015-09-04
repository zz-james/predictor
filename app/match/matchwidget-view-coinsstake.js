/**
 * displays coins drop down is used in the match status template and score prediction template
 * @param  {jQuery object} element we're using
 * @param  {object} options optional
 * @return {HeaderView} return itself for chaining
 */
CoinsStakeView = function(element,options) {
  this.$el = element
  var scope = this
      ,model           = options.model
      ,eventDispatcher = EventDispatcher.getInstance()
      ,template        = {
          stakeMenu: Hogan.compile($('.temp__coins-stake').html())
       }

  /* ------------------ model listeners ------------------ */
  model.on('updateStake', updateStake)
  model.on('predictionStateChange', hideStakeIfPredicted)
  eventDispatcher.on('hideStake', hideStake)

  /* ------------------- public methods ------------------- */
  this.render = function() {

    if(!(model.user && model.user.gameType === 'coins')) { return this } // below here are coins only shared events

    var html = template['stakeMenu'].render(model)
    scope.$el.html(html)
    delegateEvents()
    return this
  }

  this.initialise = function() {
    delegateEvents()
    hideStakeIfPredicted()
  }

  /* ----------------- private functions ------------------ */
  function delegateEvents() {
    //// COINS events /////
    if(!(model.user && model.user.gameType === 'coins')) { return this } // below here are coins only shared events

    scope.$el.find('.js-match__stake-menu').on('click', function(e) {
      var _hash = e.target.hash
      newStake = parseInt(_hash.substr(1), 10)
      model.setPredictionProperty('stake',newStake)
    })

  }

  function updateStake(){
      eventDispatcher.trigger('MATCHWIDGET:STOP_ANIMATIONS') // we don't want to see the button fade in
      model.setPredictionProperty('winnings', model.coins[model.prediction.team1+':'+model.prediction.team2])
      scope.render()
  }

  // this handler for hideStake event which is triggered if we go into a no odds state
  function hideStake() {
    scope.$el.css('display','none')
  }

  function hideStakeIfPredicted() {
    if(model.prediction.status == 'upcomingPredicted' || model.prediction.status == 'predicted') {
      // hide menu
      scope.$el.css('display','none')
    }
  }

  return this
}