function remoteSearch(text, cb) {
    var URL = WEB_ROOT + '/usuarios/busca';
    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          var data = JSON.parse(xhr.responseText);
          cb(data);
        } else if (xhr.status === 403) {
          cb([]);
        }
      }
    };
    xhr.open("GET", URL + "?q=" + text, true);
    xhr.send();
  }
  
  var tribute = new Tribute({
    values: function (text, cb) {
          remoteSearch(text, users => cb(users));
      },
    selectTemplate: function(item) {
      if (typeof item === "undefined")
          return null;
  
      if (this.range.isContentEditable(this.current.element)) {
        return (
            '<span contenteditable="false" data-user-id="' + item.original.id + '">'+
              '@' + item.original.key +
              '</span>'
        );
      }
  
      return "@" + item.original.key;
    },
    menuItemTemplate: function (item) {
    return '<div class="d-flex">'+
          '<img src="'+item.original.photo + '" class="mr-2 avatar">' +
          '<div class="">'+
              '<p>' + item.original.value + '</p>' +
              '<p class="text-gray	">' + item.string + '</p>' +
          '</div>' +
        '</div>';
      },
      noMatchTemplate : function() {
          return '<li>Nenhum usuário encontrado!</li>';
      },
        requireLeadingSpace: false,
        menuShowMinLength: 3
    });
  
  var answerBox = function(promotionID, ratingId, postId, commentID, url) {
  
      if($(".form-resposta").length)
          $(".form-resposta").remove();
  
      if(typeof url == "undefined") {
          url = "/comentarios/enviar";
      }
  
      var b = '<div class="form-resposta comment" data-url="' + url + '">' +
                  '<p class="comment-header">' +
                      '<a href="javascript: void(0);">' +
                          '<image class="rounded-circle" src="' + ((typeof USER_PHOTO != "undefined") ? USER_PHOTO : '/img/user_default.png') + '" />' +
                          '<span> ' + ((typeof USER_NAME != "undefined") ? USER_NAME : 'Visitante') + '</span>' +
                      '</a>' +
                  '</p>' +
                  '<form method="post" action="">' +
                      '<textarea class="tribute-textarea" placeholder="Digite o seu comentário."></textarea>' +
  
                      ((typeof ratingId != "undefined" && ratingId != null) ? '<input type="hidden" value="' + ratingId + '" name="rating_id" />' :'') +
                      ((typeof postId != "undefined" && postId != null) ? '<input type="hidden" value="' + postId + '" name="post_id" />' :'') +
                      ((typeof promotionID != "undefined" && promotionID != null) ? '<input type="hidden" value="' + promotionID + '" name="promotion_id" />' :'') +
                      ((typeof commentID != "undefined" && commentID != null) ? '<input type="hidden" value="' + commentID + '" name="comment_id" />' :  '') +
  
                      '<div class="comment-control">' +
                          '<a href="#" class="cancel-coments">cancelar</a>' +
                          '<input type="submit" class="btn-sm ml-2 btn-blue" value="comentar" />' +
                      '</div>' +
                  '</form>' +
              '</div>';
  
      return b;
  }
  
  var answerBoxAdded = function() {
      var textarea = $('.form-resposta .tribute-textarea');
      tribute.attach(textarea.get(0));
  
    textarea.textareaAutoSize();
  
    textarea.get(0)
        .addEventListener("tribute-replaced", function(e) {
          console.log(
            "Original event that triggered text replacement:",
            e.detail.event
          );
          console.log("Matched item:", e.detail.item);
        });
  }
  
  $(function() {
      $(document).on('click', '.edit-comment', function(e) {
          e.preventDefault();
  
          if($('.form-resposta').length > 0) $('.form-resposta').remove();
  
            var commentId = $(this).data('commentId');
            var comment = $(this).parent().parent().parent().find('.comment-content p:first');
  
              $.get(WEB_ROOT + '/comentarios/editar/' + commentId, function(description) {
  
                var b = '<div class="form-resposta" data-url="/comentarios/editar/' + commentId + '">' +
                      '<form method="post" action="">' +
                          '<textarea class="tribute-textarea" placeholder="Digite o seu comentário.">' + $.trim(description) + '</textarea>' +
                          '<div class="comment-control text-right mt-2">' +
                              '<a href="#" class="cancel-coments">cancelar</a>' +
                              '<input type="submit" class="btn-sm ml-2 btn-blue" value="atualizar" />' +
                          '</div>' +
                      '</form>' +
                  '</div>';
  
                  comment.html(b);
  
                  answerBoxAdded();
              });
  
      });
  
      $(document).on('click', '.like', function(e) {
          e.preventDefault();
  
          var $this = $(this);
  
          if(!USER_LOGGED) {
  
              new Fancybox(
          [{
            type: 'ajax',
            src: 'usuario-deslogado'
          }],
          {
            mainClass: "fancybox-gatry fancybox-gatry-share"
          });
  
              return;
          }
  
          $.post(WEB_ROOT + '/comentarios/curtir', { comment_id : $this.data('commentId')}, function(r) {
  
              if(r.success) {
                  var number = Number($this.html().replace('+', '').trim()) + 1;
                  $this.html("+ " + number);
                  return;
              }
  
              Swal.fire({
                  title: 'Atenção!',
                  text: r.message,
                  type: 'warning'
              });
          })
      });
  
      $('body').on('click', '.answer', function(e) {
  
          e.preventDefault();
  
          var answers = $(this).parent().parent().parent().find('.comment-answers:first');
          answers.show();
          answers
              .prepend(answerBox(
                  $(this).data('promotionId'),
                  $(this).data('ratingId'),
                  $(this).data('postId'),
                  $(this).data('commentId')
                  ))
              .ready(answerBoxAdded());
      });
  
      $('body').on('click', '.form-resposta .cancel-coments', function() {
          $(this).parent().parent().parent().remove();
      });
  
      $('body').on('submit', '.form-resposta form', function(e) {
          e.preventDefault();
  
          var form = $(this);
          var url = $('.form-resposta').data('url');
  
          if(!USER_LOGGED) {
  
              new Fancybox(
          [{
            type: 'ajax',
            src: 'usuario-deslogado'
          }],
          {
            mainClass: "fancybox-gatry fancybox-gatry-share"
          });
  
              return;
          }
  
          $('input:submit', form).prop('disabled', 'disabled');
  
          $.post(WEB_ROOT + url, {
              description : form.find('.tribute-textarea').val() || null,
              rating_id : form.find('input[name=rating_id]').val() || null,
              post_id : form.find('input[name=post_id]').val() || null,
              promotion_id : form.find('input[name=promotion_id]').val() || null,
              comment_id : form.find('input[name=comment_id]').val() || null,
          }, function(r) {
              $('#no-comments').remove();
  
              if(url == '/livre/enviar') {
                  $('.form-resposta').parent().prepend(r).end().remove();
              } else {
                  $('.form-resposta').parent().append(r).end().remove();
              }
  
          });
      });
  
      $('.comment-btn').on('click', function() {
          $('.comments')
              .prepend(answerBox(
                  $(this).data('promotionId'),
                  $(this).data('ratingId'),
                  $(this).data('postId'),
                  $(this).data('commentId'),
                  $(this).data('url')
                  ))
              .ready(answerBoxAdded());
      });
  
      $(document).on('click', '.comment-report a', function(e) {
          e.preventDefault();
  
          var id = $(this).data('id');
          var url = $(this).prop('href');
  
          Swal.fire({
              title: 'Reportar comentário!',
              text: 'Deseja realmente reportar este comentário, não será possível refazer esta ação.',
              type: 'warning',
              confirmButtonText: 'Sim, tenho certeza!',
              cancelButtonText: 'Não',
              showCancelButton: true,
              showLoaderOnConfirm: true,
              allowOutsideClick: () => !Swal.isLoading(),
              preConfirm: function() {
                  return new Promise(function(resolve) {
                      // window.location.reload();
                      $.post(url, {
                          id: id
                      }, function(r){
  
                          if(r.success) {
                              Swal.fire("", r.message, "success");
                              return;
                          }
  
                          Swal.fire("Ooops!", r.message, "error");
                      });
                    });
              }
          });
  
  
      });
  
  });
  