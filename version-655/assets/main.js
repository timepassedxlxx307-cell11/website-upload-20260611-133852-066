
(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("active", itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("active", itemIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var filterYear = document.querySelector("[data-filter-year]");
    var filterRegion = document.querySelector("[data-filter-region]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var empty = document.querySelector("[data-empty]");

    function normalize(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
    }

    function applyQueryFromUrl() {
        if (!filterInput) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");

        if (q) {
            filterInput.value = q;
        }
    }

    function filterCards() {
        if (!cards.length) {
            return;
        }

        var query = normalize(filterInput ? filterInput.value : "");
        var year = filterYear ? filterYear.value : "";
        var region = filterRegion ? filterRegion.value : "";
        var shown = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-tags")
            ].join(" "));
            var matchQuery = !query || haystack.indexOf(query) > -1;
            var matchYear = !year || card.getAttribute("data-year") === year;
            var matchRegion = !region || card.getAttribute("data-region") === region;
            var visible = matchQuery && matchYear && matchRegion;

            card.style.display = visible ? "" : "none";

            if (visible) {
                shown += 1;
            }
        });

        if (empty) {
            empty.classList.toggle("show", shown === 0);
        }
    }

    applyQueryFromUrl();

    [filterInput, filterYear, filterRegion].forEach(function (control) {
        if (control) {
            control.addEventListener("input", filterCards);
            control.addEventListener("change", filterCards);
        }
    });

    filterCards();

    var searchForm = document.querySelector("[data-search-form]");

    if (searchForm) {
        searchForm.addEventListener("submit", function (event) {
            event.preventDefault();
            var input = searchForm.querySelector("input");
            var value = input ? input.value.trim() : "";
            var target = searchForm.getAttribute("action") || "search.html";
            window.location.href = value ? target + "?q=" + encodeURIComponent(value) : target;
        });
    }
})();
