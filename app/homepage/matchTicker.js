//==============================================================================
// Match ticker
//==============================================================================
var matchTicker = {
  // Variables
  fixtureTemp: Hogan.compile( $('.temp_fixture_ticker').html() )
  , leagueTemp: Hogan.compile( '<li class="js-match-ticker__change-league" data-league="{{league}}">{{ league }}</li>' )
  , matchData: undefined
  , leagues: undefined
  , currentLeagueTitle: undefined
  , currentLeague: undefined
  , scope: this
  , fixturesWidth: undefined
  , minUpdateSpeed: 30000
  , updateSpeed: 30000
  , nextMatchIn: undefined
  , matchCount: undefined
  // Elements
  , $matchTicker: $('.js-match-ticker')
  , $fixtures: $('.js-match-ticker__fixtures')
  // Functions
  , initialize: function() {
    var scope = this
    this.getMatchData(function (content) {
      scope.matchData = content

      if(typeof scope.matchData === 'object' && Object.keys(scope.matchData).length > 0 && !('next_match' in scope.matchData) ){

        scope.buildTicker()

      }
        if('next_match' in scope.matchData){
            scope.setUpdateSpeed(scope.matchData['next_match'])
        }
    })

    this.bindLeagueChangeEvent()

    // Update every minute
    setTimeout(function(){
      this.updateMatchData()
    }.bind(this), this.updateSpeed)
  }
  , buildTicker:function(){

        var scope = this

        scope.leagues = Object.keys(scope.matchData)

        scope.currentLeagueTitle = scope.leagues[0]

        scope.currentLeague = scope.matchData[scope.currentLeagueTitle]
        if(scope.matchData){

            $('.match-ticker').show()
            scope.buildLeagueDropdown()
            scope.buildFixtures()
        }
    }

  , setUpdateSpeed:function(nextMatch){
        var scope = this
        if(nextMatch>120000){
            scope.updateSpeed = 120000
        } else {
            scope.updateSpeed = scope.minUpdateSpeed
        }
    }
  , getMatchData: function (callback) {
    var scope = this
    $.ajax({
      url: '/live/matches'
    }).done(function(content) {
      if (callback && typeof(callback) === 'function') callback(content)
    })
  }
  , updateMatchData: function () {
    var scope = this
    scope.getMatchData(function(content){

      if(content !== false){

          if('next_match' in content){
              $('.match-ticker').hide()
              scope.setUpdateSpeed(content.next_match)
          }else{
              scope.setUpdateSpeed(scope.minUpdateSpeed)
              scope.nextMatchIn = 'undefined';
              scope.matchData = content

              if(scope.leagues === undefined)
              {
                  scope.buildTicker()
              }

              scope.currentLeague = scope.matchData[scope.currentLeagueTitle]
              scope.buildFixtures()
          }
      }
    })
    setTimeout(function(){
      this.updateMatchData()
    }.bind(this), this.updateSpeed)
  }
  , buildLeagueDropdown: function () {
    var container = $('.js-match-ticker__leagues')
      , scope = this
    _.forEach(this.leagues, function (league) {
      var temp = scope.leagueTemp.render({league: league})
      container.append(temp)
    })

    $('.js-match-ticker__current-league').text(scope.currentLeagueTitle)

    // disable dropdown if only live games in one league
    if (this.leagues.length <= 1) {
      $('.match-ticker__dropdown .fb-icon-chevron-down').removeClass('fb-icon-chevron-down')
    }

  }
  , bindLeagueChangeEvent: function () {
    var scope = this
    $('body').on('click', '.js-match-ticker__change-league', function (e) {
      var $elem = $(this)
        , leagueName = $elem.text()

      $('.js-match-ticker__current-league').text(leagueName)
      scope.changeLeague(leagueName)
      scope.currentLeagueTitle = leagueName
    })
  }
  , changeLeague: function (leagueName) {
    this.currentLeague = this.matchData[leagueName]

    // reset fixtures
    this.$fixtures.stop(true, false)
      .css('border-spacing', 0 )

    if(this.shouldAnimate()){
      this.$fixtures
        .css('transform', '')
    }

    this.buildFixtures()
  }
  , buildFixtures: function () {
    this.$fixtures.html('')
    // build fixtures from current league
    var scope = this
    // update match count

    if(typeof this.currentLeague !== 'undefined'){
        this.matchCount = this.currentLeague.length
        // loop through current league fixtures and append to $fixtures
        _.forEach(this.currentLeague, function (match) {
            var temp = scope.fixtureTemp.render(match)
            scope.$fixtures.append(temp)
        })
    }

    // calculate width of fixtures
    scope.fixturesWidth = scope.calculateFixturesWidth()
    if(scope.shouldAnimate()){
      // update width to fit all
      if(typeof scope.$fixtures[0] !== 'undefined'){
        var html = scope.$fixtures[0].innerHTML
        scope.$fixtures.append(html)
        // Add on 10px to ensure the fixtures don't wrap
        scope.$fixtures.width((scope.fixturesWidth * 2) + 10)
        // start animation
        scope.startAnimation()
      }
    }
  }
  , startAnimation: function () {
    var scope = this
    if(this.shouldAnimate()){
      // Define animation
      // distance = speed × time
      // speed = distance ÷ time
      // time = distance / speed

      // Speed up a little on mobile
      var speed = ($(window).width() > 768) ? 0.035 : 0.05
      var distance = scope.fixturesWidth
        , duration = distance / speed

      // is $fixtures partially animated
      if(this.returnZAxis() !== 0){
        // if not zero work our duration/time to use
        // for animation which take current place into consideration
        var newDistance = scope.fixturesWidth + this.returnZAxis()
        var newDuration = newDistance / speed
      }

      this.$fixtures.stop(true, false).animate(
        { borderSpacing: scope.fixturesWidth
        }
        , { duration: (this.returnZAxis() === 0) ? duration : newDuration
          , step: function (now, fx) {
            scope.$fixtures.css('transform','translate3d(-' + now + 'px, 0, 0)')
            scope.$fixtures.css('transform','translate(-' + now + 'px, 0)')
          }
          , complete: function () {
            scope.$fixtures
              .css('transform', 'translate3d(0px, 0, 0)')
              .css('transform', 'translate(0px, 0)')
              .css('border-spacing', '0')
            scope.startAnimation()
          }
          , easing: 'linear'
        }
      )
    }
  }

  , shouldAnimate: function () {
    var fixturesAreWider = false
    // We don't need to animate if just one match
    if (this.matchCount > 1) {
      // check if fixtures are wider than container width
      var containerWidth = $('.match-ticker .container').width()
        , fixturesAreWider = this.fixturesWidth > (containerWidth - 240)
    }
    // Add class to DOM for styling fixtures around dropdown btn
    if(fixturesAreWider){
      this.$matchTicker.addClass('is-animating')
      this.bindHoverEvents()
    } else {
      this.$matchTicker.removeClass('is-animating')
    }

    return fixturesAreWider
  }
  , calculateFixturesWidth: function () {
    // work out width to hold all fixtures
    var fixturesWidth = 0

    this.$fixtures.find('.fixture').each(function () {
      fixturesWidth = fixturesWidth + $(this).outerWidth(true)
    })

    return fixturesWidth
  }
  , stopAnimation: function () {
    if (this.shouldAnimate(true)){
      this.$fixtures.stop(true, false)
          .css('transform', 'translate3d(' + this.returnZAxis() + ', 0, 0)')
          .css('transform', 'translate(' + this.returnZAxis() + ', 0)')
          .css('border-spacing', this.returnZAxis() )
    }
  }
  , bindHoverEvents: function () {
    var scope = this
    this.$fixtures.on('mouseenter', function () {
      scope.stopAnimation()
    })
    this.$fixtures.on('mouseleave', function () {
      scope.startAnimation()
    })
  }
  , returnZAxis: function () {
    var currentCssPos = this.$fixtures.css('transform')
      , modified = currentCssPos.replace(/^\w+\(/,"[").replace(/\)$/,"]")
      , array = JSON.parse(modified)
    return array[4]
  }
}
