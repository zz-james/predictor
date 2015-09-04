/* jshint unused: false */
var ReplyWidget = function(userOptions){
  // API Routes
  var api =
    { templates:
      { replyForm: '/' + locale + '/comment/reply/' + userOptions.id
      , replies: '/' + locale + '/comment/view/widget/' + userOptions.id + '/0'
      , comment: Hogan.compile( $('.temp_comment').html() )
      }
      , markAsRead: '/api/notifications/read/' + userOptions.notificationid
    }

  // jQuery classes
  var ui =
    { replies: '.js-post-replies'
    // , repliesContainer: $('.js-comment-replies')
    , repliesContainerContent: $('.js-comment-replies-content')
    }
  this.$ui = {}

  // Run through events and bin to jquery elements
  this.bindEvents = function () {
  }

  // Define private functions
  var getTemplate
    , showReplies
    , getReplies

  ;(function (scope) {
    // Helper function to get external templates
    getTemplate = function (url, callback) {
      $.get(url, function(template) {
        if(callback && typeof(callback) === 'function'){
          callback(template)
        } else {
          return template
        }
      })
    }
    var $pageName = $('body').attr('data-controller')
    if ($pageName === 'home') {
      //bindForm()
    } else {
      getReplies = function () {
        // Get reply form
        getTemplate(api.templates.replies, function (template) {
          // Add content
          scope.$ui.repliesContainerContent.html(template)
          applyCommentWidget()
          // bind form
          bindForm()
        })
        // Remove .is-hidden class
        scope.$elem.removeClass('is-hidden')
        $('.js-replies-close').removeClass('is-hidden')
      }
    }
    bindForm = function () {
      // POST using helper
      FANBOOKZ.helpers.formPost( scope.$elem.find('.js-reply-form'),
      function (serializedArray, response, textStatus, jqXHR) {
        if(response.success){

          getTemplate('/' + locale + '/comment/view/any/' + response.id, function(template){
            $replyPost = $(template)
            if(scope.$elem.find('.js-replies-container').length > 0){
              scope.$elem.find('.js-replies-container:last-of-type').append($replyPost)
            } else {
              scope.$elem.find('.js-reply-form')
                .before('<div class="social-posts__replies__replies js-replies-container"></div>')
              scope.$elem.find('.js-replies-container')
                .append($replyPost)
            }
            var commentWidget = new CommentWidget({
              el: $replyPost
            , id: $replyPost.data('comment-id')
            })
          })

          // Append reply to in stream comment on home page ONLY
          if ($pageName === 'home') {
            getTemplate('/' + locale + '/comment/view_homepage_reply/any/' + response.id, function(template){
              $replyPost = $(template)
              var $commentId = scope.$elem.find('.social__comment').attr('data-id')
              if ($('.js-social-post[data-id=' + $commentId + '] .js-social__comment__replies').length > 0 ) {
                $('.js-social-post[data-id=' + $commentId + '] .js-social__comment__replies__container').prepend($replyPost)
              } else {
                $('.js-social-post[data-id=' + $commentId + '] .js-post-replies')
                  .wrap('<div class="social__comment__replies js-social__comment__replies"></div>')
                $('.js-social-post[data-id=' + $commentId + '] .js-post-replies')
                  .wrap('<div class="social__comment__replies__container js-social__comment__replies__container"></div>')
                $('.js-social-post[data-id=' + $commentId + '] .js-social__comment__replies__container')
                  .prepend($replyPost)
                $('.js-social-post[data-id=' + $commentId + '] .js-post-replies')
                  .addClass('social__comment__replies__view--more')
              }
            })
          }

          if ($pageName != 'home') {
            // Close replies after delay
            setTimeout(function(){
              $('.js-comment-replies').addClass('is-hidden')
              $('.js-replies-close').addClass('is-hidden')
              setTimeout(function(){
                $('.js-comment-replies-content').html('')
              }, 400)
            }, 3000)
          }

        }
      })
    }

    applyCommentWidget = function () {
      $('.js-comment-replies .social__comment').each(function(index, element){
        var $elem = $(element)
        var commentWidget = new CommentWidget({
          el: $elem
        , id: $elem.data('comment-id')
        })
      })
    }

  })(this)

  // Public Variables
  this.setOptions = function(userOptions) {
    userOptions = $.extend(this.options, userOptions)
  }
  // Run through ui elements and bind with jquery
  this.bindUI = function () {
    // Loop through each key in object
    for (var key in ui){
      var value = ui[key]
      // Check if jquery
      if(value instanceof jQuery){
        // If jquery add to ui elements object
        this.$ui[key] = value
      } else {
        // If not jquery, find class in element
        this.$ui[key] = this.$elem.find(value)
      }
    }
  }
  // Marking notification as read
  this.markAsRead = function (callback) {
     $.ajax(
       { url: api.markAsRead
       , type: 'get'
     }).done(function(response){
       if(response.success === true){
         callback(null,true)
       } else{
         callback(null,false)
       }
     })
  }

  // Initalise widget
  this.init = function (data) {
    this.$elem = $('.js-comment-replies')
    this.bindUI()
    this.bindEvents()
    getReplies()
  }

  // Start widget
  this.setOptions(userOptions)
  this.init()
}
