/**
 * view component that handles the dom after a match is predicted
 * @param  {jQuery object} element - the parent DOM element controlled
 * @param  {object} options object ...
 */
PredictedView = function(element, options) {
  this.$el = element
  var scope=this
      ,model        = options.model
      ,messages     = options.messages
      ,status       = null
      ,template     = function() {
        var tmp = {
          // change errors to alerts
          errorTooltipTemplate: Hogan.compile($('.temp__rmg-tooltip').html())
         ,tooltipContentTemplate: Hogan.compile($('.temp__prediction-status__upcoming-prediction__tooltip').html())

         ,predicted: Hogan.compile($('.temp__prediction-status__upcoming-prediction').html())
          // response to successfully placing bet/prediction
         ,upcomingPredicted: Hogan.compile($('.temp__prediction-status__upcoming-prediction').html())
        }
        if(model.user && model.user.gameType === 'rmg') {
          tmp = _.extend(tmp,{
            predicted: Hogan.compile($('.temp__rmg-prediction-status__upcoming-prediction').html())
              // response to successfully placing bet/prediction
           ,upcomingPredicted: Hogan.compile($('.temp__rmg-prediction-status__upcoming-prediction').html())
          })
        }

        return tmp
      }()


  /* ------------------ model listeners ------------------ */


  /* ------------------- public methods ------------------- */
  this.render = function(templateName) {

    var extras  = { yourPrediction: {
         message: messages.prediction.yourPrediction()
      }
    }

    // attach 1 or 2 shirts (if draw)
    if (model.prediction.outcome === 'draw') {
      extras.yourPrediction.shirt1 = model.teams['team1'].shirt
      extras.yourPrediction.shirt2 = model.teams['team2'].shirt
    } else {
      extras.yourPrediction.shirt1 = model.teams[model.prediction.outcome].shirt
    }

    // calculate potential winnings in RM for the RMG promo banner
    if (model.user.gameType !== 'rmg') {
      extras.rmgPotentialWinnings = model.calculateWinningsRMG({stake: 1})
    }

    // render
    if(!templateName) {templateName = model.prediction.status}
    var html = template[templateName].render(_.extend(model, extras))
    this.$el.html(html)
    return this

  }

  $(window).load(function() {
    setTimeout(function() {
      $('.js-promo-banner-match').addClass('active')
    }, 2000);
    setTimeout(function() {
      $('.js-promo-banner-match').removeClass('active')
    }, 4000);

  })

    setTimeout(function() {
      $('.js-promo-banner-match').addClass('active')
    }, 2000);
    setTimeout(function() {
      $('.js-promo-banner-match').removeClass('active')
    }, 4000);

  this.initialise = function() {

    var eventDispatcher = EventDispatcher.getInstance()

    this.$el.on('click', '.js-promo-banner-match', function(){
      eventDispatcher.trigger('MATCHWIDGET:TURN_RMG_ON')
    })

    var $predictNextButton = this.$el.find('.js-predict-next')
        , title = $predictNextButton.data('tooltip-title-default')
        , competitionName = $predictNextButton.data('tooltip-competition-name')

    if (!Modernizr.touch) {
      this.$el.find('.js-predict-next').tooltip({
          template: template.errorTooltipTemplate.render({
            errorClass: 'next_game--tooltip'
          })
        , placement: 'top'
        , trigger: 'manual'
        , title: template.tooltipContentTemplate.render(_.extend(model, {
            title: title,
            competition: competitionName
        }))
        , html: true
      })
      .tooltip('show')
      .tooltip('hide')
      .on('mouseenter', function(e){
        $(e.currentTarget).tooltip('show')
      })
      .on('mouseout', function(e){
        $(e.currentTarget).tooltip('hide')
      })
    }

    // mobile version of the tooltip - show inline
    else {
      var $nextGameInner = this.$el.find('.js-next-game-inner')
      var $inlineNextGameViewContent = template.tooltipContentTemplate.render(_.extend(model, { title: title }))
      $nextGameInner.append($inlineNextGameViewContent)
    }


    // fb sharing
    this.$el.on('click', '.js-fb-share', function(e){
      e.preventDefault()
      FB.ui({
        method: 'share',
        href: window.location.href
      }, function(response){
        console.log("response", response);
      });
    })

    return this
  }

  /* ----------------- private functions ------------------ */


  return this

}

