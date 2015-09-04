FANBOOKZ.helpers = {
  formPost: function($element, callback) {

    $element.submit(function(event){
      // prevent default posting of form
      event.preventDefault()
      FANBOOKZ.helpers.formPostSubmit($element, callback)
    })

  }
  , formPostSubmit : function ($element, callback) {
    var request
      , copy =
      { posting: 'Please wait…'
        , original: undefined
        , success: 'Success'
      }
      , successDisplayTime = 2000
      , $form = $element
      , $btn = $form.find('.js-submit')

    // Get submit original copy
    copy.original = $btn.val()

    // Add posting copy to button
    $btn.val(copy.posting)

    // let's select and cache all the fields
    var $inputs = $form.find('input, select, button, textarea')

    // serialize the data in the form
    var serializedData = $form.serialize()
    var serializedArray = $form.serializeArray()

    // let's disable the inputs for the duration of the ajax request
    // Note: we disable elements AFTER the form data has been serialized.
    // Disabled form elements will not be serialized.
    $inputs.prop('disabled', true)

    // Get form action
    var formAction = $form.attr('action')

    // send request to apporiate place, the action
    request = $.ajax({
      url: formAction
      , type: 'post'
      , data: serializedData
    })

    // callback handler that will be called on success
    request.done(function(response, textStatus, jqXHR){
      // log a message to the console
      if (callback && typeof(callback) === 'function') {
        // Show success message in button
        $btn.val(copy.success)
        // After the defined time show the original button text
        setTimeout(function(){
          $btn.val(copy.original)
        }, successDisplayTime)
        // Clear form data
        $(':input',$form)
          .removeAttr('checked')
          .removeAttr('selected')
          .not(':button, :submit, :reset, :hidden, :radio, :checkbox, #comment_thread')
          .val('')
        callback(serializedArray, response, textStatus, jqXHR)
      }
    })

    // callback handler that will be called on failure
    request.fail(function (jqXHR, textStatus, errorThrown){
      // log the error to the console
      console.error(
        'The following error occured: ' +
          textStatus, errorThrown, jqXHR, errorThrown
      )
      if (callback && typeof(callback) === 'function') {
        callback(serializedArray, errorThrown, textStatus, jqXHR)
      }
      $btn.val(copy.original)
    })

    // callback handler that will be called regardless
    // if the request failed or succeeded
    request.always(function () {
      // reenable the inputs
      $inputs.prop('disabled', false)
    })


  }
  // Helper function to get external templates
  , getTemplate : function (url, callback) {
      $.get(url, function(template) {
        if(callback && typeof(callback) === 'function'){
          callback(template)
        } else {
          return template
        }
      })
    }
}
