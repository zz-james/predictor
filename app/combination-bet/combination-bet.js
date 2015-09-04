/**
 * this script is a sort of combination bet factory
 * it instances a combination bets model, a view component for managing the footer
 * and a view component for handling the grid. there is only one of each of the objects
 * instanced in this script they are 'per page' not 'per predictor'
 */
FANBOOKZ.combinationBet = (function($) {

  var combinationBetModel

  this.init = function() {

    combinationBetModel = new CombinationBetModel()

    combinationBetModel.initialise()

    addCurrencyFormattingPower()


    // create some view objects to hadle display logic
    new CombinationFooterView( $('.js-combination-bet__footer') ,{
      model: combinationBetModel
    }).initialise().render()

    new WidgetGridView( $('.js-combination-bet__predictors') ,{
      model: combinationBetModel
    }).initialise().render()

    new CompetitionsDropDownView( $('.js-competitions-dropdown'), {
      model: combinationBetModel
    }).initialise()

    new ConfirmBetModalView( $('.js-combination-overlay__message'), {
      model: combinationBetModel
      ,$overlay: $('.combination-overlay')
    }).initialise()

    new ConfirmClearBetsModalView( $('.js-combination-overlay__message'), {
      model: combinationBetModel
      ,$overlay: $('.combination-overlay')
    }).initialise()

    if( $('.combination-bet__predictors__tutorial').length ) {
      new CombinationBetTutorialView( $('.js-combination-bet__predictors__tutorial'), {
        model: combinationBetModel
      }).initialise().render()
    }

    //
    var errorView = new ErrorCombinationView($('.js-combination-bet__footer'), {
      model: combinationBetModel
    }).initialise()


  }

  /**
   * returns a pointer to the combination match widget model
   * used by each of the match widgets via the matchwidget-combination-model-extension.js
   * @return {combinationBetModel}
   */
  this.subscribeMatchWidget = function(predictor) {
    combinationBetModel.initialisePredictor(predictor)
    return combinationBetModel
  }

  var addCurrencyFormattingPower = function() {

    // currency formatter needs to be initialised with the currency code first
    var headerModel = HeaderModel.getInstance()
    var currencyCode = headerModel && headerModel.user ? HeaderModel.getInstance().user.currencyCode : 'GBP'
    CurrencyFormatter.initialiseWithCurrencyCode({currencyCode: currencyCode})
    var convertCurrency = function() {
      return function(templateSnippet, render) {
        var tmpl = Hogan.compile(templateSnippet)
        var output = tmpl.c.compile(templateSnippet).render(combinationBetModel)
        return (CurrencyFormatter.getInstance().formatAmount(output))
      }
    }
    _.extend(combinationBetModel, {
        convertCurrency: convertCurrency
    })

  }

  return this

})(window.jQuery)
