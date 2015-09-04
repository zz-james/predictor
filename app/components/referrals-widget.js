/* jshint unused: false */
var FanbookzReferrals = (function($) {

  // Module object to be returned
  var module = {}

  /**
   * Initialise
   */

  module.init = function() {

      var referralsTag = $('fbz\\:referrals');

      if(referralsTag.length>0){
          var locale = document.cookie
          $.ajax(
              {
                  url:  '/' + Cookies.get('hl') + '/referrals-widget',
                  context: referralsTag
              }
          ).done(
              function( html ){
                  referralsTag.append(html);
              }
          )

      }

  }

  return module

})(window.jQuery)
