/**
 * Currency Formatter - Singleton
 * @param {[type]} options [description]
 * options.locale - [de | en]
 */

var CurrencyFormatter = (function () {
  // Instance stores a reference to the Singleton
  var instance

  function init(options) {

    var hash = {
  	  GBP: {
          symbol: '&pound;xxx'
        , separator: '.'
      }
  	, EUR: {
          symbol: 'xxx&euro;'
        , separator: ','
      }
    }
    , currencyCode = null
    , currencySymbol = null
    , currencySeparator = null

    var setCurrencyCode = function(currencyCode){
      currencyCode = currencyCode
      currencySymbol = currencyCode ? hash[currencyCode].symbol : hash.GBP.symbol
      currencySeparator = currencyCode ? hash[currencyCode].separator : hash.GBP.separator
    }
    var getCurrencyCode = function() {
      return currencyCode
    }

    setCurrencyCode(options.currencyCode)

    return {

      formatAmount: function(amount) {
        var currency = currencyCode ? hash[currencyCode] : hash.GBP

        // amount is always a String. Convert to float first,
        //  then back into string with two decimal places
        var amountFloat = parseFloat(amount)
        var amountFixed = amountFloat.toFixed(2)

      	var afterSignReplaced = currencySymbol.replace('xxx', amountFixed)
        return afterSignReplaced.replace(/\.|,/, currencySeparator)
      },

      setCurrencyCode: setCurrencyCode,
      getCurrencyCode: getCurrencyCode

    }

  }

  return {

    // currency formatter needs to be initialised with the currency code first
    initialiseWithCurrencyCode: function(options) {
      return this.getInstance(options)
    },

    // Get the Singleton instance if one exists
    // or create one if it doesn't
    getInstance: function (options) {

      if ( !instance ) {
        if (!options) {
          throw new Error('You need to set the currency code for the currency formatter first')
        }
        instance = init(options)
      }

      return instance
    }

  };

})()