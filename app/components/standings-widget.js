/* jshint unused: false */
var FanbookzStandingsWidget = (function($) {
  var Widget = function () {}

  Widget.prototype = {
    init: function () {
      this.$todaysFixtures = $('.todays-fixtures')
      this.$standingsWidget = $('.js-standings_widget')
      this.$homepageTodaysFixtures = $('.homepage__todays_fixtures')
      this.$liveFixturesCurrentLeague = $('.js-live-fixtures__current-league')
      this.$liveFixturesCurrentLeagueName = $('.js-live-fixtures__current-league-name')
      this.arrowDownMarkup = '<span class="fb-icon fb-icon-chevron-down"></span>'
      this.preloaderMarkup = '<div class="preloader"></div>'
      this.noDataClassName = 'no-data'
      this.competitonFixturesClass = '.js-competition-fixtures'
      this.noFixturesAvailableText = 'No fixtures available'
      this.competitionDataAttribute = 'data-competition'
      this.checkFixturesInterval = 30000

      if (this.hasFixtures()) {
        this.checkFixtures()
      }

      this.bindEvents()
    }
    , getCompetitionStandings: function (competitionId) {
      var self = this
      $.ajax({
        url: paths.standings + '/' + competitionId
        , success: function(response) {
          self.$standingsWidget.html(response)
          self.$standingsWidget.removeClass(self.noDataClassName)
        }
        , error: function(response) {
          self.$standingsWidget.addClass(self.noDataClassName)
        }
      })
    }
    , getMatchFixtures: function (competitionId) {
      var self = this

      this.updadateCompetitionForFixtures(competitionId)

      $.ajax({
        url: paths.matchFixtures+'/' + competitionId
        , success: function(response) {
          self.$homepageTodaysFixtures.html(response)
        }
        , error: function(response) {
          self.$homepageTodaysFixtures.html(self.noFixturesAvailableText)
        }
      })
    }
    , updateDrodpown: function (competitionName) {
        this.$homepageTodaysFixtures.html(this.preloaderMarkup)
        this.$liveFixturesCurrentLeague.append(this.arrowDownMarkup)
        if (this.hasCurrentLeagueNameElement()) {
          this.$liveFixturesCurrentLeagueName.text(competitionName)
        } else {
          this.$liveFixturesCurrentLeague.text(competitionName)
        }
    }
    , updadateCompetitionForFixtures: function (competitionId) {
      this.$homepageTodaysFixtures.attr(this.competitionDataAttribute, competitionId)
    }
    , checkFixtures: function () {
      var self = this
      setInterval(function () {
        self.getMatchFixtures(
          self.$homepageTodaysFixtures.attr(self.competitionDataAttribute)
        )
      }
      , this.checkFixturesInterval)
    }
    , hasStandings: function () {
      return this.$standingsWidget.length
    }
    , hasFixtures: function () {
      return this.$homepageTodaysFixtures.length
    }
    , hasCurrentLeagueNameElement: function () {
      return this.$liveFixturesCurrentLeagueName.length
    }
    , bindEvents: function () {
      var self = this

      this.$todaysFixtures.on('click', this.competitonFixturesClass, function (e) {
        var $elem = $(this)
          , competitionName = $elem.text()
          , competitionId = $elem.attr(self.competitionDataAttribute)

        self.updateDrodpown(competitionName);

        if (self.hasStandings()) {
          self.getCompetitionStandings(competitionId)
        }

        if (self.hasFixtures()) {
          self.getMatchFixtures(competitionId)
        }
      })
    }
  }

  var module = {
    init: function() {
      var widget = new Widget()
      widget.init()
    }
  }

  return module
})(window.jQuery)
