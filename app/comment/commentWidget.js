/* jshint unused: false */
var CommentWidget = function(userOptions){
  // API Routes
  var api =
    { vote:
      { increase: paths.base + '/comment/vote/up/' + userOptions.id
      , decrease: paths.base + '/comment/vote/down/' + userOptions.id
      , get: paths.base + '/comment/vote/get-vote/' + userOptions.id
      }
    , repost: paths.base + '/comment/repost/add/' + userOptions.id
    , follow: paths.base + '/follow/add/user/' + userOptions.username
    , unfollow: paths.base + '/follow/remove/user/' + userOptions.username
    , isFollowing: paths.base + '/follow/is-following/user/' + userOptions.username
    , remove: paths.base + '/comment/delete/' + userOptions.id
    , templates:
      { replyForm: paths.base + '/' + locale + '/comment/reply/' + userOptions.id
      , replies: paths.base + '/' + locale + '/comment/view/' + userOptions.id + '/0'
      , view: paths.base + '/' + locale + '/comment/view/any/' + userOptions.id
      , comment: Hogan.compile( $('.temp_comment').html() )
      }
    }

  // jQuery classes
  var ui =
    { voteUp: '.js-social-post__vote-up'
    , voteDown: '.js-social-post__vote-down'
    , votesUp: '.js-social-post__votes-up'
    , votesDown: '.js-social-post__votes-down'
    , replies: '.js-post-replies'
    , repliesHome: '.js-post-replies-home'
    , repliesContainer: $('.js-comment-replies')
    , repliesContainerContent: $('.js-comment-replies-content')
    , repost: '.js-post-repost'
    , follow: '.js-user-follow'
    , unfollow: '.js-user-unfollow'
    , remove: '.js-post-delete'
    , upload: '.js-post-upload'
    , viewReplyToggle: '.js-social__comment__replies__view-toggle'
    , replyForm: '.js-reply-form'
    }
  this.$ui = {}

  // Run through events and bind to jquery elements
  this.bindEvents = function () {
    if(this.$ui.voteUp !== undefined)
      this.$ui.voteUp.on('click', voteUp)
    if(this.$ui.voteDown !== undefined)
      this.$ui.voteDown.on('click', voteDown)
    if(this.$ui.replies !== undefined)
      this.$ui.replies.on('click', showReplies)
//    if(this.$ui.replies !== undefined)
//      this.$ui.repliesHome.on('click', showRepliesHome)
    if(this.$ui.repost !== undefined)
      this.$ui.repost.on('click', repostConfirm)
    if(this.$ui.follow !== undefined)
      this.$ui.follow.on('click', followUser)
    if(this.$ui.unfollow !== undefined)
      this.$ui.unfollow.on('click', unfollowUser)
    if(this.$ui.remove !== undefined)
      this.$ui.remove.on('click', deleteComment)
    if(this.$ui.viewReplyToggle !== undefined)
      this.$ui.viewReplyToggle.on('click', toggleMoreReplies)
    if(this.$ui.replyForm !== undefined)
      this.$ui.replyForm.on('submit', replyFormSending)
  }

  // Define private functions
  var voteUp
    , voteDown
    , getTemplate
    , showReplies
    , repostConfirm
    , repostComment
    , deleteComment
    , isRepliesOpen = false

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

    // Change all counts for this comment on the page
    updateCommentCounts = function (id,up,down){
      $('.js-social-post[data-comment-id="' + id + '"] .js-social-post__votes-up, .js-sidekick-post[data-comment-id="' + id + '"] .js-social-post__votes-up').text(up)
      $('.js-social-post[data-comment-id="' + id + '"] .js-social-post__votes-down, .js-sidekick-post[data-comment-id="' + id + '"] .js-social-post__votes-down').text(down)
    }

    // Vote up comment
    voteUp = function (e) {
      e.preventDefault()
      $.ajax(
        { url: api.vote.increase
        , type: 'post'
      }).done(function(response){
        // @TODO: Add if statement for if(response.success === false) once implemented

        updateCommentCounts(userOptions.id,response.upVotes,response.downVotes)

        if(response.vote == "up"){
          $('.js-social-post__vote-up[data-comment-id="'  + userOptions.id + '"]').addClass('is-selected')
          $('.js-social-post__vote-down[data-comment-id="' + userOptions.id + '"]').removeClass('is-selected')
        } else if(response.vote == "null"){
          $('.js-social-post__vote-up[data-comment-id="' + userOptions.id + '"]').removeClass('is-selected')
          $('.js-social-post__vote-down[data-comment-id="' + userOptions.id + '"]').removeClass('is-selected')
        }
      })
    }

    // Vote down comment
    voteDown = function (e) {
      e.preventDefault()
      $.ajax(
        { url: api.vote.decrease
        , type: 'post'
      }).done(function(response){
        // @TODO: Add if statement for if(response.success === false) once implemented

        updateCommentCounts(userOptions.id,response.upVotes,response.downVotes)

        if(response.vote == "down"){
          $('.js-social-post__vote-up[data-comment-id="' + userOptions.id + '"]').removeClass('is-selected')
          $('.js-social-post__vote-down[data-comment-id="' + userOptions.id + '"]').addClass('is-selected')
        } else if(response.vote == "null"){
          $('.js-social-post__vote-up[data-comment-id="' + userOptions.id + '"]').removeClass('is-selected')
          $('.js-social-post__vote-down[data-comment-id="' + userOptions.id + '"]').removeClass('is-selected')
        }
      })
    }

    // Show replies
    showReplies = function () {
      var replyWidget = new ReplyWidget({
        id: userOptions.id
      })
    }

    // Show replies - Inline
    showRepliesInline = function () {

      // POST using helper
      FANBOOKZ.helpers.formPost( scope.$elem.find('.js-reply-form'),
        function (serializedArray, response, textStatus, jqXHR) {
          if(response.success){
            // Append reply to in stream comment
            getTemplate('/' + locale + '/comment/view_homepage_reply/any/' + response.id, function(template){
              scope.$elem.find('.js-reply-form__textarea').removeClass('field--sending')
              $replyPost = $(template)
              // Add extras to html - for fading
              $replyPost = $('<div class="social__comment__replies__reply--fade-in js-comment__reply--fade-in">' + $replyPost[0].outerHTML + '</div>')

              var $commentId = scope.$elem.find('.social__comment').attr('data-comment-id')
              var $socialPost = $('.js-social-post[data-comment-id=' + $commentId + ']')
              $socialPost.find('.js-social__comment__replies__container').append($replyPost)

              // Fade the reply in
              $socialPost.find('.js-comment__reply--fade-in').slideDown(400, function(){
                $(this).removeClass('comment__reply--fade-in')
              })

              // Update the '2 replies' etc text
              var replyCount = parseInt( $socialPost.find('.js-social__comment__replies').data('reply-count') )
              var newReplyCount = replyCount + 1
              if(newReplyCount == 1){
                var replyText = 'reply'
              } else {
                var replyText = 'replies'
              }
              $socialPost.find('.js-social__comment__replies__amt').html(newReplyCount + ' ' + replyText)
              // Update the reply count
              $socialPost.find('.js-social__comment__replies').data('reply-count', newReplyCount)
            })
          } else {
            scope.$elem.find('.js-reply-form__textarea').removeClass('field--sending')
          }
        })
    }


    // Handle clicking on 'View more comments'
    toggleMoreReplies = function (e) {
      e.preventDefault()
      if(isRepliesOpen){
        scope.$elem.find('.js-social__comment__replies__hidden').slideUp()
        scope.$elem.find('.social__comment__replies__view-toggle__label').toggle()
        isRepliesOpen = false
      } else {
        scope.$elem.find('.js-social__comment__replies__hidden').slideDown()
        scope.$elem.find('.social__comment__replies__view-toggle__label').toggle()
        isRepliesOpen = true
      }
    }

    replyFormSending = function (e){
      scope.$elem.find('.js-reply-form__textarea').addClass('field--sending')
    }

    // Follow user
    followUser = function () {
      $.ajax(
        { url: api.follow
        , type: 'post'
      }).done(function(response){
        if(response.success === true){
          $('.js-user-follow').text('Unfollow User')
          $('.js-user-follow').addClass('js-user-unfollow')
          $( ".js-user-follow" ).unbind();
          $('.js-user-follow').removeClass('js-user-follow')
          $('.js-user-unfollow').on('click', unfollowUser)
        }

      })
    }
    // Unfollow user
    unfollowUser = function () {
      $.ajax(
        { url: api.unfollow
        , type: 'post'
      }).done(function(response){
        if(response.success === true){
          $('.js-user-unfollow').text('Follow User')
          $('.js-user-unfollow').addClass('js-user-follow')
          $( ".js-user-unfollow" ).unbind();

          $('.js-user-unfollow').removeClass('js-user-unfollow')
          $('.js-user-follow').on('click',followUser)
        }

      })
    }
    // Delete comment
    deleteComment = function () {
      $.ajax(
        { url: api.remove
        , type: 'post'
      }).done(function(response){
        if(response.success === true){
          if(userOptions.container.length && scope.msnry !== undefined){
            // remove clicked element
            scope.msnry.remove( scope.$elem[0] )
            // layout remaining item elements
            scope.msnry.layout()
          }else{
            scope.$elem.slideUp(400, function(){$(this).remove();})
          }
        }
      })
    }
    // Repost
    bindRepostModal = function () {
      scope.$repostModel = $('.modal__comment-repost')
      // modal is actually bond before comment widget are bond
      // see bottom of file
    }
    repostConfirm = function () {
      getTemplate(api.templates.view, function (temp) {
        scope.$repostModel.find('.js-comment-content').html(temp)
        scope.$repostModel.trigger('openModal')
        // Bind cancel btn
        scope.$repostModel.find('.js-repost-cancel').on('click', function () {
          scope.$repostModel.trigger('closeModal')
        })
        // Bind repost btn
        scope.$repostModel.find('.js-repost-repost').on('click', repostComment)
      })
    }
    repostComment = function () {
      $.ajax(
        { url: api.repost
        , type: 'post'
      }).done(function(response){
        if(response.success === true){
          scope.$repostModel.trigger('closeModal')
        }
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

  // Initialise widget
  this.init = function (data) {
    this.$elem = userOptions.el
    if(userOptions.container){
      this.$container = userOptions.container
      this.msnry = this.$container.data('masonry')
    }
    this.bindUI()
    this.bindEvents()
    bindRepostModal()

    // We need to show inline comments on all but the match page
    if($('body').attr('data-controller') !== 'match'){
      showRepliesInline()
    }

    // Set up textarea auto-grow
    this.$elem.find('textarea.js-textarea-auto-grow').autoGrow()

  }

  // Start widget
  this.setOptions(userOptions)
  this.init()
}

// this is bound outside so all comment can use the same modal
$('.modal__comment-repost').easyModal({
  updateZIndexOnOpen: false, // 19 Jan 2015 -- z-indexes are being set to over 2147483647 which breaks the rendering
  onOpen: function (myModal) {
    $('html,body').css('overflow', 'hidden')
  }
, onClose: function (myModal) {
    $('html,body').css('overflow', 'auto')
  }
})
