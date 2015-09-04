FANBOOKZ.loginSlider = {
    openLoginSlider: function(){
        $('.registration__slider').addClass('hide__mobile__registration__overflow')
        $('.registration__slider').css('overflow-y','auto')
        if($(window).width() > 768) {
            $(".js-registration__slider").show().animate({top:"0px"}, 400)
            $(".js-registration__slider__toggle").addClass("isOpen")
        }
        else if ($('.registration__slider').hasClass('login__slider__referral')) {
            $('body').addClass('hide__mobile__login__overflow')
            $('html').addClass('hide__mobile__login__overflow')
            $('.page').addClass('hide__mobile__login__overflow')
            $(".js-registration__slider").animate({height:"100%"}, 400)
            $(".js-registration__slider__toggle").addClass("isOpen")
            $(".js-registration__slider__toggle").removeClass("alternate__toggle")
        }
        else {
            $('body').addClass('hide__mobile__login__overflow')
            $('html').addClass('hide__mobile__login__overflow')
            $('.page').addClass('hide__mobile__login__overflow')
            $(".js-registration__slider").animate({top:"0"}, 400)
            $(".js-registration__slider__toggle").addClass("isOpen")
            $(".js-registration__slider__toggle").removeClass("alternate__toggle")
        }
    }
    , closeLoginSlider: function(){
        $('.registration__slider').removeClass('hide__mobile__registration__overflow')
        $('.js-header-profile-signup').removeClass('header__profile__signup--active')
        $('.js-header-profile-login').removeClass('header__profile__login--active')
        $('.registration__slider').css('overflow-y','hidden')
        if($(window).width() > 768) {
            $(".js-registration__slider").animate({top:"-100%"}, 400, null, function(){
                $(this).hide()
            })
            $(".js-registration__slider__toggle").removeClass("isOpen")
        }
        else if ($('.registration__slider').hasClass('login__slider__referral')) {
            $('body').removeClass('hide__mobile__login__overflow')
            $('html').removeClass('hide__mobile__login__overflow')
            $('.page').removeClass('hide__mobile__login__overflow')
            FANBOOKZ.loginSlider.minimizeReferralSlider()
            $(".js-registration__slider__toggle").removeClass("isOpen").addClass("alternate__toggle")
        }
        else {
            $('body').removeClass('hide__mobile__login__overflow')
            $('html').removeClass('hide__mobile__login__overflow')
            $('.page').removeClass('hide__mobile__login__overflow')
            $(".js-registration__slider").animate({top:"-100%"}, 400)
            $(".js-registration__slider__toggle").removeClass("isOpen")
        }
    }
    ,jumpToLoginForm: function() {
      $('.js-header-profile-login').addClass('header__profile__login--active')
      $('.js-header-profile-signup').removeClass('header__profile__signup--active')
      $('.registration__slider__content__register').css('display','none')
      $('.registration__slider__content__login').css('display','block')
      $('.slider__form__buttons').css('display','none')
    }
    , switchToLoginForm: function(){
      $('.js-header-profile-login').addClass('header__profile__login--active')
      $('.js-header-profile-signup').removeClass('header__profile__signup--active')
      $('.registration__slider__content__register').fadeOut(200, function() {
        $('.registration__slider__content__login').fadeIn(600)
      })
      $('.slider__form__buttons').hide()
    }
    , switchToRegisterForm: function(){
      $('.js-header-profile-signup').addClass('header__profile__signup--active')
      $('.js-header-profile-login').removeClass('header__profile__login--active')
      $('.registration__slider__content__login').fadeOut(200, function() {
        $('.registration__slider__content__register').fadeIn(600)
      })
      $('.slider__form__buttons').fadeIn(600)
    }
    , minimizeReferralSlider: function(){
        $(".login__slider__referral").css('height', '56px')
        $(".login__slider__referral").animate({bottom:"0px"}, 400)
    }
    , minimizeReferralSliderResize: function(){
        var windowHeight = $(window).height() - 56
        $(".login__slider__referral").css('bottom', '-' + windowHeight + 'px')
    }
    , init: function() {

        /*$('.page').mouseup(function (e)
        {
            var container = $(".registration__slider");

            if (!container.is(e.target) && container.has(e.target).length === 0)
            {
                FANBOOKZ.loginSlider.closeLoginSlider()
            }

        })

                $('.page').mouseup(function (e)
        {
            var secondaryContainer = $('.social__comment-post__non-user')

            if (!secondaryContainer.is(e.target) && secondaryContainer.has(e.target).length === 0) {
                FANBOOKZ.loginSlider.closeLoginSlider()
            }

        })*/

        if($('.registration__slider').children('span').not(':has(.isOpen)')) {
            $('.registration__slider').css('overflow-y','hidden')
        }

        if($(window).width() < 768) {
            $(".js-registration__slider").addClass("registration__slider-mobile js-registration-slider-mobile")
            $(".js-registration__slider__toggle").addClass("registration__slider__toggle-mobile js-registration-slider-mobile")
        }

        $(".js-registration__slider__toggle").click( function(event){
            event.preventDefault()
            if ($(this).hasClass("isOpen") ) {
              FANBOOKZ.loginSlider.closeLoginSlider()
            } else {
              FANBOOKZ.loginSlider.openLoginSlider()
            }
            return false;
        })

        $(".js-header-profile-login").click( function(event){
            $(this).toggleClass('js-header-profile-slider-active')
            if ($(this).hasClass("js-header-profile-slider-active") || $('js-header-profile-signup').hasClass("js-header-profile-slider-active")) {
                $('.js-nav-mobile-trigger').removeClass('is-active')
                $('.js-nav-mobile').removeClass('is-visible')
                $(this).addClass('header__profile__login--active')
                $('.js-header-profile-signup').removeClass('header__profile__signup--active')
                FANBOOKZ.loginSlider.switchToLoginForm()
                FANBOOKZ.loginSlider.openLoginSlider()
                $('.js-header-profile-signup').removeClass('js-header-profile-slider-active')
            }
            else {
                FANBOOKZ.loginSlider.closeLoginSlider()
                $(this).removeClass('js-header-profile-slider-active')
            }

        });

        $(".js-header-profile-signup").click( function(event){
            $(this).toggleClass('js-header-profile-slider-active')
            if ($(this).hasClass("js-header-profile-slider-active") || $('js-header-profile-login').hasClass("js-header-profile-slider-active")) {
                $('.js-nav-mobile-trigger').removeClass('is-active')
                $('.js-nav-mobile').removeClass('is-visible')
                $(this).addClass('header__profile__signup--active')
                $('.js-header-profile-login').removeClass('header__profile__login--active')
                FANBOOKZ.loginSlider.switchToRegisterForm()
                FANBOOKZ.loginSlider.openLoginSlider()
                $('.js-header-profile-login').removeClass('js-header-profile-slider-active')
            }
            else {
                FANBOOKZ.loginSlider.closeLoginSlider()
                $(this).removeClass('js-header-profile-slider-active')
            }

        });

        $(".js-reply-comment-login").click( function(event){
            FANBOOKZ.loginSlider.switchToRegisterForm()
            FANBOOKZ.loginSlider.openLoginSlider()
        });

        $(".js-nav-mobile-trigger").click( function(event){
            FANBOOKZ.loginSlider.closeLoginSlider()
        });

        $(".registration__slider-referral").click( function(event){
            $(this).hide()
            FANBOOKZ.loginSlider.switchToRegisterForm()
            FANBOOKZ.loginSlider.openLoginSlider()
        });

        //Hide and show the relevant registration/login form

        $('.authorisation__footer').insertAfter('.slider__form__buttons');

        $(".authorisation__link--login").on('click', function() {
          FANBOOKZ.loginSlider.switchToLoginForm()
        })

        $('.registration__slider__content .registration__slider__content__login > form .authorisation__link').addClass('slider-register')
        $('.slider-register a:eq(1)').on('click', function() {
            $(this).removeAttr('href')
            $('.js-header-profile-signup').addClass('header__profile__signup--active')
            $('.js-header-profile-login').removeClass('header__profile__login--active')
            $('.registration__slider__content__login').fadeOut(200, function() {
                $('.registration__slider__content__register').fadeIn(600);
                $('.slider__form__buttons').fadeIn(600);
            })
        })


        $(document).on('click', '.js-form-slider-submit', function(event) {
            storeRegistrationInfo()
        })

        storeRegistrationInfo = function () {
            $.ajax({
                url: $('form.fos_user_registration_register').attr('action')
                , method: 'POST'
//                , async: false
                , cache: false
                , data: $('form.fos_user_registration_register').serialize()
                , success: function(data, status, xhr) {
                    var ct = xhr.getResponseHeader("content-type") || "";

                    if (ct == "application/json") {

                        window.location.href = data.url

                    }else{
                        $('.registration__slider__content').empty()
                        $('.registration__slider__content').append(data)

                        var $forms = $('form')
                        $forms.parsley({
                            errorClass: 'is-error'
                            , successClass: 'is-success'
                            , errorsWrapper: '<ul class="alert-list"></ul>'
                            , errorTemplate: '<li class="alert alert--danger"></li>'
                            // TODO this only for team picker form
                            , excluded: 'input[type=reset], [disabled]'
                        })


                        $('.js-field-errors').each(function(i, fieldError){

                            var inputId = $(fieldError).attr('class').match(/(js-for-)(\w+)/)[2]
                                , inputField = $('.js-input-'+inputId)[0]
                                , parsleyInstance = inputField ? $(inputField).data('Parsley') : undefined
                                , message = $(fieldError).find('li').text()

                            $(inputField).attr('title', message)
                                .attr('data-original-title', message);

                            if ( parsleyInstance ) {

                                window.ParsleyUI.addError(parsleyInstance, '_undefined', message);
                                $(inputField).tooltip({trigger: 'manual'});
                                return;

                            } else {

                                var $inputField = $(inputField);
                                if ($inputField.attr('type')==='submit') {
                                    // input[type=submit] keeps getting ignored by the Parley plugin,
                                    // so it won't have a ParsleyUI object assigned to it

                                    $inputField.tooltip({trigger: 'manual'}).tooltip('show');

                                    $inputField.closest('.page').click(function(){
                                        $inputField.tooltip('destroy');
                                    })
                                }
                            }
                        })

                        $('.js-input-has-parsley-validation').focus(function(e){

                            var hasTooltip = typeof ($(e.currentTarget).data('bs.tooltip')) !== 'undefined';
                            var parsleyInstance = $(e.currentTarget).data('Parsley')
                            if (hasTooltip) {
                                $(e.currentTarget).tooltip('show')
                            }

                        }).blur(function(e){

                            var hasTooltip = typeof ($(e.currentTarget).data('bs.tooltip')) !== 'undefined';
                            if (hasTooltip) {
                                $(e.currentTarget).tooltip('hide');
                            }

                        }).mouseout(function(e){

                            var hasTooltip = typeof ($(e.currentTarget).data('bs.tooltip')) !== 'undefined';
                            if (hasTooltip) {
                                $(e.currentTarget).tooltip('hide');
                            }
                        })
                    }
                }
                , error: function(data) {
                    console.log(data)
                }
            })
            event.preventDefault()
        }
    }
}
