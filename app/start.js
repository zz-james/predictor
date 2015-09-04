if(Fanbookz === undefined){

  var Fanbookz = (function($) {

    // Our module object to be returned
    var module = {

      // Initialised?
      initialised: 0

    }

    module.getDeviceSize = function(){
      if($(window).width() < 768){
        return "mobile"
      } else if($(window).width() >= 768 && $(window).width() < 992){
        return "tablet"
      } else {
        return "desktop"
      }
    }

    /**
     * Initialise
     */
    module.init = function() {

      // Only initialise once
      if (module.initialised++) {
        return
      }

      UTIL.init()

      // Initialise header logic
      if ($('body').hasClass('no-header')) {
        //do nothing
      }
      else {
        FanbookzHeader.init()
      }

      // Initialise pagination login
      FanbookzPagination.init()

      // Initialise Cookie popup
      FanbookzCookie.init()

      // Initialise Breaking News
      FanbookzBreakingNews.init()

      // Initialise Splash Slider
      FanbookzSplashSlider.init()

      // Initialise Modals
      FanbookzModals.init()

      // Initialise Commenting
      FanbookzCommenting.init()

      // Combination Bet
      // only do this on combination bet pages
      if($('.js-combination-bet__footer').length)
      { FANBOOKZ.combinationBet.init() }

      // Initialise MatchWidgets
      FanbookzMatchWidgets.init()

      // Initialise News Next/Prev Widget
      FanbookzNewsNextPrevWidget.init()

      // Initialise News Next/Prev Widget
      FanbookzFormValidation.init()

      // Tutorial
      FanbookzTutorial.init()

      // Initialise the check for referrals
      FanbookzReferrals.init()

      // Username popups
      FanbookzUserPopups.init()

      // Standings Widget
      FanbookzStandingsWidget.init()

      // initialise team recent photos widget
      FanbookzTeamPhotos.init()

      // initialise the team twitter feed
      FanbookzTeamTwitter.init()

      // Sidekick
      FanbookzSidekick.init()

      if ($('.nav-container').length ) {
        if ($('.match-ticker').length) {
            matchTicker.initialize()
        }
      }

      postUploadObj = $('.js-social-widget__image-upload__button').uploadFile({
        url: '/upload'
      , method: 'POST'
      , multiple: false
      , allowedTypes: "png,gif,jpg,jpeg"
      , maxFileSize: 4000000
      , fileName: 'files[]'
      , onSelect: function (files)
        {
          $('.js-social__comment-post__text').addClass('field--sending')
          return true //to allow file submission.
        }
      , onSuccess: function (files, data, xhr, pd) {
          //console.log(data)
          var temp = Hogan.compile('<img src="{{cached}}" />')
            , temp = temp.render(data.file)

          $('.js-social-widget__textarea-wrapper').show()
          $('.js-social__comment__nav_tab--comment').removeClass('active')
          $('.js-social__comment__nav_tab--photo').addClass('active')
          $('.js-social__comment-post__text').removeClass('field--sending')

          // Reset the 'display' attribute, since it may have been set to none previously via JS
          $('.js-social__comment__nav_tab--photo').css('display', '')

          $('.social__comment-post__file_id').attr('value', data.file.id)
          $('.social__comment-post__footer__upload').css('display', 'inline-block')
          $('.js-social__comment-post__footer__submit').show()
          $('.js-post-upload-preview').html(temp)
          $('.js-post-image-delete').show()
          $('.js-comment-post .ajax-file-upload').hide()
          $('.js-social__comment-post__text').addClass('textarea--with-photo')
          $('.js-social__comment-post__text').autoGrow()
        }
        , onError: function (files, status, errMsg) {
          // console.log(files, status, errMsg)
          // @todo handle errors
          $('.js-social__comment-post__text').removeClass('field--sending')
        }
      })

      $('.js-post-image-delete').on('click', function(){

        // Cancel the uploaded photo via the API - doesn't work (function is undefined)
        // So instead, trigger delete manually
        $('.js-comment-post .ajax-file-upload-abort').trigger('click')

        $('.social__comment-post__file_id').attr('value', '')
        $('.js-post-upload-preview').html('')
        $('.js-post-image-delete').hide()
        $('.ajax-file-upload').show()
        // Show the submit button
        $('.js-social__comment-post__footer__submit').hide()
        // Update the textarea
        $('.js-social-widget__image-upload__button').show()
        $('.js-social__comment-post__text').removeClass('textarea--with-photo')
        $('.js-social__comment-post__text').autoGrow()

        // Update the tabs
        $('.js-social__comment__nav_tab--comment').addClass('active')
        $('.js-social__comment__nav_tab--photo').removeClass('active')

      })


      //==============================================================================
      // File upload input
      // Data is taken from [data-inputname] and [data-multiple]
      //==============================================================================
      $('.js-fileupload').each(function(){
        var $elem = $(this)
          , inputName = $elem.data('inputname')
          , isMultiple = $elem.data('multiple')

        // post images
        $elem.uploadFile({
          url: '/upload'
          , method: 'POST'
          , multiple: isMultiple
          , fileName: 'files[]'
          , onSuccess: function (files, data) {
            // files, data, xhr
            if(isMultiple){
              $elem.after('<input type="hidden" name="' + inputName + '" value="' + data.file.id + '">')
            } else {
              $('input[name="' + inputName + '"]').val(data.file.id)
            }
          }
          , onError: function (files, status, errMsg) {
            // console.log(files, status, errMsg)
            // @todo handle errors
          }
        })
      })

      //==============================================================================
      // Mobile check
      //==============================================================================

      window.isMobile = function() {
        var check = false;
        (function(a,b){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
      }

      //==============================================================================
      // Prevent iOS from zooming in on form el focus
      // Platform test bit is borrowed from Mobile Boiler Plate
      //==============================================================================
      window.MBP = window.MBP || {};

      /**
       * Fix for iPhone viewport scale bug
       * http://www.blog.highub.com/mobile-2/a-fix-for-iphone-viewport-scale-bug/
       */

      MBP.viewportmeta = document.querySelector && document.querySelector('meta[name="viewport"]');

      if (MBP.viewportmeta && navigator.platform.match(/iPad|iPhone|iPod/i)) {
        $('body').on('focus', 'select, input', zoomDisable);
        $('body').on('blur', 'select, input', zoomEnable);
        function zoomDisable(){
          $('head meta[name=viewport]').remove();
          $('head').prepend('<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />');
        }
        function zoomEnable(){
          $('head meta[name=viewport]').remove();
          $('head').prepend('<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=1" />');
        }
      }

      //==============================================================================
      // Mini Predictor
      //==============================================================================
      var $miniPredictor = $('.js-match-predictor--mini')
      if($miniPredictor.length){
        var miniPredictor = new MiniPredictor({
          el: $miniPredictor
        })
        miniPredictor.render()
      }

      //==============================================================================
      // Twitter follow button
      //==============================================================================

      var twitterBtn = $('.recommended-users__follow > a')

        $(twitterBtn).click(function(e){
          e.preventDefault()
          $(this).addClass('followed')
          $(this).html('Following')
        })

      //==============================================================================
      // Login/Registration Slider
      //==============================================================================

      FANBOOKZ.loginSlider.init()

      if(( getUrlParameter('openLoginSlider') == "true" ) && ($(window).width() > 768)) {
        $('.js-header-profile-signup').addClass('header__profile__signup--active')
        $('.js-header-profile-login').removeClass('header__profile__login--active')
        FANBOOKZ.loginSlider.openLoginSlider()
      }
      else if(( getUrlParameter('openLoginSlider') == "true" ) && ($(window).width() < 768)) {
        $('.registration__slider-referral').css('display','block')
      }

      if( $('.registration__slider__content__login .js-field-errors').length ){
        FANBOOKZ.loginSlider.openLoginSlider()
        FANBOOKZ.loginSlider.switchToLoginForm()
      }

      //==============================================================================
      // Placeholder plugin
      //==============================================================================

      $('input, textarea').placeholder()

      //==============================================================================
      // Table ClickableRow
      //==============================================================================
      var setUpClickableRow = clickableRow()

      function clickableRow() {
        $('.clickableRow').click(function(e) {
          var url = $(this).attr('href')
          if (e.ctrlKey || e.metaKey) {
            window.open(url, '_blank')
          } else {
            window.document.location = url
          }
        })
      }

    }

    return module

  })(window.jQuery)

  $(document).ready(function() {
    document.domain = 'fanbookz.com' // does this fix out cross origin problem
    Fanbookz.init()
  })

  $(window).resize(function() {
    //Re-order elements for mobile
    var theWindowWidth = $(window).width()
    if(theWindowWidth < 768) {
      $('.predictor-mini__teams').insertBefore('.predictor-mini__countdown')
      // change html text for mobile
      $('.btn--to_match').html('Predict Next Game')
    }
  })

}
