FANBOOKZ.profile = {
    init: function() {
      // controller-wide code
    }
  , view: function() {
      bindProfilePhotoUpload()

      // action-specific code
      $('[name="comment"]').on('submit', function (event) {
        event.preventDefault()
        $.ajax({
          type: 'POST'
        , url: '/comment/create'
        , data: $('[name="comment"]').serialize()
        , dataType: 'json'
        , success: function(data){
          }
        , error: function (data) {
          }
        })
      })

      $('.js-follow').on('click', function (event) {
        event.preventDefault()
        $.ajax({
          type: 'GET'
        , url: $(this).data('url')
        , dataType: 'json'
        , success: function(data){
            if(data.success === true){
              $('.js-follow').addClass('is--hidden')
              $('.js-unfollow').removeClass('is--hidden')
            }
          }
        })
      })
      $('.js-unfollow').on('click', function (event) {
        event.preventDefault()
        $.ajax({
          type: 'GET'
        , url: $(this).data('url')
        , dataType: 'json'
        , success: function(data){
            if(data.success === true){
              $('.js-unfollow').addClass('is--hidden')
              $('.js-follow').removeClass('is--hidden')
            }
          }
        })
      })
    }
  , settings: function() {
      // action-specific code
      bindProfilePhotoUpload()
    }
  , index: function() {
      // action-specific code

    }
  , notifications: function () {
      // action-specific code
    }
  , private: function () {
      // action-specific code
    }
  , upload: function () {
      // action-specific code
    }
  }

function bindProfilePhotoUpload(){

  $('.js-fileupload-profile-bg').each(function(){
    var $elem = $(this)
      , inputName = $elem.data('inputname')

    // post images
    $elem.uploadFile({
      url: '/upload'
      , method: 'POST'
      , multiple: false
      , fileName: 'files[]'
      , onSuccess: function (files, data) {
        // files, data, xhr
        console.log(data)

        $.ajax({
          type: 'POST'
          , url: '/profile/add-background-image'
          , data: data
          , dataType: 'json'
          , success: function(data){
            console.log(data)
            if (data.photo) {
              location.reload();
            }
          }
          , error: function (data) {
          }
        })
      }
      , onError: function (files, status, errMsg) {
        // console.log(files, status, errMsg)
        // @todo handle errors
      }
    })
  })


  $('.js-fileupload-profile-picture').each(function(){
    var $elem = $(this)

    // post images
    $elem.uploadFile({
      url: '/upload'
      , method: 'POST'
      , multiple: false
      , fileName: 'files[]'
      , onSuccess: function (files, data) {
        // files, data, xhr
        $.ajax({
          type: 'POST'
          , url: '/profile/add-profile-picture'
          , data: data
          , dataType: 'json'
          , success: function(data){
            if (data.photo) {
              $('.profile__user__avatar').attr('src', data.photo.cached)
            }
          }
          , error: function (data) {
          }
        })
      }
      , onError: function (files, status, errMsg) {
        // console.log(files, status, errMsg)
        // @todo handle errors
      }
    })
  })
}