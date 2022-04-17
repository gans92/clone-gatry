$(function() {

    // Seta o BOLD no menu da págin atual
    var currentPage = function() {
        var pathname = window.location.pathname.replace('/', '');

        // Se for a página principal, adiciona o bold no menu de promoções
        if(pathname == '') {
            $('.top-bar nav li[data-menu="promocoes"]').addClass("active");
            return;
        }

        $('.top-bar nav li[data-menu="' +pathname+ '"]').addClass("active");
    };
    currentPage();

    $('.scroll-to-top').click(function() {
        $("html, body").animate({scrollTop:0}, 500, 'swing');
    });

    // Share Menu
    $('.header .share .link-icon, .header .login .link-icon').on('click', function(e) {
        e.preventDefault();

        var box = $(this).parent().find('.arrow_box');

        if(box.is(':hidden')) {
            box.show();
        } else {
            box.hide();
        }
    });

    // Lightbox
    $("[data-lightbox-login]").on('click', function(e) {
        e.preventDefault();

        var url = $(this).prop('href');

        var popup = new Fancybox(
          [{
            type: 'ajax',
            src: url
          }],
          {
            mainClass: "fancybox-gatry fancybox-gatry-login"
          });
    });

    $(document).on('click', '[data-lightbox-comments]', function(e) {
        e.preventDefault();

        var url = $(this).prop('href');

        var popup = new Fancybox(
          [{
            type: 'ajax',
            src: url
          }],
          {
            mainClass: "fancybox-gatry fancybox-gatry-comment"
          });
    });

    // Share Menu
    $("[data-share] a").on('click', function(e) {
        e.preventDefault();

        // Show HTML element
        if(!USER_LOGGED) {
            Fancybox.show([{ src: "#warning-1", type: "inline" }]);
            return;
        }

        var url = $(this).prop('href');

        var popup = new Fancybox(
          [{
            type: 'ajax',
            src: url
          }],
          {
            mainClass: "fancybox-gatry fancybox-gatry-share"
          });
    });

    var loading = false;
    var userClickLoadMore = false;

    $('.load-more button').on('click', function(e) {
        e.preventDefault();

        userClickLoadMore = true;

        if(loading) return;

        loading = true;

        var $this = $(this);
        var url = $(this).data('url');
        var appendLocal = $(this).data('appendLocal');
        var finishText = $(this).data('finishText') || "Todos os registros foram exibidos";
        var exclude = $(this).data('exclude') || null;
        var page = parseInt($(this).data('currentPage'));
        var nextPage = page + 1;
        var scrollTop = document.documentElement.scrollTop;

        $this.html("Carregando, aguarde...");

        $.get(url, {page: nextPage, exclude: exclude}, function(e) {

            if(e.length == 0) {
                $this.prop('disabled', true);
                userClickLoadMore = false;
                $this.html(finishText);
                return;
            }

            $(appendLocal).append(e);

            $this.data('currentPage', nextPage);

            window.scrollTo(0, scrollTop);
            loading = false;

            $this.html("Carregar mais...");

        });
    });

    $(window).on('scroll', function(e){
        if (!userClickLoadMore && !$.browser.mobile) return;
        if ($('.load-more button').length == 0) return;

        if ($(window).scrollTop() >= $(document).height() - $(window).height() - 10) {
            $('.load-more button').click();
        }
    });

    $(document).on('click', '.comments .comment .comment-content [data-user-id]', function(e) {
        window.location = WEB_ROOT + '/usuarios/go/' + $(this).data('userId');
    });

});

var pusher = new Pusher(PUSHER_APP_KEY, {
  cluster: 'mt1',
  authEndpoint:  '/usuarios/pusher/site',
  usesTLS: true
});

var channel = pusher.subscribe(PUSHER_APP_CHANNEL);
var currentTitle = document.title;
var total = 0;

channel.bind('notification.new.promotion', function(data) {
    var i = parseInt($('#bullet-promocoes').html());
    $('#bullet-promocoes').html(i + 1).addClass('position-absolute d-inline-block');
    changeTitle();
});

channel.bind('notification.new.rating', function(data) {
    var i = parseInt($('#bullet-avaliacoes').html());
    $('#bullet-avaliacoes').html(i + 1).addClass('position-absolute d-inline-block');
    changeTitle();
});

channel.bind('notification.new.cupom', function(data) {
    if(data.identify == PUSHER_IDENTIFY) return;
    var i = parseInt($('#bullet-cupons').html());
    $('#bullet-cupons').html(i + (typeof data.total != 'undefined' ? data.total : 1)).addClass('position-absolute d-inline-block');
    changeTitle();
});

channel.bind('notification.new.post', function(data) {
    if(data.identify == PUSHER_IDENTIFY) return;
    var i = parseInt($('#bullet-livres').html());
    $('#bullet-livres').html(i + (typeof data.total != 'undefined' ? data.total : 1)).addClass('position-absolute d-inline-block');
    // changeTitle();
});

function changeTitle() {
    total = total + 1;

    if(total > 0){
        document.title = "(" + ( total ) + ") " + currentTitle;
    }else{
        document.title = currentTitle;
    }
}
