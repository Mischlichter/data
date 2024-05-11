function initializeClipz() {
    const clipzContainer = document.getElementById('clipzContainer');
    clipzContainer.innerHTML = `
        <div class="ambilightWrapper">
            <div class="aspectRatio">
                <video id="clipzVideo1" class="videoPlayer" autoplay muted></video>
                <video id="clipzVideo2" class="videoPlayer" autoplay muted></video>
            </div>
            <canvas id="clipzAmbilight"></canvas>
        </div>
    `;

    setupVideoPlayer();
    initializeAmbilight('clipzVideo1', 'clipzVideo2', 'clipzAmbilight');
}

// Function to initialize Ambilight effect
function initializeAmbilight(videoId1, videoId2, canvasId) {
    let intervalId;
    const FRAMERATE = 30;
    let activeVideo;

    const canvas = document.getElementById(canvasId);
    const context = canvas.getContext('2d');

    const video1 = document.getElementById(videoId1);
    const video2 = document.getElementById(videoId2);
    activeVideo = video1; // Start with video1

    function repaintAmbilight() {
        if (activeVideo && activeVideo.readyState >= 2) {
            context.drawImage(activeVideo, 0, 0, canvas.width, canvas.height);
        }
    }

    function startAmbilightRepaint() {
        intervalId = window.setInterval(repaintAmbilight, 1000 / FRAMERATE);
    }

    function stopAmbilightRepaint() {
        clearInterval(intervalId);
    }

    video1.addEventListener('play', startAmbilightRepaint);
    video2.addEventListener('play', startAmbilightRepaint);

    video1.addEventListener('pause', stopAmbilightRepaint);
    video2.addEventListener('pause', stopAmbilightRepaint);

    video1.addEventListener('ended', stopAmbilightRepaint);
    video2.addEventListener('ended', stopAmbilightRepaint);

    video1.addEventListener('seeked', repaintAmbilight);
    video2.addEventListener('seeked', repaintAmbilight);
}

// Fetch video URLs and setup video players
async function fetchVideoUrls() {
    try {
        const response = await fetch('https://api.github.com/repos/Mischlichter/data/contents/clipz');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data.map(item => item.download_url);
    } catch (error) {
        console.error('Error fetching video URLs:', error);
        return [];
    }
}

// Setup the video players
async function setupVideoPlayer() {
    let originalVideoUrls = await fetchVideoUrls();
    if (originalVideoUrls.length === 0) {
        console.error('No video URLs found');
        return;
    }

    let videoUrls = [...originalVideoUrls];
    const video1 = document.getElementById('clipzVideo1');
    const video2 = document.getElementById('clipzVideo2');
    let currentVideo = video1;
    let nextVideo = video2;

    function playNextVideo() {
        if (videoUrls.length === 0) {
            videoUrls = [...originalVideoUrls];
        }
        const randomIndex = Math.floor(Math.random() * videoUrls.length);
        nextVideo.src = videoUrls[randomIndex];
        nextVideo.load();
        nextVideo.play();
        videoUrls.splice(randomIndex, 1);

        activeVideo = nextVideo;

        // Start fading transition
        currentVideo.style.opacity = '0';
        nextVideo.style.opacity = '1';

        // Swap roles of video elements for next transition
        let temp = currentVideo;
        currentVideo = nextVideo;
        nextVideo = temp;
    }

    currentVideo.addEventListener('ended', playNextVideo);
    nextVideo.addEventListener('ended', playNextVideo);

    playNextVideo();
}