(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
            return;
        }
        document.addEventListener('DOMContentLoaded', callback);
    }

    ready(function () {
        var navToggle = document.querySelector('[data-nav-toggle]');
        var mainNav = document.querySelector('[data-main-nav]');
        if (navToggle && mainNav) {
            navToggle.addEventListener('click', function () {
                mainNav.classList.toggle('is-open');
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startHero() {
            if (slides.length <= 1) {
                return;
            }
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }

        function restartHero() {
            if (timer) {
                window.clearInterval(timer);
            }
            startHero();
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                restartHero();
            });
        });

        Array.prototype.forEach.call(document.querySelectorAll('[data-hero-prev]'), function (button) {
            button.addEventListener('click', function () {
                showSlide(current - 1);
                restartHero();
            });
        });

        Array.prototype.forEach.call(document.querySelectorAll('[data-hero-next]'), function (button) {
            button.addEventListener('click', function () {
                showSlide(current + 1);
                restartHero();
            });
        });

        showSlide(0);
        startHero();

        var searchInput = document.querySelector('[data-search-input]');
        var filterSelects = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        var resultCount = document.querySelector('[data-result-count]');
        var emptyResult = document.querySelector('[data-empty-result]');

        function applyFilters() {
            if (!cards.length) {
                return;
            }
            var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
            var activeFilters = {};
            filterSelects.forEach(function (select) {
                if (select.value) {
                    activeFilters[select.getAttribute('data-filter')] = select.value.toLowerCase();
                }
            });

            var visible = 0;
            cards.forEach(function (card) {
                var combined = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-tags')
                ].join(' ').toLowerCase();
                var matched = !keyword || combined.indexOf(keyword) !== -1;

                Object.keys(activeFilters).forEach(function (key) {
                    var value = (card.getAttribute('data-' + key) || '').toLowerCase();
                    if (value.indexOf(activeFilters[key]) === -1) {
                        matched = false;
                    }
                });

                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (resultCount) {
                resultCount.textContent = '显示 ' + visible + ' 部';
            }
            if (emptyResult) {
                emptyResult.classList.toggle('is-visible', visible === 0);
            }
        }

        if (searchInput) {
            searchInput.addEventListener('input', applyFilters);
        }
        filterSelects.forEach(function (select) {
            select.addEventListener('change', applyFilters);
        });
        applyFilters();

        var player = document.querySelector('[data-player]');
        var playCover = document.querySelector('[data-play-cover]');
        var hlsInstance = null;

        function startPlayback() {
            if (!player) {
                return;
            }
            var url = player.getAttribute('data-video');
            if (!url) {
                return;
            }
            if (playCover) {
                playCover.classList.add('is-hidden');
            }
            if (player.canPlayType('application/vnd.apple.mpegurl')) {
                if (!player.src) {
                    player.src = url;
                }
                player.play();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                if (!hlsInstance) {
                    hlsInstance = new window.Hls();
                    hlsInstance.loadSource(url);
                    hlsInstance.attachMedia(player);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        player.play();
                    });
                } else {
                    player.play();
                }
            }
        }

        if (playCover) {
            playCover.addEventListener('click', startPlayback);
        }
        if (player) {
            player.addEventListener('click', function () {
                if (player.paused) {
                    startPlayback();
                }
            });
        }
    });
})();
