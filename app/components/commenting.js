/* jshint unused: false */
var FanbookzCommenting = (function($) {

  // Module object to be returned
  var module =
    {}

  /**
   * Initialise
   */
  module.init = function() {

    var $commentContainer = $('.js-comment-container')
      , $commentContainerMasonry = $('.js-comment-container--masonry')
      , $commentPost = $('.js-comment-post')
      , $commentPostField = $('.js-social__comment-post__text')
      , $commentPostFileId = $('.js-social__comment-post__file_id')

    // Social columns
    if($commentContainerMasonry){
      imagesLoaded($commentContainerMasonry, function() {
        $commentContainerMasonry.masonry({
          itemSelector: '.js-social-post'
        , isAnimated: true
        })
      })
    }

    if( $commentPost.length ){
      // Comment validation via Parsley
      // We allow either text or a photo or both, but at least one must be filled
      $commentPost.parsley(
        {
          errorClass: 'is-error'
          , errorsWrapper: '<ul class="alert-list"></ul>'
          , errorTemplate: '<li class="alert alert--danger"></li>'
        }
      ).subscribe('parsley:form:validate', function (formInstance) {

        var textareaErrorID = $commentPostField.data('parsley-id')
          , $textareaErrorElem = $('ul.alert-list#parsley-id-' + textareaErrorID)

        // if one of these blocks is not failing do not prevent submission
        // JS- There is a bug in Parsley which means the hidden file field always returns true. So test this ourselves with val()
        if ( formInstance.isValid('commentText', true) || $commentPostFileId.val() ) {
          $textareaErrorElem.html('')
          return
        }
        // else stop form submission
        formInstance.submitEvent.preventDefault()

        // and display an error message under the textarea
        $textareaErrorElem
          .html('')
          .append("<li class='alert alert--danger'>" + $('.js-comment-post .js-social__comment-post__text').data('parsley-required-message') + "</li>")
      })


      // Comment submit action
      $('.js-comment-post').on('submit', function(e){
        e.preventDefault()

        $(this).find('.js-social__comment-post__text').addClass('field--sending')

        // New comment post action
        FANBOOKZ.helpers.formPostSubmit( $('.js-comment-post'), function (serializedArray, response, textStatus, jqXHR) {
          if(response.success){

            // If not the match page
            var $pageName = $('body').attr('data-controller')
            if ($pageName !== 'match') {

              FANBOOKZ.helpers.getTemplate( paths.base + '/' + locale + '/comment/view_homepage/any/' + response.id, function(template){
                var $elem = $(template)
                // Remove loading animation from submit form
                $commentPostField.removeClass('field--sending')
                // Remove image preview from form
                $('.js-post-upload-preview').html('')
                // Add extras to html
                var username = $elem.data('username')
                  , id = $elem.data('comment-id')
                $elem = $('<div class="js-social-post inline__comment inline__comment--fade-in js-homepage__comment--fade-in" data-comment-id="' + id + '" data-username="' + username + '">' + $elem[0].outerHTML + '</div>')
                // If on the homepage, select the first news feed tab
                if ($pageName == 'home') {
                  $('#homeCommentTabs a:first').tab('show')
                }
                // Add the comment into the page
                if ($pageName == 'home') {
                  $('#most-recent-tab .js-comment-container').prepend($elem)
                } else {
                  $('.js-comment-container').prepend($elem)
                }
                // Fade the comment in
                $('.js-homepage__comment--fade-in').slideDown(400, function(){
                  $(this).removeClass('js-homepage__comment--fade-in')
                })
                // Reset the comment box back to the initial state
                activateCommentTab()

                var commentWidget = new CommentWidget({
                    el: $elem
                  , id: $elem.data('comment-id')
                  , username: $elem.data('username')
                  , container: $commentContainer
                })
              })

            // Else we're on the match page - Masonry comments
            } else {

              FANBOOKZ.helpers.getTemplate( paths.base + '/' + locale + '/comment/view/any/' + response.id, function(template){
                var $elem = $(template)
                  , threadName = $elem.data('thread')
                var isAway = (threadName.indexOf('away') !== -1)
                  , isHome = (threadName.indexOf('home') !== -1)
                  , isDraw = (threadName.indexOf('draw') !== -1)
                  , isTeamPage = isAway || isHome || isDraw
                // Remove loading animation from submit form
                $commentPostField.removeClass('field--sending')
                if(isTeamPage){
                  // Remove image preview from form
                  $('.js-post-upload-preview').html('')
                  $('.social__comment-post__file_id').attr('value', '')
                  $('.js-post-image-delete').hide()
                  $('.ajax-file-upload').show()

                  if (isAway) {
                    $('.js-comment-container--away').prepend($elem)
                  } else if (isHome) {
                    $('.js-comment-container--home').prepend($elem)
                  } else if (isDraw) {
                    $('.js-comment-container--draw').prepend($elem)
                  }
                  $commentContainer.masonry('prepended', $elem)
                  var commentWidget = new CommentWidget({
                      el: $elem
                    , id: $elem.data('comment-id')
                    , username: $elem.data('username')
                    , container: $commentContainer
                  })
                } else {
                  // Remove image preview from form
                  $('.js-post-upload-preview').html('')

                  // Add extras to html
                  var username = $elem.data('username')
                    , id = $elem.data('id')
                  if ($pageName === 'news') {
                    $elem = $('<div class="col-sm-12 col-md-6 js-social-post js-stream-post" data-id="' + id + '" data-username="' + username + '">' + $elem[0].outerHTML + '</div>')
                  } else {
                    $elem = $('<div class="col-sm-12 col-md-4 js-social-post js-stream-post" data-id="' + id + '" data-username="' + username + '">' + $elem[0].outerHTML + '</div>')
                  }
                  $elem.css('opacity', 0)
                  $commentContainer.prepend($elem)
                  imagesLoaded($commentContainer, function() {
                    $elem.css('opacity', 1)

                    // update comment form
                    $('.social__comment-post__file_id').attr('value', '')
                    $('.js-post-image-delete').hide()
                    $('.ajax-file-upload').show()

                    // Add elem to masonry
                    $commentContainer.masonry('prepended', $elem)
                    var commentWidget = new CommentWidget({
                      el: $elem
                    , id: $elem.data('comment-id')
                    , username: $elem.data('username')
                    , container: $commentContainer
                    })
                  })
                }
              })
            }
          } else {
            $commentPostField.removeClass('field--sending')
            addErrorMessage( $commentPostField.data('error-message') )
          }
        })
      })

    }

    FANBOOKZ.helpers.formPost( $('.js-photo-comment-post'), function (serializedArray, response, textStatus, jqXHR) {
      if(response.success){
        FANBOOKZ.helpers.getTemplate(paths.base + '/' + locale + '/comment/view/any/' + response.id, function(template){
          var $elem = $(template)
          $('.js-comment-container').prepend($elem)
        })
      }
    })

    $('.js-social-post').each(function(index, element){
      var $elem = $(element)
      var commentWidget = new CommentWidget({
        el: $elem
      , id: $elem.data('comment-id')
      , username: $elem.data('username')
      , container: $commentContainer
      })
    })

    // Close replies widget
    $('.js-comment-replies-close').on('click', closeReplyWidget)
    $('.js-replies-close').on('click', closeReplyWidget)
    function closeReplyWidget() {
      $('.js-comment-replies').addClass('is-hidden')
      $('.js-replies-close').addClass('is-hidden')
      setTimeout(function(){
        $('.js-comment-replies-content').html('')
      }, 400)
    }

    // Comment Form - Handle clicking the 'Comment' tab
    $('.js-social__comment__nav_tab--comment').on('click', function(e){
      e.preventDefault()
      activateCommentTab()
    })

    function activateCommentTab (){
      // Remove the uploaded photo (if set) from the Add Photo tab
      // Sometimes this count is a negative number after aborting an upload - so use != instead of >
      if(postUploadObj.getFileCount() != 0){
        // Cancel the uploaded photo via the API - doesn't work (function is undefined)
        // So instead, trigger delete manually
        $('.js-comment-post .ajax-file-upload-abort').trigger('click')
      }
      // Also click on the delete button on the thumbnail
      $('.js-post-image-delete').trigger('click')

      // Reset the textarea size. Needed if the image has been removed above, or if the form has been submit
      $('.social__comment-post__text').removeClass('textarea--with-photo')
      $('.js-social__comment-post__text').css('height','')

      // Switch the tabs
      $('.js-social__comment__nav_tab--photo').removeClass('active')
      $('.js-social__comment__nav_tab--comment').addClass('active')
      $('.js-comment-post .ajax-file-upload').show()
      $('.js-social__comment-post__footer__submit').hide()
    }

    // Comment Form - Handle clicking the 'Add Photo' tab
    $('.js-social__comment__nav_tab--photo').on('click', function(e){
      e.preventDefault()
      activateCommentPhotoTab(this)
    })

    function activateCommentPhotoTab (){
      // Delete any already uploaded images
      // Sometimes this count is a negative number after aborting an upload - so use != instead of >
      if(postUploadObj.getFileCount() != 0){
        // Cancel the uploaded photo via the API - doesn't work (function is undefined)
        // So instead, trigger delete manually
        $('.js-comment-post .ajax-file-upload-abort').trigger('click')
        $('.js-social__comment-post__text').autoGrow()
      }

      // Switch the tabs
      $('.js-social__comment__nav_tab--comment').removeClass('active')
      $('.js-social__comment__nav_tab--photo').addClass('active')
      $('.js-comment-post .ajax-file-upload').hide()

      // Trigger image upload button
      $('.js-social-widget__image-upload input[type="file"]').last().trigger('click')
    }

    function addErrorMessage(messageText){
      var textareaErrorID = $commentPostField.data('parsley-id')
        , $textareaErrorElem = $('ul.alert-list#parsley-id-' + textareaErrorID)

      // and display an error message under the textarea
      $textareaErrorElem
        .html('')
        .append("<li class='alert alert--danger'>" + messageText + "</li>")
    }

  }

  return module

})(window.jQuery)