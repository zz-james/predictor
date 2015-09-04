/**
 * Event Dispatcher - Hub, Singleton
 * @param {[type]} options [description]
 */
EventDispatcher = (function(options) {
  // Instance stores a reference to the Singleton
  var instance


  function init(options, that) {

  	var self = observable(that)

  	return self

  }

  return {

    // Get the Singleton instance if one exists
    // or create one if it doesn't
    getInstance: function (options) {

      if ( !instance ) {
        instance = init(options, this)
      }

      return instance
    }

  }



})()
