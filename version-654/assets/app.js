(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var nav = document.querySelector('[data-main-nav]');
        if (toggle && nav) {
            toggle.addEventListener('click', function () {
                nav.classList.toggle('is-open');
            });
        }

        setupHero();
        setupTabs();
        setupFilters();
    });

    function setupHero() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupTabs() {
        var groups = Array.prototype.slice.call(document.querySelectorAll('[data-tab-group]'));
        groups.forEach(function (group) {
            var buttons = Array.prototype.slice.call(group.querySelectorAll('[data-tab-target]'));
            var panels = Array.prototype.slice.call(group.querySelectorAll('[data-tab-panel]'));
            buttons.forEach(function (button) {
                button.addEventListener('click', function () {
                    var target = button.getAttribute('data-tab-target');
                    buttons.forEach(function (item) {
                        item.classList.toggle('is-active', item === button);
                    });
                    panels.forEach(function (panel) {
                        panel.classList.toggle('is-active', panel.getAttribute('data-tab-panel') === target);
                    });
                });
            });
        });
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('.js-filter-panel'));
        panels.forEach(function (panel) {
            var section = panel.closest('.filter-section') || document;
            var input = panel.querySelector('.js-movie-search');
            var type = panel.querySelector('.js-filter-type');
            var year = panel.querySelector('.js-filter-year');
            var cards = Array.prototype.slice.call(section.querySelectorAll('.js-card'));
            var params = new URLSearchParams(window.location.search);
            var initial = params.get('q');

            if (input && initial) {
                input.value = initial;
            }

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : '';
                var typeValue = type ? type.value : '';
                var yearValue = year ? year.value : '';
                cards.forEach(function (card) {
                    var search = (card.getAttribute('data-search') || '').toLowerCase();
                    var cardType = card.getAttribute('data-type') || '';
                    var cardYear = card.getAttribute('data-year') || '';
                    var matched = true;
                    if (keyword && search.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (typeValue && cardType !== typeValue) {
                        matched = false;
                    }
                    if (yearValue && cardYear !== yearValue) {
                        matched = false;
                    }
                    card.classList.toggle('is-hidden', !matched);
                });
            }

            [input, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
            apply();
        });
    }
})();

function initMoviePlayer(streamUrl) {
    var player = document.querySelector('[data-player]');
    if (!player) {
        return;
    }

    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var loading = player.querySelector('.player-loading');
    var error = player.querySelector('.player-error');
    var hls = null;
    var prepared = false;

    function setLoading(active) {
        if (loading) {
            loading.classList.toggle('is-active', active);
        }
    }

    function setError(message) {
        if (error) {
            error.textContent = message || '';
            error.classList.toggle('is-active', Boolean(message));
        }
    }

    function prepare() {
        if (prepared || !video || !streamUrl) {
            return;
        }
        prepared = true;
        setError('');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    setLoading(false);
                    setError('视频加载失败，请稍后重试');
                }
            });
            return;
        }

        setError('您的浏览器暂不支持该视频格式');
    }

    function start() {
        prepare();
        if (cover) {
            cover.classList.add('is-hidden');
        }
        setLoading(true);
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                setLoading(false);
                if (cover) {
                    cover.classList.remove('is-hidden');
                }
            });
        }
    }

    if (cover) {
        cover.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        } else {
            video.pause();
        }
    });

    video.addEventListener('playing', function () {
        setLoading(false);
        video.controls = true;
    });

    video.addEventListener('waiting', function () {
        setLoading(true);
    });

    video.addEventListener('canplay', function () {
        setLoading(false);
    });

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
}
