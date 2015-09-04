/**
 * module to control the combination betting footer
 * @param  {jQuery object} element we're using
 * @param  {object} options optional
 * @return {FooterView} return itself for chaining
 */
CombinationFooterView = function(element,options) {
  this.$el = element
  var scope = this
      ,initialState = options.initialState
      ,model        = options.model
      ,selectionsPanelOpen = false
      ,cachedCombinationLength = -1
      ,template     = {
          footer: Hogan.compile($('.temp__combination-footer').html())
        , selectionMatch: Hogan.compile($('.temp_combination_selection_match').html())
      }
      // cached jQuery DOM elements
      ,$selectedMatches
      ,$selectedMatchesCounter
      ,confirmState

  /* ------------------ model listeners ------------------ */
  model.on('updateWinnings', updateWinnings)
  model.on('updateCombination', renderPredictionList)
  model.on('confirmCombinationBet', renderConfirm)
  model.on('cancelCombinationBet', renderUnConfirm)
  model.on('Error:Combination:Ajax', handleExpiredPriceIdAjaxError)

  /* ------------------- public methods ------------------- */

  scope.initialise = function() {
    delegateEvents()
    return this
  }

  scope.render = function() {

    // check if this is the first match being added
    // if so open up the list
    if (cachedCombinationLength === -1 && model.matchList.length === 1) {

      selectionsPanelOpen = true // open selection panel

      // mobile/tablet only
      if ($('html').hasClass('touch')) {
        setTimeout(function(){
          toggleSelectedPanelOnDesktop()
        }, 3000)
      }

    }

    _.extend(model, {
      selectionsPanelOpen: selectionsPanelOpen
     ,confirmState       : confirmState
    })

    var html = template.footer.render(model)
    scope.$el.html(html)

    // cache $DOM elements
    $selectedMatches        = scope.$el.find('.js-combination-bet__footer__selections__matches')
    $selectedMatchesCounter = scope.$el.find('.js-combination-bet__footer__selections__count')

    renderPredictionList()
    setFooterMargin()

    return this
  }

  /* ----------------- private functions ------------------ */

  // is only called once - after initialise
  function delegateEvents() {

    scope.$el.on('click', '.js-match__stake-menu', function changeStake(e) {
      var _hash = e.target.hash
      newStake = parseInt(_hash.substr(1), 10) / 100
      model.setStake(newStake)
    })


    scope.$el.on('click', '.js-selections-toggle, .js-mobile-selection-toggle', toggleSelectedPanelOnDesktop)


    scope.$el.on('click', '.js-combination-bet-match-remove', function removeMatchFromSelection(e) {
      var matchId = $(e.currentTarget).closest('.js-selected-match').data().matchId
      model.removeMatchFromCombination(matchId)
      if(confirmState) {
        model.trigger('cancelCombinationBet')
      }
    })


    scope.$el.on('click', '.js-combi-bet-confirm-clear', function confirmClearCombinationBet(e) {
      if (model.combinationOdds.toFixed(2) > 0) {
        model.trigger('confirmClearCombinationBets')
      }
      e.preventDefault()
    });


    scope.$el.on('click', '.js-combi-bet-submit', function submitComboBet(e) {
      if(!selectionsPanelOpen){
        toggleSelectedPanelOnDesktop()
      }
      model.trigger('confirmCombinationBet')
    })





    // scope.$el.on('click', '.js-combi-bet-confirm', function confirmCombinationBet(e) {
    //   // alter button state
    //   if(confirmState === 'confirm') {
    //     // the 'or cancel' text
    //     scope.$el.find('.combination-bet__footer__bottom__center__or').css('display','none')
    //     scope.$el.find('.combination-bet__footer__bottom__center__cancel').css('display','none')
    //     $(this).html( scope.$el.find('.js-button-text-please-wait').html() ).parent().css('opacity','0.5')
    //     model.sendCombinationBet()
    //     confirmState = 'submitted'
    //   } else if(confirmState === 'success') {
    //     model.trigger('cancelCombinationBet')
    //   }
    // })



    // scope.$el.on('click', '.js-combi-bet-cancel', function cancelCombinationBet(e) {
    //   model.trigger('cancelCombinationBet')
    //   confirmState = false
    //   if(selectionsPanelOpen) {
    //     toggleSelectedPanelOnDesktop()
    //   }
    //   scope.render()
    // })

  }

  /* ------------------------------------------ stuff that isn't to do with setting dom events ------------------------------------------ */

  function toggleSelectedPanelOnDesktop(e) {
    if(!confirmState) {
      selectionsPanelOpen = !selectionsPanelOpen
      scope.render()

      if ($('html').hasClass('touch')) {
        $selectedMatches.addClass('full-view')
      }

    } else {
      model.trigger('cancelCombinationBet')
    }
  }

  function renderUnConfirm() {
    confirmState = false
    scope.render()
  }

  function renderConfirm() {
    confirmState = 'confirm'
    scope.render()
  }

  /**
   * handles the rendering of the list of matches in the UI
   */
  function renderPredictionList() {
    $selectedMatchesCounter.text(model.matchList.length)
    if (!selectionsPanelOpen) {
      return // no point rendering selections if the panel is closed
    }

    var allMatchesHtml = ''
      , newCombinationLength = model.matchList.length

    model.matchList.forEach(function(matchItem, i){

      var viewData = _.clone(matchItem)
      viewData.isNew = false
      // if we're removing items, don't set the isNew value on the last child
      if (newCombinationLength>cachedCombinationLength
          && i === newCombinationLength-1) {
        viewData.isNew = true
      }
      var matchHtml = template.selectionMatch.render(viewData)
      allMatchesHtml += matchHtml

    })
    $selectedMatches.html(allMatchesHtml)
    cachedCombinationLength = newCombinationLength

  }

  /**
   * updates the number in the winnings box bound to a value in the model
   */
  function updateWinnings() {
    scope.render()
  }


  // Set the footer to start above the sticky footer
  // This margin is set to 140px in the CSS but needs to be set dynamically in case it's a different value, eg on mobile
  // TODO I don't know what it really does
  // keep here for a while
  function setFooterMargin() {
    var stickyFooterHeight = $('.combination-bet__footer').height()
    $('.combination-bet .footer').css('margin-bottom', stickyFooterHeight + 'px')

  }

  function handleExpiredPriceIdAjaxError(response) {

    var errorObj = (typeof response !== 'undefined' && response.responseJSON) ? response.responseJSON : {}

    if (errorObj.type === 'EXPIRED_PRICE_ID') {
      model.matchList.forEach(function(matchItem, i){
        if (matchItem.matchId === errorObj.value) {
          matchItem.expiredPriceId = true
        }
      })
      selectionsPanelOpen = false
      toggleSelectedPanelOnDesktop()
    }

  }

  return this
}
