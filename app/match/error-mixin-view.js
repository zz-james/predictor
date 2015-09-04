/**
 * displays errors - mixin used with error views classes
 * @param {[type]} element [description]
 * @param {[type]} options [description]
 */

ErrorMixinView = function(element, options) {
  var LEVELS = {
          0: 'block'
        , 1: 'error'
        , 2: 'warning'
        , 3: 'info'
      }
    , errorTooltipTemplate = Hogan.compile($('.temp__rmg-tooltip').html())
    , errorTooltipCTATemplate = Hogan.compile($('.temp__rmg-error-content').html())

  /* ------------------ Methods ------------------ */
  this.appendErrorTooltip = function(responseJSON, $domEl, placement) {

    var d = $.Deferred()

    var cssClass = 'js-rmg-error-tooltip rmg-error-tooltip'
    if (responseJSON) {
      cssClass += ' ' + (responseJSON.cta ? 'has-cta' : '')
      // if severity hasn't been defined, set it to "warning"
      cssClass += ' ' + (typeof responseJSON.severityLevel === 'number' ? LEVELS[responseJSON.severityLevel] : LEVELS[2])
    }

    var hasTooltip = typeof $domEl.data('bs.tooltip') !== 'undefined'
    if (hasTooltip) {
      $domEl.tooltip('destroy')
    }

    $domEl.tooltip({
          template: errorTooltipTemplate.render({
            errorClass: cssClass
          })
        , placement: placement || 'bottom'
        , trigger: 'manual'
        , title: errorTooltipCTATemplate.render(responseJSON)
        , html: true
      }).tooltip('show')


    // TODO implement this properly - mobile events
    $('body').one('click', function(e){
      if ($(e.currentTarget).hasClass('.js-rmg-error-cta')) {
        // just in case
        return
      }
      $domEl.tooltip('destroy')
      d.reject()
      return
    })
    $('body').one('click', '.js-rmg-error-cta', function(e){
      e.preventDefault()
      e.stopPropagation()
      $domEl.tooltip('destroy')
      d.resolve()
      return
    })

    return d.promise()

  }

}



