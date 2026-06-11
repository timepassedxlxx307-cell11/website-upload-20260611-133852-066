(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var mobile = document.querySelector("[data-mobile-nav]");
    if (!toggle || !mobile) {
      return;
    }
    toggle.addEventListener("click", function () {
      mobile.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });
    show(0);
    restart();
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-page-search]");
      var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-button]"));
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-search]"));
      var empty = scope.querySelector("[data-empty-result]");
      var activeFilter = "all";

      if (input && input.hasAttribute("data-read-query")) {
        var param = input.getAttribute("data-read-query");
        var params = new URLSearchParams(window.location.search);
        var value = params.get(param);
        if (value) {
          input.value = value;
        }
      }

      function apply() {
        var query = normalize(input ? input.value : "");
        var shown = 0;
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-search"));
          var filterText = normalize(activeFilter);
          var matchQuery = !query || haystack.indexOf(query) !== -1;
          var matchFilter = filterText === "all" || haystack.indexOf(filterText) !== -1;
          var visible = matchQuery && matchFilter;
          card.hidden = !visible;
          if (visible) {
            shown += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", shown === 0);
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          activeFilter = button.getAttribute("data-filter-button") || "all";
          buttons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          apply();
        });
      });
      apply();
    });
  }

  window.initializePlayer = function (url) {
    var video = document.getElementById("movie-video");
    var veil = document.getElementById("player-veil");
    if (!video || !veil || !url) {
      return;
    }
    var loaded = false;
    var hls = null;

    function attach() {
      if (!loaded) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
        loaded = true;
      }
      veil.classList.add("is-hidden");
      var play = video.play();
      if (play && typeof play.catch === "function") {
        play.catch(function () {});
      }
    }

    veil.addEventListener("click", attach);
    video.addEventListener("click", function () {
      if (!loaded) {
        attach();
      }
    });
    video.addEventListener("play", function () {
      veil.classList.add("is-hidden");
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    initNavigation();
    initHero();
    initFilters();
  });
})();
