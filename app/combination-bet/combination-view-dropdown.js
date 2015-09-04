/**
 * javascript view component to manage the copetitions drop down on the combination bets game
 * @param  {jQuery object} element we're using
 * @param  {object} options optional
 * @return {XxxxView} return itself for chaining
 */
CompetitionsDropDownView = function(element,options) {
  this.$el = element
  var scope = this
      ,initialState = options.initialState
      ,model        = options.model
      ,$menuLinks            = $('.js-competitions-dropdown__menu li a')
      ,$menuLinkContainers   = $('.js-competitions-dropdown__menu li')
      ,$toggle               = $('.js-competitions-dropdown__label')

  /* ------------------ model listeners ------------------ */


  /* ------------------- public methods ------------------- */
  this.render = function() {
    return this
  }

  this.initialise = function() {
    delegateEvents()
    return this
  }

  /* ----------------- private functions ------------------ */
  function delegateEvents() {

    $menuLinks.on('click', function changeStake(e) {
      var competitionId = (e.target.dataset.competitionId)
      model.setCompetition(competitionId)
      // now set drop down toggle box text to competition name
      showCompetitionDropDownHeader(e.target.innerHTML)
      // highligh chosen one
      $menuLinkContainers.removeClass('active')
      $(e.target).parent().addClass('active')
    })
  }

  // we could subscribe this to an event bound to a
  // value in the model but keeping simple for now
  function showCompetitionDropDownHeader(competition) {
    $toggle.html(competition)
  }

  return this
}