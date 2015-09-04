/* jshint unused: false */
var FanbookzModals = (function($) {

  // Module object to be returned
  var module =
    { $modalTeamPicker: $('.modal__team-picker')
    , $modalCommercePurchase: $('.js-modal__commerce-purchase')
    , $modalUserFriends: $('.js-modal__user-friends')
    , isModalCommercePurchaseOpened: false
    }

  /**
   * Initialise
   */
  module.init = function() {
    module.commercePurchaseModal()
    module.teamPickerModal()
    module.userFriendsModal()

    $('a.close').on('click', function(e){
      $('html,body').css('overflow','auto')
    })
  }

  /*
   * Commerce Purchase Modal
   */
  module.commercePurchaseModal = function () {
    if (module.$modalCommercePurchase.length) {
      $.get(paths.coins, function(a) {
        module.$modalCommercePurchase.html(a)
        module.$modalCommercePurchase.easyModal({
          updateZIndexOnOpen: false, // 19 Jan 2015 -- z-indexes are being set to over 2147483647 which breaks the rendering
          onOpen: function() {

            // Ensure we have our Stripe handlers
            FANBOOKZ.commerce.purchase()

            $('html,body').css('overflow', 'hidden')
          }
        , onClose: function() {
            $('html,body').css('overflow', 'auto')
          }
        , zIndex: function() {
            // The Stripe checkout z-index is 9999 we need to go behind it
            return 9998
          }
        })
      })

      $('body').on('click', '.js-modal-buy-coins' , function (e) {
        e.preventDefault()
        $('.header__profile').removeClass('is-visible')
        module.$modalCommercePurchase.trigger('openModal')
        module.calculatePurchaseModalHeight()
      })

      $(window).on('resize', function () {
        if (module.isModalCommercePurchaseOpened) {
          module.calculatePurchaseModalHeight()
        }
      })

      module.$modalCommercePurchase.on('openModal', function () {
        module.isModalCommercePurchaseOpened = true
      });

      module.$modalCommercePurchase.on('closeModal', function () {
        module.isModalCommercePurchaseOpened = false
      });
    }
  }

  module.calculatePurchaseModalHeight = function () {
    var  windowHeight = $(window).height()
        , modalCommercePurchaseHeight = module.$modalCommercePurchase.height()
        , extraPadding = 20
        , productPickerHeight = 0

    if (windowHeight < modalCommercePurchaseHeight) {
      productPickerHeight = (
        windowHeight - module.$modalCommercePurchase.find('.js-modal__header').outerHeight() - extraPadding
      )
    }

    module.$modalCommercePurchase.find('.js-product-picker__product-list').height(
      (productPickerHeight > 0) ? productPickerHeight : 'auto'
    )
  }

  /*
   * Team Picker Modal
   */
  module.teamPickerModal = function () {
    if (module.$modalTeamPicker.length) {
        module.$modalTeamPicker.easyModal({
            updateZIndexOnOpen: false, // 14 Jan 2015 -- z-indexes are being set to over 2147483647 which breaks the rendering
            onOpen: function() {
                $('html,body').css('overflow', 'hidden')
            }
            , onClose: function() {
                $('html,body').css('overflow', 'auto')

                // Clean up any custom click handlers
                module.$modalTeamPicker.off('click.customTeamSelect')

                // If we’ve updated any HTML, e.g. the title, reset it
                module.$modalTeamPicker.find('[data-original-html]').each(function () {
                    var $this = $(this)
                    $this.html($this.data('original-html'))
                    $this.removeAttr('data-original-html')
                })
            }
        })

        $('.js-teampicker.js-easymodal-trigger').on('click', function (e) {

            if(module.$modalTeamPicker.attr('first-load') !== 'false')
            {
                $.ajax({
                    url: paths.base+"/"+locale+"/team_picker",
                    context: document.body
                }).done(function(content) {
                    module.$modalTeamPicker.html(content)
                    module.$modalTeamPicker.attr('first-load', true)
                })
            }

            e.preventDefault()

            var $pickerLauncher = $(this)

            // Attach a custom click handler for the team inside the modal
            // Note the namespace, which gets cleaned up on modal close
            module.$modalTeamPicker.on('click.customTeamSelect', '[data-team]', function (e) {

                var $team = $(this)

                // Is this link designed to sync the chosen team back to a field value?
                if ($pickerLauncher.is('[data-sync-team-id]')) {
                    e.preventDefault()

                    // The form field
                    var $syncTarget = $($pickerLauncher.data('sync-team-id'))

                    // TODO Un-collapse the competition for any existing team id

                    if ($syncTarget.length) {
                        $syncTarget.val($team.data('id'))
                    }

                    // Auto-close
                    module.$modalTeamPicker.trigger('closeModal')
                }

                // Is this link designed to sync the chosen team with a team display
                // widget?
                if ($pickerLauncher.is('[data-sync-team-widget]')) {
                    e.preventDefault()

                    // The widget
                    var $widget = $($pickerLauncher.data('sync-team-widget'))

                    if ($widget.length) {
                        // This is some rudimentary code to display the team info in the
                        // existing widget
                        var teamShirtClassPrefix = 's-'
                            , teamSlugAttribute = 'data-team-slug'
                            , selectedTeamSlug = $team.data('team-slug')
                            , currentTeamSlug = $widget.attr(teamSlugAttribute)
                            , $teamShirt = $widget.find('.sprite-shirt')

                        $widget.find('.team__shirt')
                            .attr('src', $team.data('shirt-image'))
                            .attr('alt', $team.data('short-name' + ' icon'))
                        $widget.find('.team__short-name').text($team.data('short-name'))

                        if (selectedTeamSlug !== currentTeamSlug) {
                          $teamShirt
                            // Removes the current team jersey.
                            .removeClass(teamShirtClassPrefix + currentTeamSlug)
                            // Adds the selected team jersey.
                            .addClass(teamShirtClassPrefix + selectedTeamSlug)

                          // Updates the current team slug (this slug lets us switch between jerseys).
                          $widget.attr(teamSlugAttribute, selectedTeamSlug)
                        }

                        $widget.show()

                        if($pickerLauncher.hasClass('js-fauxselect')) {
                            $pickerLauncher.find('.placeholder').html('')
                            $pickerLauncher.addClass('team-picker--selected')
                            // TODO find a nicer way of doing this - in a rush for release
                            $('.register__form__fields--step2').slideDown()
                        }
                    }
                }
            })

            // Do we have a custom title?
            if ($pickerLauncher.is('[data-team-picker-title]')) {

                var $teamPickerTitle = module.$modalTeamPicker.find('[data-team-picker-title]')

                if ($teamPickerTitle.length) {
                    // Store the original HTML so we can reset later
                    $teamPickerTitle.attr('data-original-html', $teamPickerTitle.html())

                    // And set the new title
                    $teamPickerTitle.html($pickerLauncher.data('team-picker-title'))
                }
            }

            module.$modalTeamPicker.trigger('openModal')
        })
    }
  }

  /*
  * User Followers Modal
  */

  module.userFriendsModal = function () {
    if (module.$modalUserFriends.length) {
        module.$modalUserFriends.easyModal({
            updateZIndexOnOpen: false, // 19 Jan 2015 -- z-indexes are being set to over 2147483647 which breaks the rendering
            onOpen: function() {
                $('html,body').css('overflow', 'hidden')
            }
            , onClose: function() {
                $('html,body').css('overflow', 'auto')
                clearPreviousModal()
            }
        })


      $('.js-user-friends').on('click', function (e) {
        if (module.$modalUserFriends.attr('first-load') !== 'false' && $(this).hasClass('followers'))
        {
            //  May possibly be using ajax to pull in the content  fo the modal in future.
            // $.ajax({
            //     url: "/"+locale+"/followers_modal",
            //     context: document.body
            // }).done(function(content) {
            //     module.$modalUserFollowers.html(content)
                // module.$modalUserFollowers.attr('first-load', true)
            // })

          loadFollowersModal()
        } else if (module.$modalUserFriends.attr('first-load') !== 'false' && $(this).hasClass('following')) {
          loadFollowingModal()
        }
        e.preventDefault()
        module.$modalUserFriends.trigger('openModal')
      })

      // tab links to load other content
      $('body').on('click', '.js-user-friends__tab--followers', function(){
        clearPreviousModal()
        loadFollowersModal()
      })
      $('body').on('click', '.js-user-friends__tab--following', function(){
        clearPreviousModal()
        loadFollowingModal()
      })

      // functions to load the correct content
      var loadFollowersModal = function() {
        var content = $('.user-friends-modal').html()
        module.$modalUserFriends.html(content)
        module.$modalUserFriends.attr('first-load', true)
        $('.js-user-friends__followers').addClass('visible')
        $('.js-user-friends__tab--left a').addClass('active')
      }
      var loadFollowingModal = function() {
        var content = $('.user-friends-modal').html()
        module.$modalUserFriends.html(content)
        module.$modalUserFriends.attr('first-load', true)
        $('.js-user-friends__following').addClass('visible')
        $('.js-user-friends__tab--right a').addClass('active')
      }
      var clearPreviousModal = function() {
        $('.js-user-friends').removeClass('visible')
        $('.js-user-friends__tab a').removeClass('active')
      }
    }
  }

  return module

})(window.jQuery)
