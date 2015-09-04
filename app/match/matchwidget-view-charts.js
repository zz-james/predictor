/**
 * Render charts on live and fulltime match info view
 * Used as a helper
 * @param  {jQuery object} element - the parent DOM element controlled
 * @param  {object} options object ...
 */
ChartsView = function(element, options) {
  this.$el = element
  var scope=this
      ,model        = options.model

  this.initialise = function() {
    scope.$el.on('click', '.js-match-live-tab--match-info', function(){
      if(typeof(model.score.stats)!=='undefined'){
        setTimeout(function () {
          // delay the rendering before the tab renders
          // tODO this is a temp solution, perhaps this should reneder when the tab is trully rendered
          scope.renderCharts(model.score.stats)
        }, 1000)
      }
    })

    $(window).resize(function(){
      if(typeof(model.score.stats)!=='undefined'){
        scope.renderCharts(model.score.stats)
      }
    })

    return this
  }

  /**
   * renderCharts updates the content of the live tab
   * @param  {object} statsData stats that come from server on getmatchdata
   */
  this.renderCharts = function (statsData) {

    // check if the vis library is avaialable
    // if not, try again in 1s
    if (typeof google === 'undefined' ||
        typeof google.visualization === 'undefined' ||
        typeof google.visualization.arrayToDataTable === 'undefined') {
        setTimeout(function () {
          scope.renderCharts(statsData)
        }, 1000)
        return false
    }
    // bail on this if no stats
    if(!statsData) { return }

    // If values dont exist set to defaults
    if (!statsData.home.possession_percentage ) {
      statsData.home.possession_percentage = 50
      scope.$el.find( '.match-view__live__match-info__possession--home .match-view__live__match-info__possession__percent--number' ).text( 50 );
    }
    if (!statsData.away.possession_percentage ) {
      statsData.away.possession_percentage = 50
      scope.$el.find( '.match-view__live__match-info__possession--away .match-view__live__match-info__possession__percent--number' ).text( 50 );
    }
    if (!statsData.home.total_scoring_att ) {
      statsData.home.total_scoring_att = 0
      scope.$el.find( '.js-match-view__live__match-info__attack__scoring--total--home' ).text( 0 );
    }
    if (!statsData.away.total_scoring_att ) {
      statsData.away.total_scoring_att = 0
      scope.$el.find( '.js-match-view__live__match-info__attack__scoring--total--away' ).text( 0 );
    }
    if (!statsData.home.ontarget_scoring_att ) {
      statsData.home.ontarget_scoring_att = 0
      scope.$el.find( '.js-match-view__live__match-info__attack__scoring--att--home' ).text( 0 );
    }
    if (!statsData.away.ontarget_scoring_att ) {
      statsData.away.ontarget_scoring_att = 0
      scope.$el.find( '.js-match-view__live__match-info__attack__scoring--att--away' ).text( 0 );
    }
    if (!statsData.home.won_corners ) {
      statsData.home.won_corners = 0
      scope.$el.find( '.js-match-view__live__match-info__attack__corners--home' ).text( 0 );
    }
    if (!statsData.away.won_corners ) {
      statsData.away.won_corners = 0
      scope.$el.find( '.js-match-view__live__match-info__attack__corners--away' ).text( 0 );
    }
    if (!statsData.home.fk_foul_won ) {
      statsData.home.fk_foul_won = 0
      scope.$el.find( '.js-match-view__live__match-info__attack__fouls--home' ).text( 0 );
    }
    if (!statsData.away.fk_foul_won ) {
      statsData.away.fk_foul_won = 0
      scope.$el.find( '.js-match-view__live__match-info__attack__fouls--away' ).text( 0 );
    }

    // If home and away are not there set graph to 1 so it displays
    if ( !statsData.home.total_scoring_att && !statsData.away.total_scoring_att ) {
      statsData.home.total_scoring_att = 1
      statsData.away.total_scoring_att = 1
    }
    if ( !statsData.home.ontarget_scoring_att && !statsData.away.ontarget_scoring_att ) {
      statsData.home.ontarget_scoring_att = 1
      statsData.away.ontarget_scoring_att = 1
    }
    if ( !statsData.home.won_corners && !statsData.away.won_corners ) {
      statsData.home.won_corners = 1
      statsData.away.won_corners = 1
    }
    if (!statsData.home.fk_foul_won && !statsData.away.fk_foul_won ) {
      statsData.home.fk_foul_won = 1
      statsData.away.fk_foul_won = 1
    }

    // If no shirt colour set greys
    if ( !statsData.home.colour_red ) {
      statsData.home.colour_red = 180
      statsData.home.colour_green = 180
      statsData.home.colour_blue = 180
    }
    if ( !statsData.away.colour_red ) {
      statsData.away.colour_red = 190
      statsData.away.colour_green = 190
      statsData.away.colour_blue = 190
    }

    var dataPossession = google.visualization.arrayToDataTable([
      ['Possession', 'Percentage'],
      ['Away team', statsData.away.possession_percentage],
      ['Home team', statsData.home.possession_percentage]
    ])
      , optionsPossession = {
      pieHole: 0.6,
      legend: 'none',
      pieSliceText: 'none',
      pieStartAngle: 45,
      backgroundColor: {fill:'#f7f7f5', stroke: '#f7f7f5', strokeWidth: '3'},
      tooltip: { trigger: 'none' },
      enableInteractivity: false,
      animation: { duration: 3000, easing: 'inAndOut' },
      chartArea:{left:0,top:0,width:'100%',height:'100%'},
      colors: [
        'rgb(' + statsData.away.colour_red + ',' + statsData.away.colour_green + ',' + statsData.away.colour_blue + ')',
        'rgb(' + statsData.home.colour_red + ',' + statsData.home.colour_green + ',' + statsData.home.colour_blue + ')'
        ],
      slices: {
        0: {offset: 0.01},
        1: {offset: 0.01}
      }
    }
      , dataShotsTotal = google.visualization.arrayToDataTable([
      ['', 'Home team', 'Away Team' ],
      ['Shots Total', statsData.home.total_scoring_att, statsData.away.total_scoring_att]
    ])
      , dataShotsTarget = google.visualization.arrayToDataTable([
      ['', 'Home team', 'Away Team' ],
      ['Shots on target' , statsData.home.ontarget_scoring_att , statsData.away.ontarget_scoring_att]
    ])
      , dataCorners = google.visualization.arrayToDataTable([
      ['', 'Home team', 'Away Team' ],
      ['Corners', statsData.home.won_corners, statsData.away.won_corners]
    ])
      , dataFouls = google.visualization.arrayToDataTable([
      ['', 'Home team', 'Away Team' ],
      ['Fouls', statsData.away.fk_foul_won, statsData.home.fk_foul_won]
    ])
      , optionsMatchStats = {
      legend: 'none',
      height: 20,
      isStacked: true,
      chartArea:{ left:0, top:0, width:'100%', height:'100%' },
      vAxis:{ textPosition: 'none' },
      tooltip:{ trigger: 'none' },
      enableInteractivity: false,
      animation: { duration: 3000, easing: 'inAndOut' },
      backgroundColor: {
        fill:'#f7f7f5',
        stroke: '#f7f7f5'
      },
      hAxis: {
        viewWindowMode: 'maximized',
        baselineColor: '#f7f7f5',
        gridlineColor: '#f7f7f5'
      },
      colors: [
        'rgb(' + statsData.home.colour_red + ',' + statsData.home.colour_green + ',' + statsData.home.colour_blue + ')',
        'rgb(' + statsData.away.colour_red + ',' + statsData.away.colour_green + ',' + statsData.away.colour_blue + ')'
        ]
    }

    var chartPossession = new google.visualization.PieChart(
      scope.$el.find('.js-match-view__live__match-info__chart__possession')[0]
    )
      , chartShotsTotal = new google.visualization.BarChart(
      scope.$el.find('.js-match-view__live__match-info__chart__shots_total')[0]
    )
      , chartShotsTarget = new google.visualization.BarChart(
      scope.$el.find('.js-match-view__live__match-info__chart__shots_target')[0]
    )
      , chartCorners = new google.visualization.BarChart(
      scope.$el.find('.js-match-view__live__match-info__chart__corners')[0]
    )
      , chartFouls = new google.visualization.BarChart(
      scope.$el.find('.js-match-view__live__match-info__chart__fouls')[0]
    )

    chartPossession.draw(dataPossession, optionsPossession)
    chartShotsTotal.draw(dataShotsTotal, optionsMatchStats)

    chartShotsTarget.draw(dataShotsTarget, optionsMatchStats)
    chartCorners.draw(dataCorners, optionsMatchStats)
    chartFouls.draw(dataFouls, optionsMatchStats)
  }  // end renderCharts

  return this

}

