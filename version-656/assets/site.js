(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('open');
        toggle.classList.toggle('open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var filterInput = document.querySelector('[data-card-filter]');
    var cardContainer = document.querySelector('[data-card-container]');

    if (filterInput && filterInput.hasAttribute('data-query-sync')) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query) {
        filterInput.value = query;
      }
    }

    function filterCards() {
      if (!filterInput || !cardContainer) {
        return;
      }
      var term = normalize(filterInput.value);
      var cards = cardContainer.querySelectorAll('[data-search]');
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search') + ' ' + card.textContent);
        card.classList.toggle('is-hidden', term && text.indexOf(term) === -1);
      });
    }

    if (filterInput && cardContainer) {
      filterInput.addEventListener('input', filterCards);
      filterCards();
    }
  });

  window.initMoviePlayer = function (url) {
    var video = document.getElementById('movie-video');
    var layer = document.getElementById('play-layer');
    var initialized = false;
    var hlsInstance = null;

    if (!video || !url) {
      return;
    }

    function attach() {
      if (initialized) {
        return;
      }
      initialized = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function play() {
      attach();
      if (layer) {
        layer.classList.add('hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (layer) {
      layer.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      if (layer) {
        layer.classList.add('hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
