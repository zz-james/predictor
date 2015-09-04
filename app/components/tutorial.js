/* jshint unused: false */
var FanbookzTutorial = (function($) {

  // Module object to be returned
  var module = {}

  /**
   * Initialise
   */
  module.init = function() {

    // Check the GET parameter and show the notifications if set (used on redirect after the tutorial is complete)
    if( getUrlParameter('openNotifications') == "true" ){
      $('.js-notifications-trigger').click()

    } else {

      tutorialStep = 1
      tutorialStepCount = 5
      $tutorialModal = $('.js-tutorial-modal')

      $tutorialModal.modal({
        backdrop: 'static' // Disable clicking on the backdrop to close the modal
      })

      // Bind button actions

      $('.js-tutorial-modal-next').on('click', function(e){
        e.preventDefault()
        changeModalState('next')
      })

      $('.js-tutorial-modal-prev').on('click', function(e){
        e.preventDefault()
        changeModalState('prev')
      })

      $('.js-tutorial-modal-close').on('click', function(e){
        e.preventDefault()
        $tutorialModal.modal('hide')
        $.ajax({url: '/tutorial/complete'})
      })

      $('.js-tutorial-modal-finish').on('click', function(e){
        e.preventDefault()
        $tutorialModal.modal('hide')
        $.ajax({url: '/tutorial/complete'})
        /* Use this when AJAX notifications has been completed
        $('.js-notifications-trigger').delay(500).click()
        $(window).scrollTop(0) // Scroll the window to the top - for mobile
        */
        // Until then, redirect the browser to the homepage and open the notifications dropdown
        window.location.href = '/' + locale + '/?openNotifications=true'
      })

      function changeModalState(direction){

        // Show hide modal content
        $('.js-tutorial_modal__body--step-' + tutorialStep).hide()
        if( direction == 'next' ){
          tutorialStep++
        } else {
          tutorialStep--
        }
        $('.js-tutorial_modal__body--step-' + tutorialStep).show()

        // Highlight timeline
        $('.js-tutorial_modal__timeline li').removeClass('active')
        $('.js-tutorial_modal__timeline li:nth-child(' + tutorialStep + ')').addClass('active')

        // Show/hide footers
        $('.js-tutorial_modal__footer').hide()
        if(tutorialStep == 1){
          $('.js-tutorial_modal__footer--step-first').show()
        } else if(tutorialStep == tutorialStepCount){
          $('.js-tutorial_modal__footer--step-last').show()
        } else {
          $('.js-tutorial_modal__footer--step-default').show()
        }

      }

      $('.js-fileupload-profile-picture').each(function(){
        var $elem = $(this)

        // post images
        $elem.uploadFile({
          url: '/upload'
          , method: 'POST'
          , multiple: false
          , fileName: 'files[]'
          , onSuccess: function (files, data) {
            // files, data, xhr
            $.ajax({
              type: 'POST'
              , url: '/profile/add-profile-picture'
              , data: data
              , dataType: 'json'
              , success: function(data){
                if (data.photo) {
                  $('.profile__user__avatar').attr('src', data.photo.cached)
                  $('.js-tutorial_modal__content__feature--step-5--1').hide()
                  $('.js-tutorial_modal__content__feature--step-5--2').css('display', 'table')
                }
              }
              , error: function (data) {
              }
            })
          }
          , onError: function (files, status, errMsg) {
            // console.log(files, status, errMsg)
            // @todo handle errors
          }
        })
      })

    }

  }

  return module

})(window.jQuery)
