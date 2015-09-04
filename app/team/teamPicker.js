/* jshint unused: false */
var FanbookzTeamPicker = (function($) {
// Module object to be returned
    var module =
    {}
    /**
     * Initialise
     */
    module.init = function() {
        var $modalTeamPicker = $('.modal__team-picker')

        if ($modalTeamPicker.length) {
            $modalTeamPicker.easyModal({
                updateZIndexOnOpen: false, // 19 Jan 2015 -- z-indexes are being set to over 2147483647 which breaks the rendering
                onOpen: function() {
                    $('html,body').css('overflow', 'hidden')
                }
                , onClose: function() {
                    $('html,body').css('overflow', 'auto')

                    // Clean up any custom click handlers
                    $modalTeamPicker.off('click.customTeamSelect')

                    // If we’ve updated any HTML, e.g. the title, reset it
                    $modalTeamPicker.find('[data-original-html]').each(function () {
                        var $this = $(this)
                        $this.html($this.data('original-html'))
                        $this.removeAttr('data-original-html')
                    })
                }
            })

            $('a.team-picker.js-easymodal-trigger').on('click', function (e) {

                e.preventDefault()

                var $pickerLauncher = $(this)

                // Attach a custom click handler for the team inside the modal
                // Note the namespace, which gets cleaned up on modal close
                $modalTeamPicker.on('click.customTeamSelect', '[data-team]', function (e) {

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
                        $modalTeamPicker.trigger('closeModal')
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
                            $widget.find('.team__shirt')
                                .attr('src', $team.data('shirt-image'))
                                .attr('alt', $team.data('short-name' + ' icon'))
                            $widget.find('.team__short-name').html($team.data('short-name'))
                            $.ajax({
                                url: "/team_select/"+$team.data('id'),
                                context: document.body
                            }).done(function(content) {})

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

                    var $teamPickerTitle = $modalTeamPicker.find('[data-team-picker-title]')

                    if ($teamPickerTitle.length) {
                        // Store the original HTML so we can reset later
                        $teamPickerTitle.attr('data-original-html', $teamPickerTitle.html())

                        // And set the new title
                        $teamPickerTitle.html($pickerLauncher.data('team-picker-title'))
                    }
                }

                $modalTeamPicker.trigger('openModal')
            })
        }
    }
    return module
})(window.jQuery)
