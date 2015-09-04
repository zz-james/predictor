/* jshint unused: false */
var FanbookzVirtualEconomyCommerce = (function($) {

    /**
     * @todo Hide purchase buttons until we have our javascript loaded?
     */

    // Our module object to be returned
    var module = {

        // Initialised?
        initialised: 0,

        // Logo for pop-up - not currently used
        imageForStripeCheckout: null, //'http://fanbookz.com/static/images/logo2.png',

        // The *public*, *publishable* API key - not the secret API key.
        stripePublishableKey: null,

        // The current user’s email address
        userEmail: null,

        // Form selector
        formSelector: 'form[name^="fanbookz_virtual_economy_commerce_purchase"]',

        // Purchase form
        $form: null,

        // Selected product info
        selectedProduct: {
            name: null,
            currency: null,
            priceInSmallestUnit: null,
            prettyPrice: null,
            virtualCurrencyAmount: null
        }
    };

    /**
     * Initialise
     */
    module.init = function() {

        // Only initialise once
        if (module.initialised++) {
            return;
        }

        // Retrieve API key from global stripePublishableKey
        module.stripePublishableKey = typeof stripePublishableKey === 'undefined' ? '' : stripePublishableKey;

        // Retrieve userEmail from global userEmail
        module.userEmail = typeof userEmail === 'undefined' ? '' : userEmail;

        if (!module.stripePublishableKey) {
            throw new Error('Stripe Publishable Key required for checkout');
        }

        if (!module.userEmail) {
            throw new Error('User’s email address is not set');
        }

        // Find the purchase form
        module.$form = $(module.formSelector);

        // If we haven’t got this form on the page, stop here
        if (!module.$form.length) {
            return;
        }

        // Ensure we have StripeCheckout before continuing
        module.loadStripeCheckout().then(function() {

            // Initialise the Stripe popup
            module.setupStripeCheckoutHandler();

            // Attach click handlers
            module.attachClickHandlers();

        }).fail(function() {
            console.error('Unable to load Stripe library');
        });
    };

    /**
     * Load the Stripe Checkout library if it doesn’t already exist
     */
    module.loadStripeCheckout = function() {

        // If we already have StripeCheckout, return a resolved promise to
        // continue immediately
        if (typeof StripeCheckout !== 'undefined') {
            return $.Deferred().resolve().promise();
        }

        // Request and execute the script from Stripe, and return the promise
        return $.ajax({
            url: 'https://checkout.stripe.com/checkout.js',
            dataType: 'script',
            cache: true
        });
    };

    /**
     * Setup the Stripe Checkout pop-up
     */
    module.setupStripeCheckoutHandler = function() {

        // Config options for the Stripe pop-up
        module.stripeCheckoutHandler = StripeCheckout.configure({

            // Our publishable API key
            key: module.stripePublishableKey,

            // The image for display on the pop-up
            image: module.imageForStripeCheckout,

            // Disable Stripe’s ‘Remember Me’ option
            allowRememberMe: false,

            // Add a handler to receive the token once the card has been
            // validated by Stripe
            token: function(newCardToken) {

                // Put the token into our hidden field
                module.$form.find('[name$="[stripeNewCardToken]"]').val(newCardToken.id);

                // And submit the form
                module.submitForm(function() {
                    document.location.reload();
                }, function(errorText) {
                    alert(errorText);
                });
            }
        });
    };

    /**
     * Attach click handlers
     */
    module.attachClickHandlers = function() {

        // Attach handler for paying with a new card
        module.$form.on('click', '[data-pay-with-new-card]', function(evt) {

            // Don’t follow the link
            evt.preventDefault();

             // @todo Find a nicer way of selected the radio button manually
            $(this).parents('li.product-picker__product').find('input[name$="[product]"]').prop('checked',true);

            // Retrieve info about the selected product
            module.retrieveSelectedProductInfo();

            // Open the Stripe pop-up
            module.stripeCheckoutHandler.open({
                name: 'Buy ' + module.selectedProduct.name,
                description: null,
                amount: module.selectedProduct.priceInSmallestUnit,
                currency: module.selectedProduct.currency,
                email: module.userEmail
            });
        });

        // Attach handler for paying with a saved card
        module.$form.on('click', '[data-pay-with-saved-card]', function(evt) {

            // Don’t follow the link
            evt.preventDefault();

            // @todo Find a nicer way of selected the radio button manually
            $(this).parents('li.product-picker__product').find('input[name$="[product]"]').prop('checked',true);

            // Retrieve info about the selected product
            module.retrieveSelectedProductInfo();

            // @todo Style the confirmation pop-up, similar to the Stripe one?
            if (confirm(
                'You’re about to buy ' + module.selectedProduct.name
                + ' for ' + module.selectedProduct.prettyPrice
                + '\n\nContinue?'
            )) {
                module.submitForm(function() {
                    document.location.reload();
                }, function(errorText) {
                    alert(errorText);
                });
            }
        });
    };

    /**
     * Retrieve data about the currently-selected product, and store it under
     * module.selectedProduct
     */
    module.retrieveSelectedProductInfo = function() {
        var $selectedProduct = module.$form.find('[name$="[product]"]:checked')
            .closest('.product-picker__product');

        // Stop if we haven’t got a selected product
        if (!$selectedProduct.length) {
            return;
        }

        // Grab info from the data attributes
        module.selectedProduct.name                  = $selectedProduct.data('product-name');
        module.selectedProduct.currency              = $selectedProduct.data('product-currency');
        module.selectedProduct.priceInSmallestUnit   = $selectedProduct.data('product-price-in-smallest-unit');
        module.selectedProduct.prettyPrice           = $selectedProduct.data('product-pretty-price');
        module.selectedProduct.virtualCurrencyAmount = $selectedProduct.data('product-virtual-currency-amount');
    };

    /**
     * Submit the purchase form and trigger success or error handlers
     */
    module.submitForm = function(onSuccess, onError) {
        var opts = {
            type: module.$form.attr('method').toUpperCase(),
            url: module.$form.attr('action'),
            data: module.$form.serialize(),
            success: function() {
                onSuccess();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                if (typeof jqXHR.responseJSON.error !== 'undefined') {
                    onError(jqXHR.responseJSON.error);
                }
            }
        };

        $.ajax(opts);
    };

    return module;

})(window.jQuery);
