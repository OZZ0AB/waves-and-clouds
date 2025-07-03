const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// For pixelated effect
const offscreenCanvas = document.createElement('canvas');
const offscreenCtx = offscreenCanvas.getContext('2d');
const pixelSize = 4;
offscreenCanvas.width = canvas.width / pixelSize;
offscreenCanvas.height = canvas.height / pixelSize;
ctx.imageSmoothingEnabled = false;
offscreenCtx.imageSmoothingEnabled = false;

// Image loading
const boatImage = new Image();
const fishermanIdleSheet = new Image();
let imagesLoaded = 0;

boatImage.src = 'fishing_game_assets/3 Objects/Boat.png';
fishermanIdleSheet.src = 'fishing_game_assets/1 Fisherman/Fisherman_idle.png';

boatImage.onload = imageLoaded;
fishermanIdleSheet.onload = imageLoaded;

function imageLoaded() {
    imagesLoaded++;
    if (imagesLoaded === 2) {
        update();
    }
}

const boat = {
    x: 40,
    y: 50,
    width: 32,
    height: 16,
};

const fisherman = {
    spriteWidth: 32,
    spriteHeight: 32,
    renderWidth: 20,
    renderHeight: 20,
    x: 0,
    y: 0,
};

// Ocean properties
const ocean = {
    y: 75,
    height: 50,
    color: '#005f73',
    waveAmplitude: 3,
    waveFrequency: 0.05,
    waveSpeed: 0.05,
    waveOffset: 0
};

// Cloud properties
const clouds = [];

function createCloud() {
    clouds.push({
        x: offscreenCanvas.width,
        y: Math.random() * (ocean.y - 20),
        width: Math.random() * 30 + 20,
        height: Math.random() * 10 + 5,
        speed: Math.random() * 0.2 + 0.1
    });
}

function drawBoat() {
    // Rounding coordinates to prevent sub-pixel rendering blur
    offscreenCtx.drawImage(boatImage, Math.round(boat.x), Math.round(boat.y), boat.width, boat.height);
}

function drawFisherman() {
    const frameX = 0;

    // Rounding coordinates to prevent sub-pixel rendering blur
    fisherman.x = Math.round(boat.x + (boat.width / 2) - (fisherman.renderWidth / 2));
    fisherman.y = Math.round(boat.y - fisherman.renderHeight + 4);

    // Draw the first frame
    offscreenCtx.drawImage(
        fishermanIdleSheet,
        frameX, 0, // Source x, y
        fisherman.spriteWidth, fisherman.spriteHeight, // Source width, height
        fisherman.x, fisherman.y, // Destination x, y
        fisherman.renderWidth, fisherman.renderHeight // Destination width, height
    );
}

function drawOcean() {
    offscreenCtx.fillStyle = ocean.color;
    offscreenCtx.fillRect(0, ocean.y, offscreenCanvas.width, offscreenCanvas.height);

    // Wavy effect
    offscreenCtx.beginPath();
    offscreenCtx.moveTo(0, ocean.y);

    for (let x = 0; x < offscreenCanvas.width; x++) {
        const y = ocean.y + Math.sin(x * ocean.waveFrequency + ocean.waveOffset) * ocean.waveAmplitude;
        offscreenCtx.lineTo(x, y);
    }

    offscreenCtx.lineTo(offscreenCanvas.width, offscreenCanvas.height);
    offscreenCtx.lineTo(0, offscreenCanvas.height);
    offscreenCtx.closePath();
    offscreenCtx.fillStyle = '#0077b6';
    offscreenCtx.fill();

    ocean.waveOffset += ocean.waveSpeed;
}

function drawSky() {
    const gradient = offscreenCtx.createLinearGradient(0, 0, 0, ocean.y);
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(1, '#fff');
    offscreenCtx.fillStyle = gradient;
    offscreenCtx.fillRect(0, 0, offscreenCanvas.width, ocean.y);
}

function drawClouds() {
    offscreenCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (const cloud of clouds) {
        offscreenCtx.fillRect(cloud.x, cloud.y, cloud.width, cloud.height);
    }
}

function update() {
    // --- Movement Logic ---
    const waveY = ocean.y + Math.sin(boat.x * ocean.waveFrequency + ocean.waveOffset) * ocean.waveAmplitude;
    boat.y = waveY - boat.height + 2;

    // --- Cloud Logic ---
    if (Math.random() < 0.01) {
        createCloud();
    }

    for (let i = clouds.length - 1; i >= 0; i--) {
        const cloud = clouds[i];
        cloud.x -= cloud.speed;
        if (cloud.x + cloud.width < 0) {
            clouds.splice(i, 1);
        }
    }

    // --- Drawing --- 
    offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
    drawSky();
    drawClouds();
    drawOcean();
    drawBoat();
    drawFisherman();

    // Scale up to main canvas for pixelated effect
    ctx.drawImage(offscreenCanvas, 0, 0, canvas.width, canvas.height);

    requestAnimationFrame(update);
}

// Handle image loading errors
boatImage.onerror = () => {
    console.error('Error: Could not load boat image.');
};
fishermanIdleSheet.onerror = () => {
    console.error('Error: Could not load fisherman idle sheet.');
};