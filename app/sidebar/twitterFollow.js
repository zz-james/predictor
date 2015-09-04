/* jshint unused: false */
var FanbookzTwitterFollow = (function($) {

	var twitterBtn = $('.recommended-users__follow > a')

	  $(twitterBtn).click(function(e){
	    e.preventDefault()
	    $(this).addClass('followed')
	    $(this).html('Following')
	  })

  })

  FanbookzTwitterFollow()
