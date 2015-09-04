FANBOOKZ.kitchenSink = {
    init: function() {
      // controller-wide code
    }
  , index: function() {
      // action-specific code
      $('.js-kitchensink__input').tooltip({
        container: 'body'
      , trigger: 'focus'
      })
      $('.js-kitchensink__input').focus()
    }
  }