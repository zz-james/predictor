/**
 * renders the fanzone - an infographic which shows %prediction within site community
 * @param  {jQuery object} element we're using
 * @param  {object} options optional
 * @return {FanZoneView} return itself for chaining
 */
FanZoneView = function(element,options) {
  this.$el = element
  var scope = this
      ,initialState = options.initialState
      ,model        = options.model
      ,isMini       = options.isMini
      ,template     = function() {
        var tmp = {
          fanzone: Hogan.compile($('.temp__match-widget__fanzone').html())
        }
        if(isMini){
          tmp = {
            fanzone: Hogan.compile($('.temp__match-widget__fanzone-mini').html())
            , fanzoneMiniDesktop: Hogan.compile($('.temp__match-widget__fanzone-mini-desktop').html())
          }
        }
        return tmp
      }()

  /* ------------------ model listeners ------------------ */
  model.on('renderFanZone', update)

  /* ------------------- public methods ------------------- */
  this.render = function() {
    if (isMini && !Modernizr.touch) {
      // don't render anything on desktop mini
      return this
    }

    var crowdPercentages = model.setCrowdPercentages()
      , temp = template.fanzone.render(model)

    if(model.isUpcoming()){
      var html = template['fanzone'].render(model)
      element.html(html)
    }
    return this
  }

  this.initialise = function() {
    if (isMini && !Modernizr.touch) {
     ['.js-match__home-win', '.js-match__away-win', '.js-match__draw'].forEach(function(elClass, index, array){
        scope.$el.closest('.js-match-widget').find(elClass).tooltip({
            template: Hogan.compile($('.temp__rmg-tooltip').html()).render({
              errorClass: 'match-widget__fanzone__stat--tooltip'
            })
          , placement: 'top'
          , trigger: 'manual'
          , title: template.fanzoneMiniDesktop.render({
            percentage: function(){
              switch(index) {
                case 0:
                  return model.currentPredictions.team1PercentagePretty
                  break
                case 1:
                  return model.currentPredictions.team2PercentagePretty
                  break
                case 2:
                  return model.currentPredictions.drawPercentagePretty
                  break
              }
            }()
          })
          , html: true
        })
        .on('mouseenter', function(e){
          $(e.currentTarget).tooltip('show')
        })
        .on('mouseleave', function(e){
          $(e.currentTarget).tooltip('hide')
        })
     })
    }
    return this
  }

  this.clear = function() {
    model.off('renderFanZone')
    this.$el.empty()
  }

  /* ----------------- private functions ------------------ */
  function update() {
    scope.render()
  }

  return this
}
