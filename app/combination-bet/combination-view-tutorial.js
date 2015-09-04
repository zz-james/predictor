/**
 * manages the combination betting tutorial
 * @param  {jQuery object} element we're using
 * @param  {object} options optional
 * @return {CombinationBetTutorialView} return itself for chaining
 */
CombinationBetTutorialView = function(element,options) {
  this.$el = element
  var scope = this
  ,model        = options.model
  ,$secondP = options.secondP
  ,$thirdP  = options.thirdP

  /* ------------------ model listeners ------------------ */
  model.on('showtutorial', movePredictors)

  /* ------------------- public methods ------------------- */
  this.render = function() {
    // scope.$el
    return this
  }

  this.initialise = function() {
    // find second and third grid item and move left b/cos tutorial is there
    // use classes with media queries to determine if 2 or 3 predictors need to move
    $secondP = $('.js-combination-bet__predictors__predictor:visible').slice( 0, 1).addClass('js-predictor-1')
    $thirdP  = $('.js-combination-bet__predictors__predictor:visible').slice( 1, 2).addClass('js-predictor-2')

    // show tutorial
    scope.$el.removeClass('hidden')
    scope.$el.find('#combination-tutorial-page-1').css('display','block')

    // make swipe able
    scope.mySwipe = new Swipe(document.getElementById('slider'), {
      continuous: false
      , callback: function(index, elem) {
          updateIndicator(index + 1)
      }
    });

    delegateEvents()
    return this
  }

  /* ----------------- private functions ------------------ */

  /**
   * have to move the second and third items in the grid if tutorial is showing
   * when league changes this will change so we have to refigure out
   * which ones are the two to move
   */
  function movePredictors() {
    resetPredictors()
    $secondP = $('.js-combination-bet__predictors__predictor:visible').slice( 0, 1).addClass('js-predictor-1')
    $thirdP  = $('.js-combination-bet__predictors__predictor:visible').slice( 1, 2).addClass('js-predictor-2')
  }

  function resetPredictors() {
    $secondP.removeClass('js-predictor-1')
    $thirdP.removeClass( 'js-predictor-2')
  }

  function delegateEvents() {
    scope.$el.on('click', '.js-combination-tutorial-close', function submitComboBet(e) {
      hideTutorial()
    })

    scope.$el.on('click', '.js-combination-tutorial-ok', function submitComboBet(e) {
      if( scope.mySwipe.getPos() === 2 ) { hideTutorial() }
      scope.mySwipe.next()
    })

    // to do - link in 3rd page of tutorial to open bet history in modal
    // scope.$el.on('click', '.modal-open-history', function submitComboBet(e) {
    //   var modalController = new FSBModalController()
    // })
  }

  function updateIndicator(page) {
    scope.$el.find('.tutorial-pagination li').removeClass('active')
    scope.$el.find('.tutorial-pagination li:nth-child('+ page +')').addClass('active')
  }

  function hideTutorial() {
    model.off('showtutorial')
    scope.$el.fadeOut(400,function(){
      scope.$el.closest('.js-combination-bet__predictors').removeClass('js-has-tutorial')
      resetPredictors()
    })

  }

  return this
}
