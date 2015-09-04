/* jshint unused: false */
var FanbookzUserPopups = (function($) {

  // Module object to be returned
  var module = {}

  /**
   * Initialise
   */
  module.init = function() {

    window.isMobile = function() {
      var check = false;
      (function(a,b){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
      return check;
    }

    // Desktop only & user logged in

    if(!window.isMobile() && $('body.user_logged_in').length == 1){

      var userObj = {}  // Local cache of user data to prevent repeat AJAX requests
        , tempPopup = Hogan.compile($('.temp_username_popup').html())

      showPopup = function($elem, userId){
        var viewData = userObj[userId]
          , tempPopupRendered = tempPopup.render(viewData)

        // Hide any open popups
        $('.username-popup__popup').hide()

        $elem.append(tempPopupRendered)
        $elem.find('.username-popup__popup').fadeIn('fast')
      }

      // Mouseover username

      $(document.body).on('mouseenter', '.js-username-popup', function(e) {
        //stuff to do on mouse enter
        e.stopPropagation()

        var $elem = $(this)
          , userId = $elem.data('userid')

        //if($elem.find('.username-popup__popup').length){
        //  $elem.find('.username-popup__popup').fadeIn('fast')

        if(userId in userObj){
          showPopup($elem, userId)

        } else {

          $.ajax({
            type: 'GET'
            , url: '/api/user/' + userId
            , success: function(response) {
              if(response && !jQuery.isEmptyObject(response)){

                // @TODO: 'profile_background_large' is too big and we need to resize all the images on S3 til we can use 'profile_background_thumb'
                /*
                if(response.backGr){
                  var bgImage = 'http://fanbookz.s3-eu-west-1.amazonaws.com/profile_background_thumb/' + unescape(response.backGr)
                    , hasBgImage = true
                } else {
                  // Default background image
                  var bgImage = ''
                    , hasBgImage = false
                }
                */
                // So for now:
                // Default background image
                var bgImage = ''
                  , hasBgImage = false


                if(response.profile){
                  var avatarImage = 'http://fanbookz.s3-eu-west-1.amazonaws.com/profile_thumb_large/' + unescape(response.profile)
                    , hasAvatarImage = true
                } else {
                  // Default avatar
                  var avatarImage = ''
                    , hasAvatarImage = false
                }

                if(response.backGr || response.profile){
                  var noImages = false
                } else {
                  var noImages = true
                }

                // Store the data in an object for later
                userObj[userId] = {
                  'userid': userId
                  , 'username': response.username
                  , 'team': response.team
                  , 'bgColour': response.bgColour  // @TODO: Temporary: should be response.teamColour once implemented
                  , 'bgImage': bgImage
                  , 'hasBgImage': hasBgImage
                  , 'avatarImage': avatarImage
                  , 'hasAvatarImage': hasAvatarImage
                  , 'noImages': noImages
                  , 'isFollowing': response.followed
                }
                showPopup($elem, userId)
              }
            }
            , error: function (response) {

            }
          })
        }
      })

      // Mouseleave username

      $(document).on('mouseleave', '.js-username-popup', function(e) {
        e.stopPropagation()
        // Fade out and remove the element
        // We remove all instances of the popup instead of 'this' in case any did not successfully fade out
        $('.username-popup__popup').fadeOut('fast', function(){
          $(this).remove()
        })
      })

      // Follow button

      $(document).on('click', '.js-username-popup__btn--follow', function(e) {
        e.preventDefault()
        var $elem = $(this)
          , userId = $elem.data('userid')
          , userName = ''

        // If object and property exists
        if( typeof userObj !== "undefined"
            && typeof userObj[userId] !== "undefined"
            && userObj[userId].hasOwnProperty('username') ){
          userName = userObj[userId].username
        } else if($elem.data('username') != ''){
          userName = $elem.data('username')
        }

        if(userName != ''){
          $.ajax({
            type: 'GET'
            , url: '/follow/add/user/' + userName
            , success: function(response) {
              if(response && !jQuery.isEmptyObject(response) && response.success === true){
                $elem.addClass('is-following')
                $elem.next('.js-username-popup__btn--unfollow').addClass('is-following')
                // If object exists
                if( typeof userObj !== "undefined"
                  && typeof userObj[userId] !== "undefined"){
                  userObj[userId].isFollowing = true
                }
              }
            }
          })
        }
      })

      // Unfollow button

      $(document).on('click', '.js-username-popup__btn--unfollow', function(e) {
        e.preventDefault()
        var $elem = $(this)
          , userId = $elem.data('userid')
          , userName = ''

        // If object and property exists
        if( typeof userObj !== "undefined"
          && typeof userObj[userId] !== "undefined"
          && userObj[userId].hasOwnProperty('username') ){
          userName = userObj[userId].username
        } else if($elem.data('username') != ''){
          userName = $elem.data('username')
        }

        if(userName != ''){
          $.ajax({
            type: 'GET'
            , url: paths.base + '/follow/remove/user/' + userName
            , success: function(response) {
              if(response && !jQuery.isEmptyObject(response) && response.success === true){
                $elem.removeClass('is-following')
                $elem.prev('.js-username-popup__btn--follow').removeClass('is-following')
                // If object exists
                if( typeof userObj !== "undefined"
                  && typeof userObj[userId] !== "undefined"){
                  userObj[userId].isFollowing = false
                }
              }
            }
          })
        }
      })

    }
  }

  return module

})(window.jQuery)
