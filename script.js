const fileInput = document.getElementById('audioFile');
const canvas = document.getElementById('visualizer');
const canvasCtx = canvas.getContext('2d');
const playPauseBtn = document.getElementById('playPauseBtn');
const volumeControl = document.getElementById('volumeControl');
const bgSwitchBtn = document.getElementById('bgSwitchBtn');
let audioCtx, analyser, source, audio, dataArray, bufferLength;
let isPlaying = false;
let barHeights = []; // Store bar heights for smooth transition

// Create a container for background circles
const backgroundContainer = document.createElement('div');
backgroundContainer.classList.add('background-container');
document.body.appendChild(backgroundContainer);

// Initialize background style index
let bgIndex = 1;
updateBackgroundStyle();

canvas.width = window.innerWidth * 0.8;
canvas.height = 300;

fileInput.addEventListener('change', function() {
    if (audioCtx) {
        audioCtx.close();
        audio.removeEventListener('ended', onAudioEnded);
    }

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const audioFile = this.files[0];
    audio = new Audio(URL.createObjectURL(audioFile));

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    barHeights = new Array(bufferLength).fill(0); // Initialize the bar heights

    source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    audio.volume = volumeControl.value;
    volumeControl.addEventListener('input', () => {
        audio.volume = volumeControl.value;
    });

    audio.addEventListener('ended', onAudioEnded);
    playPauseBtn.innerText = 'Play';
    isPlaying = false;

    draw();
    generateBackgroundCircles();
});

playPauseBtn.addEventListener('click', () => {
    if (isPlaying) {
        audio.pause();
        playPauseBtn.innerText = 'Play';
        isPlaying = false;
    } else {
        audio.play();
        playPauseBtn.innerText = 'Pause';
        isPlaying = true;
    }
});

bgSwitchBtn.addEventListener('click', () => {
    bgIndex = (bgIndex % 3) + 1;
    updateBackgroundStyle();
});

function updateBackgroundStyle() {
    document.body.classList.remove('bg1', 'bg2', 'bg3');
    document.body.classList.add(`bg${bgIndex}`);
}

function onAudioEnded() {
    playPauseBtn.innerText = 'Play';
    isPlaying = false;
}

function draw() {
    requestAnimationFrame(draw);

    if (!analyser) return;

    analyser.getByteFrequencyData(dataArray);

    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        // Increase the scaling factor to make bars taller
        const targetBarHeight = dataArray[i] * 1.1; // Scale the frequency data
        const easingSpeed = 0.4; // Increased easing speed for faster animation

        // Smooth the bar transition using easing
        barHeights[i] += (targetBarHeight - barHeights[i]) * easingSpeed;

        const barHeight = barHeights[i];

        // Optional: Clamp barHeight to avoid it becoming too high
        const maxBarHeight = canvas.height;
        const clampedBarHeight = Math.min(barHeight, maxBarHeight);

        // Calculate color based on the frequency data
        const red = Math.min(dataArray[i] + 50, 255); // Limit red component to max 255
        const green = 250 - (dataArray[i] * 0.5); // Adjust green component based on frequency
        const blue = 150; // Static blue component

        canvasCtx.fillStyle = `rgb(${red},${green},${blue})`;
        canvasCtx.fillRect(x, canvas.height - clampedBarHeight, barWidth, clampedBarHeight);

        x += barWidth + 1;
    }

    updateBackgroundCircles();
}




// function draw() {
//     requestAnimationFrame(draw);

//     if (!analyser) return;

//     analyser.getByteFrequencyData(dataArray);

//     canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

//     const barWidth = (canvas.width / bufferLength) * 2.5;
//     let x = 0;

//     for (let i = 0; i < bufferLength; i++) {
//         const targetBarHeight = dataArray[i] / 2;
//         const easingSpeed = 0.1; // Increased easing speed for faster animation

//         // Smooth the bar transition using easing
//         barHeights[i] += (targetBarHeight - barHeights[i]) * easingSpeed;

//         const barHeight = barHeights[i];

//         const red = barHeight + 25;
//         const green = 250 * (i / bufferLength);
//         const blue = 50;

//         canvasCtx.fillStyle = `rgb(${red},${green},${blue})`;
//         canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

//         x += barWidth + 1;
//     }

//     updateBackgroundCircles();
// }

function generateBackgroundCircles() {
    backgroundContainer.innerHTML = ''; // Clear previous circles
    for (let i = 0; i < 10; i++) {
        const circle = document.createElement('div');
        circle.classList.add('background-circle');
        backgroundContainer.appendChild(circle);

        // Randomize size and initial position
        const size = Math.random() * 150 + 50;
        circle.style.width = `${size}px`;
        circle.style.height = `${size}px`;
        circle.style.top = `${Math.random() * 100}%`;
        circle.style.left = `${Math.random() * 100}%`;
    }
}

// function updateBackgroundCircles() {
//     const circles = document.querySelectorAll
//     ('.background-circle'); for (let i = 0; i < circles.length; i++) { const circle = circles[i]; const frequency = dataArray[i % bufferLength];
//             // Adjust size based on frequency
//             const newSize = frequency / 1.2; // Faster size change
//             circle.style.width = `${newSize + 50}px`;
//             circle.style.height = `${newSize + 50}px`;
        
//             // Change color dynamically
//             circle.style.background = `rgba(${frequency}, ${250 - frequency}, 255, 0.3)`;
//         }
// }

function updateBackgroundCircles() {
    const circles = document.querySelectorAll('.background-circle');
    for (let i = 0; i < circles.length; i++) {
        const circle = circles[i];
        const frequency = dataArray[i % bufferLength];
        // Adjust size based on frequency
        const newSize = frequency / 1.2; // Faster size change
        circle.style.width = `${newSize + 50}px`;
        circle.style.height = `${newSize + 50}px`;
        
        // Change color dynamically with lighter tones
        const hue = frequency;
        circle.style.background = `hsla(${hue}, 80%, 70%, 0.5)`; // Lighter color with more saturation
    }
}
