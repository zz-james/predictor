//==============================================================================
// Anchors
//==============================================================================

function scrollToClass(className){
  var aTag = $(className)
  $('html,body').animate({scrollTop: aTag.offset().top})
}


//==============================================================================
// Links
//==============================================================================

$('a.js-disable-link').click(function(e){
  e.preventDefault()
})

$('a.js-prevent-bubbling').click(function(e){
  e.stopPropagation()
})


//==============================================================================
// Forms
//==============================================================================

// Textarea - autosubmit
// Using event delegation for dynamically created elements
$(document).on('keypress', 'textarea.js-textarea-auto-submit', function(e) {
  if(e && e.keyCode == 13){
    e.preventDefault()
    $(this).parents('form').submit()
    return false
  }
})

// Textarea - AutoGrow
$.fn.autoGrow = function(){

  $.fn.autoGrow.resize = function($elem, autoGrowTextareaOffset) {
    $elem.style.height = 'auto'
    if( $($elem).hasClass('.textarea--with-photo') ) autoGrowTextareaOffset = autoGrowTextareaOffset + 84
    $elem.style.height = ($elem.scrollHeight + autoGrowTextareaOffset ) + 'px'
  }

  return this.each(function(){
    var $elem = this
    var autoGrowTextareaOffset = !window.opera ? ($elem.offsetHeight - $elem.clientHeight) : ($elem.offsetHeight + parseInt(window.getComputedStyle($elem, null).getPropertyValue('border-top-width')))

    $elem.addEventListener && $elem.addEventListener('input', function(event) {
      $.fn.autoGrow.resize($elem, autoGrowTextareaOffset)
    })

    $elem['attachEvent'] && $elem.attachEvent('onkeyup', function() {
      $.fn.autoGrow.resize($elem, autoGrowTextareaOffset)
    })
  })
}

$('textarea.js-textarea-auto-grow').autoGrow()

//==============================================================================
// Check URL parameters in JS
//==============================================================================

function getUrlParameter(sParam)
{
  var sPageURL = window.location.search.substring(1);
  var sURLVariables = sPageURL.split('&');
  for (var i = 0; i < sURLVariables.length; i++)
  {
    var sParameterName = sURLVariables[i].split('=');
    if (sParameterName[0] == sParam)
    {
      return sParameterName[1];
    }
  }
}

function removeParameter(url, parameter)
{
  var fragment = url.split('#');
  var urlparts= fragment[0].split('?');

  if (urlparts.length>=2)
  {
    var urlBase=urlparts.shift(); //get first part, and remove from array
    var queryString=urlparts.join("?"); //join it back up

    var prefix = encodeURIComponent(parameter)+'=';
    var pars = queryString.split(/[&;]/g);
    for (var i= pars.length; i-->0;) {               //reverse iteration as may be destructive
      if (pars[i].lastIndexOf(prefix, 0)!==-1) {   //idiom for string.startsWith
        pars.splice(i, 1);
      }
    }
    url = urlBase+'?'+pars.join('&');
    if (fragment[1]) {
      url += "#" + fragment[1];
    }
  }
  return url;
}

