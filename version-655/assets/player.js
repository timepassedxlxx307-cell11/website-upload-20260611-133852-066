function initMoviePlayer(videoId, sourceUrl) {
    var video = document.getElementById(videoId);

    if (!video) {
        return;
    }

    var box = video.closest(".player-box");
    var cover = box ? box.querySelector("[data-play-cover]") : null;
    var button = box ? box.querySelector("[data-player-button]") : null;
    var hls = null;
    var ready = false;
    var pendingPlay = false;

    function playVideo() {
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    }

    function attach() {
        if (ready) {
            return;
        }

        ready = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                if (pendingPlay) {
                    playVideo();
                }
            });
        } else {
            video.src = sourceUrl;
        }
    }

    function start() {
        pendingPlay = true;
        attach();

        if (cover) {
            cover.classList.add("hidden");
        }

        playVideo();
    }

    if (button) {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            start();
        });
    }

    if (cover) {
        cover.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            start();
        }
    });

    video.addEventListener("play", function () {
        if (cover) {
            cover.classList.add("hidden");
        }
    });
}
