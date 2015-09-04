/* jshint unused: false */
var FanbookzHeader = (function($) {


  // Module object to be returned
  var module =
    { $headerProfile:   $('.header__profile')
    , $headerPredictor: $('.header__predictor')
    , $profileTrigger:  $('.js-header__profile__main')
    , $dropdownTrigger: $('.js-nav-dropdown')
    , $navMobile:       $('.js-nav-mobile')
    , $navTrigger:      $('.js-nav-mobile-trigger')
    , $currency:        $('.js-rmg-menu-balance-currency')
    , $headerPredictor: $('.js-header-predictor')
    , $rmgToggle:       $('.js-rmg-toggle')
    }

  // Set variables to store current notification counts
  var notificationCountAll = parseInt($('.js-notifications').data('notification-count'))
    , notificationCountSocial = parseInt($('.js-notifications__tab--social').data('notification-count'))
    , notificationCountGame = parseInt($('.js-notifications__tab--game').data('notification-count'))
    , notificationCountRewards = parseInt($('.js-notifications__tab--rewards').data('notification-count'))

  // private variable stored ref to matchwidget for the rmg/coins switch
  var Model, data


  var notificationsOpened = false

  /**
   * Initialise
   */
  module.init = function() {


    module.initRMGMenu()
    module.bindProfileTrigger()
    module.bindDropdowns()
    module.bindSearchWidget()
    module.notifications()
    module.markNotificationsAsRead()
    module.bindNotificationBackgroundClose()
    module.bindMobileNav()
    module.responsiveRegisteredRMG()
    module.openRMGNoticeBanner()
    module.closeRMGNoticeBanner()
    module.showRMGPreloader()
    module.showRMGTutorialTooltips()
    module.removeRMGCookiesLogout()
    module.defineCurrentLanguage()
  }

  /*
   * Bind Profile Trigger
   */
  module.bindProfileTrigger = function() {
    module.$profileTrigger.on('click', function (e) {
      // check if not mobile
      if($(window).width() > 767){
        e.preventDefault()
        module.$headerProfile.toggleClass('is-visible')
        if(module.$headerProfile.hasClass('is-visible')){
          module.showNotificationsBG()
        } else {
          module.closeNotificationsBG()
        }
        FanbookzHeader.markNotificationsAsRead()
        module.closeAllDropdowns(module.$headerProfile)
      }
    })
  }

  /*
   * Bind Dropdowns
   */
  module.bindDropdowns = function () {
    module.$dropdownTrigger.on('click', function () {
      var $elem = $(this)
      $elem.siblings().each(function(){
        $(this).removeClass('dropdown-visible')
      })
      $elem.toggleClass('dropdown-visible')
      if($elem.hasClass('dropdown-visible')){
        module.showNotificationsBG()
      } else {
        module.closeNotificationsBG()
      }
      FanbookzHeader.markNotificationsAsRead()
      module.closeAllDropdowns(this)
    })


  }


  /*
   * subscribe match widget to recieve $rmgToggle events
   */

  /*
   * Search widget
   */
  module.bindSearchWidget = function () {
    $('.js-search-trigger').on('click', function () {
      $('.js-search-dropdown').toggleClass('is-visible')
      $(this).toggleClass('is-selected')
      if($('.js-search-dropdown').hasClass('is-visible')){
        module.showNotificationsBG()
        $('.nav__search__input').val('')
        $('.nav__search__input').focus()
      } else {
        module.closeNotificationsBG()
      }
      FanbookzHeader.markNotificationsAsRead()
      module.closeAllDropdowns('.js-search-dropdown')
    })

    if (!$('body').hasClass('user__logged__in')) {
      $('.header__search').appendTo('.header__right-side')
    }

  }

  // --------------------------------------------------------------------//
  // these public methods provide a interface for rmg-menu and rmg-modal //
  // --------------------------------------------------------------------//
  module.initRMGMenu = function() {

    module.Model = HeaderModel.getInstance()

    // FSB modal
    if(module.Model && module.Model.user) {  // if the user is logged in

      module.Model.user.is_rmg_registered = $('.js-rmg-switch, .js-header-predictor').data('fsbregistered')  // find out if they are registered with fsb

      module.FSBModalController = new FSBModalController(module.Model, module.turnRmgOn.bind(module)).initialise()

      if(module.Model.user.is_rmg_registered !== 'unregistered') { // user is fsb registered

        this.showRmgMenu(module.Model.user.gameType)  // show rmg menu

        if (module.Model.user.gameType === 'rmg') {
          module.Model.updateAndGetBalanceFromFSB()
          module.Model.getBalanceFromCache()
        }

        // this.subscribeMatchWidget(scope) // (navbar needs a pointer to matchwidget for on/off switch)
      }
      if(module.Model.rmg && module.Model.rmg.enabled) { // user is not yet registered with fsb but is enabled for real money gambling
        this.showRmgEnabled()  // show 'play for cash' button
      }


      bindRMGMenuEvents()
    }

  }
  var bindRMGMenuEvents = function bindRMGMenuEvents() {

    //// event listeners ////
    var eventDispatcher = EventDispatcher.getInstance()
    eventDispatcher.on('MATCHWIDGET:TURN_RMG_OFF', module.turnRmgOff.bind(module))
    eventDispatcher.on('MATCHWIDGET:TURN_RMG_ON', function(){
      if (module.Model.user.is_rmg_registered === 'unregistered' ) {
        // TODO we should use the model method for this
        module.FSBModalController.openModalAt()
      } else {
        toggleOffOn(module.$rmgToggle)
      }
    })

    if(module.Model.user.is_rmg_registered === 'unregistered' && getUrlParameter('registerrmg')){
      module.FSBModalController.openModalAt()
    }

    // turn RMG on / register new users, if the url parameter "rmgOn" is set
    if(!!getUrlParameter('rmgOn') &&
      !module.Model.isRMGMode()){
      eventDispatcher.trigger('MATCHWIDGET:TURN_RMG_ON')
    }



    module.Model.on('BalanceChange', function(newBalance, wasNull) {

      module.updateRmgBalance(newBalance)
    })

  }

  /**
   * public method called from the rmg toggle switch in the navbar
   * @return {[type]} [description]
   */
  module.turnRmgOn = function(deferred) {

    var callback = function() { document.location.reload() } // reload page
    var callbackOnFail = function() {
      if(deferred) deferred.reject()
    }
    module.Model.setGameMode('rmg').then(callback, callbackOnFail)

  }

  /**
   * public method called from the rmg toggle switch in the navbar
   * @return {[type]} [description]
   */
  module.turnRmgOff = function(deferred) {

    var newLocation = removeParameter(document.location.href, 'rmgOn')
    var callback = function() { document.location.replace(newLocation) } // reload page
    var callbackOnFail = function() {
      if(deferred) deferred.reject()
    }
    module.Model.setGameMode('coins').then(callback, callbackOnFail)

  }

  // --------------------------------------------------------------------//

  /*
   * Notifications Background
   */
  module.closeNotificationsBG = function () {
    $('.js-notification__bg-close').removeClass('is-visible')
  }

  module.showNotificationsBG = function () {
    $('.js-notification__bg-close').addClass('is-visible')
  }

  /* RMG display pre-loader */

  module.showRMGPreloader = function () {
    if (!module.Model) {
      return
    }
    module.$rmgToggle.on('click', function() {
      window.setTimeout(function() {
        $('.nav-container').addClass('nav-container--preloader')
        $('.header').addClass('display__rmg__preloader')
      }, 400)
    })
  }

  /* Show RMG tooltip tutorial after registration */

  module.showRMGTutorialTooltips = function() {

      if ($('body').hasClass('user_logged_in')) {

        module.Model = HeaderModel.getInstance()
        if (!module.Model) {
          return
        }

        function removeTutorial() {
          $('.rmg-switched-warning-tooltip').hide()
          $('.tutorial-tooltip-overlay').hide()
        }

        module.Model.on('Ajax:FSBBalanceUpdateFail Ajax:FSBBalanceGetFail', removeTutorial)

        var tutorialOverlay = $('.tutorial-tooltip-overlay')
            , tutorialContentStep1 = $('.js-tutorial-tooltip-1').html()
            , tutorialContentStep2 = $('.js-tutorial-tooltip-2').html()
            , tutorialContentStep3 = $('.js-tutorial-tooltip-3').html()
            , showTutorial = module.Model.user.rmgTutorial//this will be 0 = do not show, 1 = show tutorial at step 1, 3 = show tutorial at step 3, 4 = tutorial fn
            , gameMode = module.Model.user.gameType

        function showTutorialTooltip1() {


          $(tutorialOverlay).hide().fadeIn(200)

          var $tutorialTooltipOwner = $('.js-tutorial-tooltip-balance').tooltip({
            template: Hogan.compile($('.temp__rmg-tutorial-tooltip').html()).render({
              errorClass: 'rmg-switched-warning-tooltip friendly balance-tooltip js-rmg-switched-tooltip'
            })
            , placement: 'bottom'
            , trigger: 'manual'
            , html: true
            , title: tutorialContentStep1
          }).tooltip('show')

          $('.js-rmg-tutorial-cta').on('click', function () {
            $tutorialTooltipOwner.tooltip('hide')
            module.Model.setTutorialStage(2)
            showTutorialTooltip2()
            })


        }

        function showTutorialTooltip2() {

          $(tutorialOverlay).fadeIn(200)

          var $tutorialTooltipOwner = $('.js-nav-with-rmg-switch').tooltip({
            template: Hogan.compile($('.temp__rmg-tutorial-tooltip').html()).render({
              errorClass: 'rmg-switched-warning-tooltip friendly js-rmg-switched-tooltip'
            })
            , placement: 'bottom'
            , trigger: 'manual'
            , html: true
            , title: tutorialContentStep2
          }).tooltip('show')

          $('.js-rmg-tutorial-cta').on('click touchend', function () {
            module.Model.setTutorialStage(3)
          })


          $('.js-close-tutorial-tooltip').on('click', function () {
            module.Model.setTutorialStage(3)
            $tutorialTooltipOwner.tooltip('hide')
            $(tutorialOverlay).show().fadeOut(400)
          })

        }

        function showTutorialTooltip3() {

          $(tutorialOverlay).hide()

          var $tutorialTooltipOwner = $('.js-tooltip-stake-placeholder').tooltip({
            template: Hogan.compile($('.temp__rmg-tutorial-tooltip').html()).render({
              errorClass: 'rmg-switched-warning-tooltip friendly js-rmg-switched-tooltip'
            })
            , placement: 'bottom'
            , trigger: 'manual'
            , html: true
            , title: tutorialContentStep3
          }).tooltip('show')

          $('.js-rmg-tutorial-cta').on('click', function () {
            module.Model.setTutorialStage(4)
            $tutorialTooltipOwner.tooltip('hide')
            $(tutorialOverlay).hide()
          })

        }

        if ((showTutorial == 1) && (gameMode === 'rmg' || gameMode === 'coins')) {
          showTutorialTooltip1()
        }
        else if ((showTutorial == 2) && (gameMode === 'rmg' || gameMode === 'coins')) {
          showTutorialTooltip2()
        }
        else if ((showTutorial == 3) && (gameMode === 'rmg' || gameMode === 'coins')) {
          setTimeout(function () {
            showTutorialTooltip3()
          }, 1000)
        }

    }
  }

  /**
   * this method called from match widget
   * shows the button for 'play with real money'
   */
  module.showRmgEnabled = function() {
    $('.js-rmg-switch').removeClass('is-hidden')
  }
  module.hideRmgEnabled = function() {
    $('.js-rmg-switch').addClass('is-hidden')
  }

  module.showRmgMenu = function(gameType) {
    this.$balanceDisplay = $('.js-rmg-balance')
    this.$balanceDisplay.removeClass('is-hidden')
    $('.js-rmg-switch').addClass('is-hidden')
    $('.js-rmg-menu').removeClass('is-hidden')
    $('.js-rmg-dropdown').removeClass('is-hidden')

    // bind toggle functionality
    if(gameType === "rmg") {
      module.$rmgToggle.addClass('on')
    }

    if((gameType === "rmg") && $(window).width() < 768) {
      $('.header__rmg .nav__link').addClass('real-money-units')
    }

    var handleToggleClick = function(e) {
      e.stopPropagation()
      $currentTarget = $(e.currentTarget)
      toggleOffOn($currentTarget)
    }

    module.$rmgToggle.on('click', handleToggleClick)
    module.$dropdownTrigger
      .find('.js-rmg-switch-coins')
      .on('click', toggleOffOn)

    // this view is never available with the current UX
    module.$dropdownTrigger.find('.js-rmg-switch-money')
      .on('click', function (e) {
        module.$rmgToggle.addClass('on')
        e.stopPropagation()
      })

  }

  var toggleOffOn = function($currentTarget) {

    var gameType = module.Model.user.gameType

    // visually toggle off or on
    if ($currentTarget.hasClass('on')) {
      $currentTarget.off('click').removeClass('on')
    }
    else {
      $currentTarget.off('click').addClass('on')
    }

    // if the turning off or on fails, revert the state of the toggle and reattach the event listener
    var d = new $.Deferred().fail(function() {
      $currentTarget.on('click', toggleOffOn)
      // visually revert toggle
      if ($currentTarget.hasClass('on')) {
        $currentTarget.removeClass('on')
      }
      else {
        $currentTarget.addClass('on')
      }
    })

    if(gameType == 'rmg') {
      module.turnRmgOff(d)
    } else {
      module.turnRmgOn(d)
    }

  }


  module.updateRmgBalance = function(amount) {
    $('.js-rmg-menu-balance').html(CurrencyFormatter.getInstance({
      currencyCode: module.Model.user.currencyCode
    }).formatAmount(amount))
  }

  module.closeAllDropdowns = function (exclude) {
    $('.js-notifications').not(exclude).removeClass('is-visible')
    $('.js-search-dropdown').not(exclude).removeClass('is-visible')
    $('.js-nav-dropdown').not(exclude).removeClass('dropdown-visible')
    module.$headerProfile.not(exclude).removeClass('is-visible')
    module.removeNotificationsBadge(exclude)
  }

  module.removeNotificationsBadge = function (currentDropdown) {
    if (
      ((currentDropdown === '.js-notifications' || currentDropdown === undefined) && !$('.js-notifications').hasClass('is-visible'))
      || ((currentDropdown !== '.js-notifications' && currentDropdown !== undefined) && notificationsOpened)
    ) {
      $('.js-notifications-trigger').find('.badge').remove()
    }
  }

  module.bindNotificationBackgroundClose = function () {
    $('.js-notification__bg-close').on('click', function () {
      FanbookzHeader.markNotificationsAsRead()
      module.closeAllDropdowns()
      module.closeNotificationsBG()
    })
  }

  /*
   * Bind Mobile Navigation
   */
  module.bindMobileNav = function () {
    module.$navTrigger.on('click', function () {
      if(module.$navMobile.hasClass('is-visible')){
        module.$navMobile.removeClass('is-visible')
        module.$navTrigger.removeClass('is-active')
      }else{
        module.$navMobile.addClass('is-visible')
        module.$navTrigger.addClass('is-active')
        $('.js-notifications').removeClass('is-visible')
      }
    })
  }

  /*
   * Notifications
   */
  module.notifications = function () {
    $('.js-notifications-trigger').on('click', function () {
      var $notifications = $('.js-notifications')
      $notifications.toggleClass('is-visible')
      notificationsOpened = $notifications.hasClass('is-visible')
      if(notificationsOpened){
        module.showNotificationsBG()
      } else {
        FanbookzHeader.markNotificationsAsRead(true)
        module.closeNotificationsBG()
      }
      module.closeAllDropdowns('.js-notifications')
    })

    // Notifications tabs
    $('.notifications__tabs li').on('click', function () {
      //  First remove class 'active' from currently active tab
      $('.notifications__tabs li').removeClass('is--viewable')

      // Add class 'active' to the selected notifications tab
      $(this).addClass('is--viewable')

      //  Hide all tab content
      $('.js-notifications__content').hide()

      // Get the href value of the selected tab
      var notificationsSelectedTab = $(this).find('a').data('tab')

      //  Show the selected tab content
      $(notificationsSelectedTab).fadeIn(400)

      //  Click on the link is not executed
      return false
    })

    $('.js-notification-comment').on('click', function () {

      replyWidget.markAsRead(function(err, result) {
          if (result) {
            var notificationCount = $('.badge').html()
            if ((notificationCount - 1) > 0) {
               $('.badge').html(notificationCount - 1)
            } else {
               $('.header__profile__notifications-badge').hide()
            }
          }
      })
      $('.js-notifications').toggleClass('is-visible')
    })

    // Helper functions

    // Deduct one from the notification counts for a defined category
    function notificationCategoryCountMinusOne(notificationCategory){

      // Calculate the new notification count
      var notificationCountAllNew = notificationCountAll - 1
      var notificationCategoryTab = $('.js-notifications__tab--'+notificationCategory)

      // Update red header badge count
      if(notificationCountAllNew == 0){
        $('.js-header__profile__notifications-badge-count').hide()
        $('.header__profile__notifications-badge').addClass('header__profile__notifications-badge--cleared')

        // And hide the Clear All link
        $('.js-notifications__footer').addClass('notifications__footer--disabled')

      } else {
        $('.js-header__profile__notifications-badge-count').html(notificationCountAllNew.toString())
      }

      // Update All Notifications tab count
      // Check to ensure the count is not negative
      if(notificationCountAllNew > -1){
        $('.js-notifications__tab__count--all').html('('+notificationCountAllNew.toString()+')')
        notificationCountAll = notificationCountAllNew
      }

      // Update the related tab count (Social, Predictions, Rewards)
      if(notificationCategory == "social"){
        if(notificationCountSocial > 0){
          notificationCountSocial = notificationCountSocial - 1
          $('.js-notifications__tab__count--social').html('(' + notificationCountSocial + ')')
        }
      } else if(notificationCategory == "game"){
        if(notificationCountGame > 0){
          notificationCountGame = notificationCountGame - 1
          $('.js-notifications__tab__count--game').html('(' + notificationCountGame + ')')
        }
      } else if(notificationCategory == "rewards"){
        if(notificationCountRewards > 0){
          notificationCountRewards = notificationCountRewards - 1
          $('.js-notifications__tab__count--rewards').html('(' + notificationCountRewards + ')')
        }
      }

    }


    // 'Clear all notifications' button action
    $('.js-notifications-clear-all').on('click', function(e){
      e.preventDefault()
      $.ajax({
        type: 'POST'
        , url: '/api/notifications/clear_all'
        , success: function(response, textStatus, jqXHR) {
          if(response.success === false){
              //console.log('no success')
          } else {
            // Remove all the notifications
            $('.notification__single').remove()
            FanbookzHeader.resetNotificationCounts()
            // Hide the Clear All link
            $('.js-notifications__footer').addClass('notifications__footer--disabled')
            // Hide the dropdown
            $('.js-notifications').toggleClass('is-visible')
          }
        }
        , error: function(response, textStatus, jqXHR) {
          if(response.success === false){
              //console.log('no success')
          }
        }
      })
    })


    // Clear single notification button action
    $('.js-notification__single__clear').on('click', function(e){
      e.preventDefault()
      clearSingleNotification($(this).parent())
    })

    function clearSingleNotification(notification){
      $.ajax({
        type: 'POST'
        , url: '/api/notifications/clear/' + $(notification).data('notification-id')
        , success: function(response, textStatus, jqXHR) {
         if(response.success === true){
           if( $(notification).hasClass('js-notification__single--social') ){
             var notificationCategory = 'social'
           } else if( $(notification).hasClass('js-notification__single--game') ) {
             var notificationCategory = 'game'
           } else if( $(notification).hasClass('js-notification__single--rewards') ) {
             var notificationCategory = 'rewards'
           }
           notificationCategoryCountMinusOne(notificationCategory)
           // We need to remove all instances of the notification, not just this one
           //$(notification).remove()
           var notificationID = $(notification).data('notification-id')
           $('.js-notifications__content li[data-notification-id=' + notificationID + ']').remove()
          }
         }
         , error: function(response, textStatus, jqXHR) {
         if(response.success === false){
           //console.log('no success')
         }
        }
      })
    }

  }

  // Hide notifications badge + reduce all counts to zero
  module.resetNotificationCounts = function () {
    // Update the counts
    $('.js-header__profile__notifications-badge-count').hide()
    $('.header__profile__notifications-badge').addClass('header__profile__notifications-badge--cleared')
    $('.js-notifications__tab__count').html('(0)')
    notificationCountAll = 0
  }

  // Marking notifications as read
  var notificationsRead = false

  // Setting 'force' to true forces clearing the notifications even if the dropdown isn't currently visible
  module.markNotificationsAsRead = function (force) {

    // Check that we haven't already cleared the notifications and that we have some to clear
    if(!notificationsRead && parseInt($('.js-notifications').data('notification-count')) > 0){
      if(force || $('.js-notifications').hasClass('is-visible')){
        $.ajax({
          type: 'POST'
          , url: '/api/notifications/read_all'
          , success: function(response, textStatus, jqXHR) {
            if(response.success === false){
              //console.log('no success')
            } else {
              // Notifications cleared on the backend, now update the frontend without a page reload
              notificationsRead = true
              // Change all the blue notifications to white
              $('.notification__single').not('.notification__single--read').addClass('notification__single--read')
              FanbookzHeader.resetNotificationCounts()
            }
          }
          , error: function(response, textStatus, jqXHR) {
            if(response.success === false){
              //console.log('no success')
            }
          }
        })
      }
    }

  }

  module.responsiveRegisteredRMG = function() {
    var device = Fanbookz.getDeviceSize()
    var mobileRMG = $('.nav-container--mobile')
    if((device == 'mobile') || $(window).width() == 768) {
      $(mobileRMG).show()
      $('.header__rmg').appendTo('.nav-container--mobile')
    }
    else {
      $(mobileRMG).hide()
      $('.header__rmg').appendTo('.nav-container .header__right-side').insertBefore('.header__search')
    }

    //Horizontal mobile (< 460px width) dropdown fix
    if((device == 'mobile') && $(window).height() < 460) {
      $('.header__rmg__predictor--balance').find('.nav__link__dropdown').addClass('horizontal-mobile-dropdown')
    }
  }

  module.openRMGNoticeBanner = function() {
    var device = Fanbookz.getDeviceSize()
    if(device == 'mobile') {
      $('.rmg__notice__banner').hide()
    }
    else if (Cookies.enabled == true && Cookies.get('rmg-notice-closed') == 'true') {
      $('.rmg__notice__banner').hide()
    }
    else {

      $('.rmg__notice__banner').slideDown(400)
      Cookies.set('rmg-notice-closed', '')
    }

  }

  module.closeRMGNoticeBanner = function() {
    $('.js-rmg-notice-banner-close').on('click', function () {
      Cookies.set('rmg-notice-closed', 'true', { expires: 86400 })
      $(this).parent().parent().slideUp(400)
    })
  }

  module.removeRMGCookiesLogout = function() {
    $('.header__profile__dropdown a:last-child').on('click', function () {
      Cookies.set('rmg-notice-closed', '')
    })
  }

  module.defineCurrentLanguage = function() {
    if($('body').hasClass('lang-de')) {
      module.$rmgToggle.addClass('rmg-toggle--de')
    }
  }

  $(window).resize(function() {
    module.responsiveRegisteredRMG()
    module.openRMGNoticeBanner()
  })


  return module

})(window.jQuery)
