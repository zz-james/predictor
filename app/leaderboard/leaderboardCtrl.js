FANBOOKZ.leaderboard = {
    init: function() {

    }
  , view: function() {
      // Own user sticky
      var ownUsers = $('.js-leaderboard__own-user')

      for (var i = ownUsers.length - 1; i >= 0; i--) {
        // console.log( ownUsers[i] )
        var stickyUser = new StickyUser({
          el: $(ownUsers[i])
        })
      }

      

      // var stickyUser = new StickyUser({
      //   el: $(ownUsers[2])
      // })
      // console.log( $(ownUsers[2]).prev('h2') )
    }
  }
