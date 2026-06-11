(function () {
  var doc = document;

  function all(selector, scope) {
    return Array.prototype.slice.call((scope || doc).querySelectorAll(selector));
  }

  function one(selector, scope) {
    return (scope || doc).querySelector(selector);
  }

  function initMenu() {
    var button = one('.menu-toggle');
    var menu = one('.mobile-nav');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var hero = one('.hero');
    if (!hero) {
      return;
    }
    var slides = all('.hero-slide', hero);
    var dots = all('.hero-dot', hero);
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        stop();
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initSearch() {
    var input = one('[data-filter-input]');
    var year = one('[data-filter-year]');
    var category = one('[data-filter-category]');
    var cards = all('[data-title][data-tags]');
    var empty = one('.search-empty');
    if (!input || cards.length === 0) {
      return;
    }

    function value(node) {
      return node ? node.value.trim().toLowerCase() : '';
    }

    function apply() {
      var keyword = value(input);
      var yearValue = value(year);
      var categoryValue = value(category);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region'),
          card.getAttribute('data-category'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();
        var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
        var cardCategory = (card.getAttribute('data-category') || '').toLowerCase();
        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }
        if (yearValue && cardYear !== yearValue) {
          matched = false;
        }
        if (categoryValue && cardCategory !== categoryValue) {
          matched = false;
        }
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    input.addEventListener('input', apply);
    if (year) {
      year.addEventListener('change', apply);
    }
    if (category) {
      category.addEventListener('change', apply);
    }
    apply();
  }

  function loadHlsLibrary(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var existing = one('script[data-hls-loader]');
    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      return;
    }
    var script = doc.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
    script.async = true;
    script.setAttribute('data-hls-loader', 'true');
    script.addEventListener('load', callback, { once: true });
    doc.head.appendChild(script);
  }

  function initPlayers() {
    all('.player-frame[data-stream]').forEach(function (frame) {
      var video = one('video', frame);
      var button = one('.js-play', frame);
      var stream = frame.getAttribute('data-stream');
      if (!video || !stream) {
        return;
      }

      function bindStream(done) {
        if (video.getAttribute('data-bound') === 'true') {
          done();
          return;
        }
        video.setAttribute('data-bound', 'true');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          done();
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          video._hlsInstance = hls;
          done();
          return;
        }

        video.src = stream;
        done();
      }

      function play() {
        loadHlsLibrary(function () {
          bindStream(function () {
            frame.classList.add('is-playing');
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
              playPromise.catch(function () {});
            }
          });
        });
      }

      if (button) {
        button.addEventListener('click', play);
      }
      video.addEventListener('play', function () {
        frame.classList.add('is-playing');
      });
    });
  }

  doc.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initSearch();
    initPlayers();
  });
}());
