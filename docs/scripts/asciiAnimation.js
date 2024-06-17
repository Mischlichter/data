const canvas = document.getElementById('asciiCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    adjustFadeVoidProportions();
}

const fontSize = 18;
const gridWidth = 11;  // Width of grid spaces between letters
const gridHeight = 28; // Height of grid spaces between letters
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
let columns, rows, grid, centerX;
let voidWidth; // Width of the vertical void
let fadeWidth; // Width of the fade transition area
const speed = 0.75;     // Speed of letter change (0.95 for slow, 0.5 for faster)
let animationFrameId;
let stopTimeoutId;      // Timeout ID for the delayed stop
const colors = [
    { r: 0, g: 255, b: 204 },  // Green hue (#00ffcc)
    { r: 128, g: 0, b: 128 },  // Purple
    { r: 255, g: 165, b: 0 },  // Warm yellow/orange
    blendColors({ r: 0, g: 255, b: 204 }, { r: 128, g: 0, b: 128 }) // Blended color
];
const fps = 30;
const frameInterval = 150 / fps;
let lastFrameTime = 0;

function getRandomLetter() {
    return letters.charAt(Math.floor(Math.random() * letters.length));
}

function initializeGrid() {
    columns = Math.ceil(canvas.width / gridWidth); // Use Math.ceil to ensure coverage
    rows = Math.ceil(canvas.height / gridHeight);  // Use Math.ceil to ensure coverage
    const rowColors = Array.from({ length: rows }, () => getRandomBaseColor());

    grid = Array.from({ length: rows }, (row, rowIndex) => Array.from({ length: columns }, () => ({
        letter: getRandomLetter(),
        color: rowColors[rowIndex],
        offset: Math.random() * 1000,
        pulseLength: 2000 + Math.random() * 4000, // Random pulse length between 2000 and 6000ms
        darken: Math.random() < 0.1 // 10% chance to darken the entire row
    })));
    centerX = canvas.width / 2;
}

function getRandomBaseColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

function blendColors(color1, color2) {
    return {
        r: Math.round((color1.r + color2.r) / 2),
        g: Math.round((color1.g + color2.g) / 2),
        b: Math.round((color1.b + color2.b) / 2)
    };
}

function adjustBrightness(color, factor) {
    return {
        r: Math.min(255, Math.round(color.r * factor)),
        g: Math.min(255, Math.round(color.g * factor)),
        b: Math.min(255, Math.round(color.b * factor))
    };
}

function getColor(cell) {
    const frequency = 2 * Math.PI / cell.pulseLength; // Frequency for brightness change
    let brightnessFactor = 0.5 + Math.sin(frequency * (Date.now() + cell.offset)) * 0.5;
    
    // Darken the entire row if the darken property is true
    if (cell.darken) {
        brightnessFactor *= 0.5; // Adjust this factor to control the darkness
    }

    const adjustedColor = adjustBrightness(cell.color, brightnessFactor);

    return `rgb(${adjustedColor.r}, ${adjustedColor.g}, ${adjustedColor.b})`;
}

function draw(timestamp) {
    if (timestamp < lastFrameTime + frameInterval) {
        animationFrameId = requestAnimationFrame(draw);
        return;
    }
    lastFrameTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${fontSize}px 'JetBrainsMono-Bold'`;
    ctx.textBaseline = 'top';

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            const x = col * gridWidth;
            const y = row * gridHeight;
            const cell = grid[row][col];
            const distance = Math.abs(x - centerX);

            if (distance > voidWidth / 2) {
                const alpha = Math.min(1, (distance - voidWidth / 2) / fadeWidth);
                ctx.fillStyle = getColor(cell);
                ctx.globalAlpha = alpha; // Set the global alpha to create the fade effect
                ctx.fillText(cell.letter, x, y);
                ctx.globalAlpha = 1; // Reset the global alpha

                if (Math.random() > speed) {
                    cell.letter = getRandomLetter();
                    cell.offset = Math.random() * 1000;
                    cell.pulseLength = 2000 + Math.random() * 4000; // Random pulse length between 2000 and 6000ms
                }
            }
        }
    }

    animationFrameId = requestAnimationFrame(draw);
}

function start() {
    if (stopTimeoutId) {
        clearTimeout(stopTimeoutId); // Cancel any pending stop
        stopTimeoutId = null;
    }
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    resizeCanvas();
    initializeGrid();
    draw(performance.now());
}

function stop() {
    if (animationFrameId) {
        stopTimeoutId = setTimeout(() => {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            stopTimeoutId = null;
        }, 1000); // Stop the animation 1 second after the stop signal
    }
}

function adjustFadeVoidProportions() {
    const viewportWidth = window.innerWidth;
    voidWidth = viewportWidth * 0.111;  // Adjust this value to change the proportion
    fadeWidth = viewportWidth * 1.7;  // Adjust this value to change the proportion
}

// Ensure the canvas resizes and grid reinitializes when the window is resized
window.addEventListener('resize', () => {
    if (animationFrameId) {
        resizeCanvas();
        initializeGrid();
    }
});

// Expose start and stop functions to the global scope for external control
window.startAsciiAnimation = start;
window.stopAsciiAnimation = stop;
