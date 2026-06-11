(function () {
    "use strict";

    var candyColors = [
        "#FFB3D9",
        "#FF8DC7",
        "#FFB347",
        "#FFE66D",
        "#A8E6CE",
        "#87CEEB",
        "#C497FF"
    ];

    function normalize(text) {
        return String(text || "").toLowerCase().trim();
    }

    function setupCandyRain() {
        var layer = document.querySelector(".candy-rain");
        if (!layer) {
            return;
        }

        var fragment = document.createDocumentFragment();
        for (var index = 0; index < 28; index += 1) {
            var drop = document.createElement("span");
            drop.style.left = Math.random() * 100 + "%";
            drop.style.animationDelay = Math.random() * 5 + "s";
            drop.style.animationDuration = 3 + Math.random() * 3 + "s";
            drop.style.backgroundColor = candyColors[index % candyColors.length];
            fragment.appendChild(drop);
        }
        layer.appendChild(fragment);
    }

    function setupMobileMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-nav-links]");
        var search = document.querySelector(".top-search");
        if (!button || !nav || !search) {
            return;
        }

        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
            search.classList.toggle("is-open");
        });
    }

    function setupHeroCarousel() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }

        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var prev = carousel.querySelector("[data-hero-prev]");
        var next = carousel.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function startAutoPlay() {
            stopAutoPlay();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function stopAutoPlay() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                startAutoPlay();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                startAutoPlay();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                startAutoPlay();
            });
        }

        carousel.addEventListener("mouseenter", stopAutoPlay);
        carousel.addEventListener("mouseleave", startAutoPlay);
        showSlide(0);
        startAutoPlay();
    }

    function yearMatches(cardYear, selectedYear) {
        var year = Number(cardYear || 0);
        if (!selectedYear) {
            return true;
        }
        if (selectedYear === "2026") {
            return year >= 2026;
        }
        if (selectedYear === "2010") {
            return year >= 2010 && year < 2020;
        }
        if (selectedYear === "2000") {
            return year >= 2000 && year < 2010;
        }
        if (selectedYear === "1990") {
            return year < 2000;
        }
        return String(year) === selectedYear;
    }

    function sortCards(container, cards, mode) {
        var sorted = cards.slice();
        sorted.sort(function (left, right) {
            if (mode === "views") {
                return Number(right.dataset.views || 0) - Number(left.dataset.views || 0);
            }
            if (mode === "rating") {
                return Number(right.dataset.rating || 0) - Number(left.dataset.rating || 0);
            }
            if (mode === "title") {
                return String(left.dataset.title || "").localeCompare(String(right.dataset.title || ""), "zh-Hans-CN");
            }
            return Number(right.dataset.year || 0) - Number(left.dataset.year || 0);
        });
        sorted.forEach(function (card) {
            container.appendChild(card);
        });
    }

    function setupFilters() {
        var zone = document.querySelector(".js-filter-zone");
        var container = document.querySelector("[data-card-container]");
        if (!zone || !container) {
            return;
        }

        var input = zone.querySelector(".js-search-input");
        var yearSelect = zone.querySelector("[data-filter-year]");
        var typeSelect = zone.querySelector("[data-filter-type]");
        var regionSelect = zone.querySelector("[data-filter-region]");
        var sortSelect = zone.querySelector("[data-sort-mode]");
        var countNode = zone.querySelector("[data-filter-count]");
        var cards = Array.prototype.slice.call(container.querySelectorAll(".js-movie-card"));

        function applyFilters() {
            var keyword = normalize(input && input.value);
            var yearValue = yearSelect ? yearSelect.value : "";
            var typeValue = normalize(typeSelect && typeSelect.value);
            var regionValue = normalize(regionSelect && regionSelect.value);
            var visibleCount = 0;

            cards.forEach(function (card) {
                var text = normalize([
                    card.dataset.title,
                    card.dataset.tags,
                    card.dataset.type,
                    card.dataset.region
                ].join(" "));
                var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchesYear = yearMatches(card.dataset.year, yearValue);
                var matchesType = !typeValue || normalize(card.dataset.type).indexOf(typeValue) !== -1 || normalize(card.dataset.tags).indexOf(typeValue) !== -1;
                var matchesRegion = !regionValue || normalize(card.dataset.region).indexOf(regionValue) !== -1;
                var shouldShow = matchesKeyword && matchesYear && matchesType && matchesRegion;

                card.classList.toggle("hidden-by-filter", !shouldShow);
                if (shouldShow) {
                    visibleCount += 1;
                }
            });

            sortCards(container, cards, sortSelect ? sortSelect.value : "year");
            if (countNode) {
                countNode.textContent = "显示 " + visibleCount + " 部影片";
            }
        }

        [input, yearSelect, typeSelect, regionSelect, sortSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query && input) {
            input.value = query;
        }

        applyFilters();
    }

    function setupPlayer() {
        var video = document.querySelector(".movie-player[data-video-src]");
        var overlay = document.querySelector(".js-play-video");
        if (!video) {
            return;
        }

        var source = video.getAttribute("data-video-src");
        var hasLoaded = false;

        function loadSource() {
            if (hasLoaded || !source) {
                return;
            }
            hasLoaded = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function playVideo() {
            loadSource();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    video.controls = true;
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", playVideo);
        }

        video.addEventListener("click", function () {
            if (!hasLoaded) {
                playVideo();
            }
        });

        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupCandyRain();
        setupMobileMenu();
        setupHeroCarousel();
        setupFilters();
        setupPlayer();
    });
}());
