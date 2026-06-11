(function() {
    var heroIndex = 0;

    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function() {
            panel.classList.toggle('is-open');
        });
    }

    function showHero(index) {
        var slides = selectAll('[data-hero-slide]');
        var dots = selectAll('[data-hero-dot]');
        if (!slides.length) {
            return;
        }
        heroIndex = (index + slides.length) % slides.length;
        slides.forEach(function(slide, current) {
            slide.classList.toggle('is-active', current === heroIndex);
        });
        dots.forEach(function(dot, current) {
            dot.classList.toggle('is-active', current === heroIndex);
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var next = document.querySelector('[data-hero-next]');
        var prev = document.querySelector('[data-hero-prev]');
        selectAll('[data-hero-dot]').forEach(function(dot) {
            dot.addEventListener('click', function() {
                showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });
        if (next) {
            next.addEventListener('click', function() {
                showHero(heroIndex + 1);
            });
        }
        if (prev) {
            prev.addEventListener('click', function() {
                showHero(heroIndex - 1);
            });
        }
        window.setInterval(function() {
            showHero(heroIndex + 1);
        }, 5200);
    }

    function setupSearchForms() {
        selectAll('.js-site-search-form').forEach(function(form) {
            form.addEventListener('submit', function(event) {
                var input = form.querySelector('input[name="q"]');
                if (!input) {
                    return;
                }
                var keyword = input.value.trim();
                if (!keyword) {
                    event.preventDefault();
                    window.location.href = 'library.html';
                }
            });
        });
    }

    function includesText(value, keyword) {
        return String(value || '').toLowerCase().indexOf(String(keyword || '').toLowerCase()) !== -1;
    }

    function setupFilters() {
        var panel = document.querySelector('[data-filter-panel]');
        var list = document.querySelector('[data-card-list]');
        if (!panel || !list) {
            return;
        }
        var cards = selectAll('[data-movie-card]', list);
        var search = panel.querySelector('[data-filter-search]');
        var category = panel.querySelector('[data-filter-category]');
        var type = panel.querySelector('[data-filter-type]');
        var year = panel.querySelector('[data-filter-year]');
        var empty = document.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (search && query) {
            search.value = query;
        }

        function apply() {
            var keyword = search ? search.value.trim() : '';
            var selectedCategory = category ? category.value : '';
            var selectedType = type ? type.value : '';
            var selectedYear = year ? Number(year.value || 0) : 0;
            var visible = 0;
            cards.forEach(function(card) {
                var haystack = card.getAttribute('data-search') || '';
                var cardCategory = card.getAttribute('data-category') || '';
                var cardType = card.getAttribute('data-type') || '';
                var cardYear = Number(card.getAttribute('data-year') || 0);
                var ok = true;
                if (keyword && !includesText(haystack, keyword)) {
                    ok = false;
                }
                if (selectedCategory && cardCategory !== selectedCategory) {
                    ok = false;
                }
                if (selectedType && !includesText(cardType, selectedType)) {
                    ok = false;
                }
                if (selectedYear && cardYear < selectedYear) {
                    ok = false;
                }
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [search, category, type, year].forEach(function(control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        apply();
    }

    window.SitePlayer = function(config) {
        var video = document.getElementById(config.videoId);
        var cover = document.getElementById(config.coverId);
        var button = document.getElementById(config.buttonId);
        var source = config.source;
        var hlsInstance = null;
        var started = false;

        function attachSource() {
            if (!video || !source) {
                return;
            }
            if (started) {
                return;
            }
            started = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.play().catch(function() {});
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function() {
                    video.play().catch(function() {});
                });
                hlsInstance.on(window.Hls.Events.ERROR, function(event, data) {
                    if (data && data.fatal) {
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hlsInstance.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hlsInstance.recoverMediaError();
                        } else {
                            hlsInstance.destroy();
                        }
                    }
                });
            } else {
                video.src = source;
                video.play().catch(function() {});
            }
        }

        function startPlayback() {
            if (cover) {
                cover.classList.add('is-hidden');
            }
            attachSource();
            if (video) {
                video.play().catch(function() {});
            }
        }

        if (cover) {
            cover.addEventListener('click', startPlayback);
        }
        if (button) {
            button.addEventListener('click', startPlayback);
        }
        if (video) {
            video.addEventListener('click', function() {
                if (!started) {
                    startPlayback();
                }
            });
            video.addEventListener('play', function() {
                if (cover) {
                    cover.classList.add('is-hidden');
                }
            });
        }
        window.addEventListener('beforeunload', function() {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function() {
        setupMenu();
        setupHero();
        setupSearchForms();
        setupFilters();
    });
})();
