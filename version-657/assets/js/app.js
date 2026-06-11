(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = $('#menuToggle');
    var panel = $('#mobilePanel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var slider = $('#topHero');
    if (!slider) {
      return;
    }
    var slides = $all('.hero-slide', slider);
    var dots = $all('[data-hero-dot]', slider);
    var prev = $('#heroPrev');
    var next = $('#heroNext');
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        restart();
      });
    }

    restart();
  }

  function initSearchPage() {
    var grid = $('#searchGrid');
    if (!grid) {
      return;
    }
    var input = $('#movieSearchInput');
    var form = $('#searchPanel');
    var typeFilter = $('#typeFilter');
    var yearFilter = $('#yearFilter');
    var pillBox = $('#categoryFilter');
    var cards = $all('[data-card]', grid);
    var params = new URLSearchParams(window.location.search);
    var activeCategory = '';

    if (input && params.get('q')) {
      input.value = params.get('q');
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function apply() {
      var q = normalize(input ? input.value : '');
      var type = typeFilter ? typeFilter.value : '';
      var year = yearFilter ? yearFilter.value : '';

      cards.forEach(function (card) {
        var title = normalize(card.getAttribute('data-title'));
        var meta = normalize(card.getAttribute('data-meta'));
        var cardType = card.getAttribute('data-type') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var cardCategory = card.getAttribute('data-category') || '';
        var matchedText = !q || title.indexOf(q) !== -1 || meta.indexOf(q) !== -1;
        var matchedType = !type || cardType === type;
        var matchedYear = !year || cardYear === year;
        var matchedCategory = !activeCategory || cardCategory === activeCategory;
        card.classList.toggle('is-hidden', !(matchedText && matchedType && matchedYear && matchedCategory));
      });
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        apply();
      });
    }

    [input, typeFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    if (pillBox) {
      $all('[data-filter-pill]', pillBox).forEach(function (pill) {
        pill.addEventListener('click', function () {
          activeCategory = pill.getAttribute('data-filter-pill') || '';
          $all('[data-filter-pill]', pillBox).forEach(function (item) {
            item.classList.toggle('is-active', item === pill);
          });
          apply();
        });
      });
    }

    apply();
  }

  window.initMoviePlayer = function (url) {
    var video = $('#movieVideo');
    var start = $('#playerStart');
    var loaded = false;

    if (!video || !url) {
      return;
    }

    function attach() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        video._player = hls;
      } else {
        video.src = url;
      }
    }

    function begin() {
      attach();
      if (start) {
        start.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (start) {
      start.addEventListener('click', begin);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        begin();
      }
    });

    video.addEventListener('play', function () {
      if (start) {
        start.classList.add('is-hidden');
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initSearchPage();
  });
})();
