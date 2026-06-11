(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        var current = 0;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }
    }

    var filterInput = document.querySelector('[data-card-filter]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var cardList = document.querySelector('[data-card-list]');

    function applyCardFilter() {
        if (!cardList) {
            return;
        }

        var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
        var yearValue = yearFilter ? yearFilter.value : '';
        var cards = selectAll('.js-movie-card', cardList);

        cards.forEach(function (card) {
            var title = (card.getAttribute('data-title') || '').toLowerCase();
            var year = card.getAttribute('data-year') || '';
            var region = (card.getAttribute('data-region') || '').toLowerCase();
            var type = (card.getAttribute('data-type') || '').toLowerCase();
            var haystack = title + ' ' + year + ' ' + region + ' ' + type;
            var keywordOk = !keyword || haystack.indexOf(keyword) >= 0;
            var yearOk = true;

            if (yearValue === '2023') {
                yearOk = Number(year) <= 2023;
            } else if (yearValue) {
                yearOk = year === yearValue;
            }

            card.classList.toggle('is-hidden-by-filter', !(keywordOk && yearOk));
        });
    }

    if (filterInput) {
        filterInput.addEventListener('input', applyCardFilter);
    }

    if (yearFilter) {
        yearFilter.addEventListener('change', applyCardFilter);
    }

    function initPlayers() {
        selectAll('.video-player-box').forEach(function (box) {
            var video = box.querySelector('video');
            var overlay = box.querySelector('.player-overlay');
            var message = box.querySelector('.player-message');
            var url = box.getAttribute('data-url');
            var hlsInstance = null;
            var ready = false;

            if (!video || !overlay || !url) {
                return;
            }

            function writeMessage(text) {
                if (message) {
                    message.textContent = text || '';
                }
            }

            function prepareVideo() {
                if (ready) {
                    return;
                }

                ready = true;

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(url);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            writeMessage('播放暂时不可用');
                            overlay.classList.remove('is-hidden');
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                } else {
                    writeMessage('播放暂时不可用');
                }
            }

            function startPlayback() {
                prepareVideo();
                video.controls = true;
                overlay.classList.add('is-hidden');
                var playPromise = video.play();

                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        overlay.classList.remove('is-hidden');
                    });
                }
            }

            overlay.addEventListener('click', startPlayback);

            video.addEventListener('click', function () {
                if (video.paused) {
                    startPlayback();
                } else {
                    video.pause();
                }
            });

            window.addEventListener('pagehide', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        });
    }

    initPlayers();

    function initSearchPage() {
        var input = document.getElementById('movie-search');
        var button = document.getElementById('movie-search-button');
        var results = document.getElementById('search-results');

        if (!input || !button || !results || !window.SEARCH_DATA) {
            return;
        }

        function makeCard(movie) {
            var article = document.createElement('a');
            var poster = document.createElement('div');
            var image = document.createElement('img');
            var year = document.createElement('span');
            var play = document.createElement('span');
            var body = document.createElement('div');
            var title = document.createElement('h3');
            var meta = document.createElement('p');
            var summary = document.createElement('p');

            article.className = 'movie-card';
            article.href = './' + movie.file;
            poster.className = 'poster-wrap';
            image.src = movie.cover;
            image.alt = movie.title;
            image.loading = 'lazy';
            year.className = 'year-badge';
            year.textContent = movie.year;
            play.className = 'hover-play';
            play.textContent = '▶';
            body.className = 'card-body';
            title.textContent = movie.title;
            meta.className = 'movie-meta-line';
            meta.textContent = movie.region + ' · ' + movie.type;
            summary.className = 'card-summary';
            summary.textContent = movie.oneLine;

            poster.appendChild(image);
            poster.appendChild(year);
            poster.appendChild(play);
            body.appendChild(title);
            body.appendChild(meta);
            body.appendChild(summary);
            article.appendChild(poster);
            article.appendChild(body);
            return article;
        }

        function runSearch() {
            var keyword = input.value.trim().toLowerCase();
            results.innerHTML = '';

            if (!keyword) {
                return;
            }

            var matches = window.SEARCH_DATA.filter(function (movie) {
                return movie.searchText.indexOf(keyword) >= 0;
            }).slice(0, 120);

            matches.forEach(function (movie) {
                results.appendChild(makeCard(movie));
            });
        }

        button.addEventListener('click', runSearch);
        input.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                runSearch();
            }
        });

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query) {
            input.value = query;
            runSearch();
        }
    }

    initSearchPage();
})();
