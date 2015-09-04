var FanbookzGATracker = (function($) {
// Module object to be returned
    var module =
    {}

    var analyticEvents =
    { "match-no-odds":
    { "category": "event"
        , "action": "predictor"
        , "label": "click"
        , "value": "no odds"
    }
        , "match-home-win":
    { "category": "event"
        , "action": "predictor"
        , "label": "click"
        , "value": "home win"
    }
        , "match-away-win":
    { "category": "event"
        , "action": "predictor"
        , "label": "click"
        , "value": "away win"
    }
        , "match-draw":
    { "category": "event"
        , "action": "predictor"
        , "label": "click"
        , "value": "draw"
    }
        , "left-link-team":
    { "category": "event"
        , "action": "predictor"
        , "label": "click"
        , "value": "left team info"
    }
        , "right-link-team":
    { "category": "event"
        , "action": "predictor"
        , "label": "click"
        , "value": "right team info"
    }
        , "say-what-you-think":
    { "category": "event"
        , "action": "predictor"
        , "label": "click"
        , "value": "say what you think"
    }
        , "match-stake":
    { "category": "event"
        , "action": "predictor"
        , "label": "click"
        , "value": "fake coins change"
    }
        , "match-prediction-crowd-home":
    { "category": "event"
        , "action": "predictor"
        , "label": "click"
        , "value": "fake home win"
    }
        , "match-prediction-crowd-draw":
    { "category": "event"
        , "action": "predictor"
        , "label": "click"
        , "value": "fake draw"
    }
        , "match-prediction-crowd-away":
    { "category": "event"
        , "action": "predictor"
        , "label": "click"
        , "value": "fake away win"
    }
        , "match-comment-title":
    { "category": "event"
        , "action": "predictor"
        , "label": "click"
        , "value": "fake comment title"
    }
        , "match-comment-quote":
    { "category": "event"
        , "action": "predictor"
        , "label": "click"
        , "value": "fake comment quote"
    }
        , "match-comment-commenter":
    { "category": "event"
        , "action": "predictor"
        , "label": "click"
        , "value": "fake comment commenter"
    }
        , "match-step2-confirm":
    { "category": "event"
        , "action": "predictor-step2"
        , "label": "click"
        , "value": "confirm"
    }
        , "match-step2-back":
    { "category": "event"
        , "action": "predictor-step2"
        , "label": "click"
        , "value": "back"
    }
        , "match-step2-exact-score":
    { "category": "event"
        , "action": "predictor-step2"
        , "label": "click"
        , "value": "predict exact score"
    }
        , "match-predict-next-game":
    { "category": "event"
        , "action": "predictor-confirmed"
        , "label": "click"
        , "value": "predict next game"
    }
        , "match-team1-decrease":
    { "category": "event"
        , "action": "predictor-step-exact-score"
        , "label": "click"
        , "value": "1-decrease"
    }
        , "match-team1-increase":
    { "category": "event"
        , "action": "predictor-step-exact-score"
        , "label": "click"
        , "value": "1-increase"
    }
        , "match-team2-decrease":
    { "category": "event"
        , "action": "predictor-step-exact-score"
        , "label": "click"
        , "value": "2-decrease"
    }
        , "match-team2-increase":
    { "category": "event"
        , "action": "predictor-step-exact-score"
        , "label": "click"
        , "value": "2-increase"
    }
        , "match-confirm-exact":
    { "category": "event"
        , "action": "predictor-step-exact-score"
        , "label": "click"
        , "value": "confirm"
    }
        , "match-back-exact":
    { "category": "event"
        , "action": "predictor-step-exact-score"
        , "label": "click"
        , "value": "back"
    }
        , "splash-team-picker":
    { "category": "event"
        , "action": "splash_page"
        , "label": "click"
        , "value": "pick a team"
    }
        , "splash-terms-and-conditions":
    { "category": "event"
        , "action": "splash_page"
        , "label": "click"
        , "value": "terms and conditions"
    }
        , "splash-view-news":
    { "category": "event"
        , "action": "splash_page"
        , "label": "click"
        , "value": "view our latest news"
    }
        , "splash-view-league-stats":
    { "category": "event"
        , "action": "splash_page"
        , "label": "click"
        , "value": "view our league stats"
    }
        , "splash-predict-next-match":
    { "category": "event"
        , "action": "splash_page"
        , "label": "click"
        , "value": "predict next match"
    }
        , "splash-view-example-photos":
    { "category": "event"
        , "action": "splash_page"
        , "label": "click"
        , "value": "view example photos"
    }
        , "splash-news-exclusives":
    { "category": "event"
        , "action": "splash_page"
        , "label": "click"
        , "value": "news and exclusives"
    }
        , "splash-stats-and-standings":
    { "category": "event"
        , "action": "splash_page"
        , "label": "click"
        , "value": "stats and standings"
    }
        , "splash-predictions-and-prizes":
    { "category": "event"
        , "action": "splash_page"
        , "label": "click"
        , "value": "predictions and prizes"
    }
        , "splash-photo-and-comments":
    { "category": "event"
        , "action": "splash_page"
        , "label": "click"
        , "value": "photos and comments"
    }
        , "splash-email-register":
    { "category": "event"
        , "action": "normal_registration"
        , "label": "click"
        , "value": "join"
    }
        , "splash-existing-member":
    { "category": "event"
        , "action": "normal_log_in"
        , "label": "click"
        , "value": "go to log in"
    }
        , "splash-facebook-register":
    { "category": "event"
        , "action": "facebook_log_in"
        , "label": "click"
        , "value": "log in"
    }
        , "splash-twitter-register":
    { "category": "event"
        , "action": "twitter_log_in"
        , "label": "click"
        , "value": "log in"
    }
        , "splash-email-kick-off":
    { "category": "event"
        , "action": "normal_registration"
        , "label": "click"
        , "value": "kick off"
    }
        , "splash-social-kick-off":
    { "category": "event"
        , "action": "social_registration"
        , "label": "click"
        , "value": "kick off"
    }
        , "splash-login":
    { "category": "event"
        , "action": "normal_log_in"
        , "label": "click"
        , "value": "log in"
    }
        , "splash-facebook-login":
    { "category": "event"
        , "action": "facebook_log_in"
        , "label": "click"
        , "value": "log in"
    }
        , "splash-twitter-login":
    { "category": "event"
        , "action": "twitter_log_in"
        , "label": "click"
        , "value": "log in"
    }
        , "home-view-all-news":
    { "category": "event"
        , "action": "button_view_all_news"
        , "label": "click"
        , "value": "button_view_all_news"
    }
    }

    module.Send = function(track){
        var analyticEvent = analyticEvents[track]
        ga( 'send',
            analyticEvent.category,
            analyticEvent.action,
            analyticEvent.label,
            analyticEvent.value
        )
    }
    /**
     * Initialise
     */
    module.init = function() {


        $('body').on('click', '[data-track]', function () {
            var attribute = $(this).attr('data-track')
            module.Send(attribute);
        })
    }
    return module
})(window.jQuery)

$(document).ready(function() {
    FanbookzGATracker.init();
})
