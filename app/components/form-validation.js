/* jshint unused: false */
var FanbookzFormValidation = (function($) {

  // Module object to be returned
  var module =
    {}

  /**
   * Initialise
   */
  module.init = function() {

    //==============================================================================
    // Form input focus tooltip
    //==============================================================================

    $('input.js-input-has-focus-tooltip').tooltip({
      'trigger': 'focus'
      , 'placement': 'top'
    })

    //==============================================================================
    // Form validation
    //==============================================================================
    var $forms = $('form')
    if ($forms.length) {

      $forms.parsley({
        errorClass: 'is-error'
      , successClass: 'is-success'
      , errorsWrapper: '<ul class="alert-list"></ul>'
      , errorTemplate: '<li class="alert alert--danger"></li>'
      // TODO this only for team picker form
      , excluded: 'input[type=reset], [disabled]'
      })

    }

    // this functionality is only used on the splash page so far
    if ($('.js-form-tooltip-errors').length) {

      // listen to parsley live validation errors
      $.listen('parsley:field:error', this, function(e) {

        var $input = $(e.$element)
        var errorMsg = window.ParsleyUI.getErrorsMessages(e);

        // If failed with more than one error, display only the top error
        if (e._ui.failedOnce) {
          var prevErrorMessage = $input.attr('data-original-title')
          if(prevErrorMessage === errorMsg[0]){
            return
          }
        }

        $input.attr('title', errorMsg[0])
              .attr('data-original-title', errorMsg[0]); //TODO refactor this, is not clear

        var hiddenAttr = $input.attr('hidden');
        if (typeof hiddenAttr === 'undefined' || hiddenAttr !=='hidden') {
          $input.tooltip({trigger: 'manual'});
        } else {
          // for teampicker select box
          $('.js-input-team-owner').addClass('has-error').attr('title', errorMsg[0]).tooltip();
        }

      })

      // listen to parlsey validation success
      $.listen('parsley:field:success', this, function(e) {

        var $input = $(e.$element)

        // destroy the tooltiip
        var hasTooltip = typeof ($input.data('bs.tooltip')) !== 'undefined';
        if (hasTooltip) {
          $input.tooltip('destroy');
        }

      });

      // for backend errors, if present, copy the error text from
      // the error container and append as tooltip
      $('.js-field-errors').each(function(i, fieldError){

        var inputId = $(fieldError).attr('class').match(/(js-for-)(\w+)/)[2]
          , inputField = $('.js-input-'+inputId)[0]
          , parsleyInstance = inputField ? $(inputField).data('Parsley') : undefined
          , message = $(fieldError).find('li').text()

        $(inputField).attr('title', message)
                     .attr('data-original-title', message);

        if ( parsleyInstance ) {

          window.ParsleyUI.addError(parsleyInstance, '_undefined', message);
          $(inputField).tooltip({trigger: 'manual'});
          return;

        } else {

          var $inputField = $(inputField);
          if ($inputField.attr('type')==='submit') {
            // input[type=submit] keeps getting ignored by the Parley plugin,
            // so it won't have a ParsleyUI object assigned to it

            $inputField.tooltip({trigger: 'manual'}).tooltip('show');

            $inputField.closest('.page').click(function(){
              $inputField.tooltip('destroy');
            });

          }

        }

      });

      // display tooltip with errors on focus,
      // hide on blur
      $('.js-input-has-parsley-validation').focus(function(e){

        var hasTooltip = typeof ($(e.currentTarget).data('bs.tooltip')) !== 'undefined';
        var parsleyInstance = $(e.currentTarget).data('Parsley')
        if (hasTooltip) {
          $(e.currentTarget).tooltip('show')
        }

      }).blur(function(e){

        var hasTooltip = typeof ($(e.currentTarget).data('bs.tooltip')) !== 'undefined';
        if (hasTooltip) {
          $(e.currentTarget).tooltip('hide');
        }

      }).mouseout(function(e){

        var hasTooltip = typeof ($(e.currentTarget).data('bs.tooltip')) !== 'undefined';
        if (hasTooltip) {
          $(e.currentTarget).tooltip('hide');
        }

      });
    }

  }

  return module

})(window.jQuery)
