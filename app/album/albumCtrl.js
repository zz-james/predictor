FANBOOKZ.album =
{ init: function() {


  }
, view: function(){
    var tempPhotoView = Hogan.compile($('.temp_photo_view').html())
      , $modalPhotoView = $('.modal__photo-view')
      , $modalPhotoSlideshow = $('.modal__photo-slideshow')
      , $albumCarousel = $('.js-album-carousel')
      , $albumId = $('.album__content').data('album')
      , tempAlbumPhoto = Hogan.compile($('.temp_album_photo').html())

    $modalPhotoView.easyModal({
      updateZIndexOnOpen: false, // 19 Jan 2015 -- z-indexes are being set to over 2147483647 which breaks the rendering
      onOpen: function (myModal) {
        $('html,body').css('overflow', 'hidden')
      }, onClose: function (myModal) {
        $('html,body').css('overflow', 'auto')
      }
    })

    $modalPhotoSlideshow.easyModal({
      updateZIndexOnOpen: false, // 19 Jan 2015 -- z-indexes are being set to over 2147483647 which breaks the rendering
      onOpen: function (myModal) {
        $('html,body').css('overflow', 'hidden')
      }, onClose: function (myModal) {
        $('html,body').css('overflow', 'auto')
      }
    })

    $('.js-photo-view').on('click', function () {
      var $elem = $(this)
      ,  url = "/comment/photo-"+ $elem.data('id')
      FANBOOKZ.helpers.getTemplate(url, function(comments) {
        var imgSrc = $elem.data('img')
          , temp = tempPhotoView.render({
              img: imgSrc
            })
        $('.modal__photo-view').html(temp)
        $('.photo-view__comments').html(comments)
        $modalPhotoView.trigger('openModal')
      })
    })

    $('.js-photo-slideshow').on('click', function () {
      $albumCarousel.flexslider({
          animation: 'fade'
        , controlNav: false
        , pausePlay: true
        , pauseText: '<span class="glyphicon glyphicon-pause"></span>'
        , playText: '<span class="glyphicon glyphicon-play"></span>'
        , start: function(){
          $modalPhotoSlideshow.trigger('openModal')
        }
      })
    })

    $('.js-album-photo-add-photo').uploadFile({
      url: '/upload'
    , method: 'POST'
    , multiple: false
    , fileName: 'files[]'
    , showPreview: true
    , showQueueDiv: '.album__list__album'
    , showCancel: false
    , showAbort: false
    , showDone: false
    , showDelete: false
    , dragDropStr: ''
    , onSubmit: function(file){

      }
    , onSuccess: function (files, data, xhr, pd) {
        var orginalData = data

        $.ajax({
          type: 'POST'
        , url: '/en/profile/photos/albums/'+$albumId+'/upload'
        , data: data
        , success: function(data){
            var temp = tempAlbumPhoto.render(orginalData.file)
            $('.js-album-add').before(temp)
            pd.statusbar.hide()
          }
        , error: function (data) {


          }
        })
      }
    , onError: function (files, status, errMsg) {
        // @todo handle errors
      }
    })

    $albumCarousel.flexslider({
        animation: 'fade'
      , controlNav: false
      , pausePlay: true
      , pauseText: '<span class="glyphicon glyphicon-pause"></span>'
      , playText: '<span class="glyphicon glyphicon-play"></span>'
    });


  }

, create: function() {
    var tempAlbumPhoto = Hogan.compile($('.temp_album_photo').html())
      , submittedFiles = []
      , $submitBtn = $('.js-album-submit')

    $('.js-album-photo-add').uploadFile({
      url: '/upload'
    , method: 'POST'
    , multiple: true
    , fileName: 'files[]'
    , showPreview: true
    , showQueueDiv: '.album__list__album'
    , showCancel: false
    , showAbort: false
    , showDone: false
    , showDelete: false
    , dragDropStr: ''
    , onSubmit: function(file){
        // Add file to submittedFiles
        submittedFiles.push(file)
        // make submit btn disable
        $submitBtn.attr('disabled','disabled')
      }
    , onSuccess: function (files, data, xhr, pd) {
        // get index of file
        var index = submittedFiles.indexOf(files[0])
        // Remove files from submittedFiles
        submittedFiles.splice(index, 1)
        // Check if there are files still being submitted
        if(submittedFiles.length === 0){
          $submitBtn.removeAttr('disabled')
        }
        // files, data, xhr
        console.log(data)
        var temp = tempAlbumPhoto.render(data.file)
        $('.js-album-add').before(temp)
        pd.statusbar.hide()
      }
    , onError: function (files, status, errMsg) {
        // @todo handle errors
      }
    })

    $('.album__content').on('click', '.js-album-cover', function(){

      $('.cover_image_id').remove()
      $('.album__list__cover').remove()

      $('.album__photo_image_' + $(this).data('fileId')).after(
        '<div class="album__list__cover"></div>'
      )
      $('#album_name').after(
          '<input type=hidden class="cover_image_id" name="cover_image_id" value="' + $(this).data('fileId') + '">'
          )

    })

    $('.js-album-photo-delete').on('click', function(){

      var fileId = $(this).data('id')
      $.ajax({
        type: "POST",
        url: '/api/delete/photo',
        data: {
          'id' : $(this).data('id')
        },
        success: function (dataCheck) {
          console.log(dataCheck)
          if (dataCheck.success == true) {
              $('[data-id=' + fileId + ']').remove()
          }
        }
      });
    })
  }
}
