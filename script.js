const canvas = document.getElementById('avatarCanvas');
const ctx = canvas.getContext('2d');
const layers = ['background', 'base', 'headwear', 'eyebrows', 'mustache', 'clothes'];

const presetLimits = {
    background: 1,
    headwear: 1,
    eyebrows: 1,
    mustache: 1,
    clothes: 1
};

const presets = {
    background: 1,
    headwear: 1,
    eyebrows: 1,
    mustache: 1,
    clothes: 1
};

const imageCache = {};
const baseImageSrc = 'images/base/base.png';

async function loadImage(part, value) {
    const src = part === 'base' ? baseImageSrc : `images/${part}/${value}.png`;
    if (imageCache[src]) return imageCache[src];
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = src;
        img.onload = () => {
            imageCache[src] = img;
            resolve(img);
        };
        img.onerror = () => {
            console.error(`Не удалось загрузить изображение для ${part}: ${src}`);
            reject(new Error(`Не удалось загрузить изображение для ${part}: ${src}`));
        };
    });
}

async function drawAvatar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const layer of layers) {
        try {
            const img = await loadImage(layer, presets[layer]);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        } catch (error) {
            console.error(`Ошибка при отрисовке слоя ${layer}:`, error);
        }
    }
}

function changePreset(part, delta) {
    const newValue = presets[part] + delta;
    if (newValue >= 1 && newValue <= presetLimits[part]) {
        presets[part] = newValue;
        document.getElementById(`${part}Preset`).textContent = presets[part];
        drawAvatar();
    }
}

function randomizeAvatar() {
    for (const part in presets) {
        presets[part] = Math.floor(Math.random() * presetLimits[part]) + 1;
        document.getElementById(`${part}Preset`).textContent = presets[part];
    }
    drawAvatar();
}

async function downloadAvatar() {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 1200;
    tempCanvas.height = 1200;
    const tempCtx = tempCanvas.getContext('2d');

    for (const layer of layers) {
        try {
            const img = await loadImage(layer, presets[layer]);
            tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
        } catch (error) {
            console.error(`Ошибка при отрисовке слоя ${layer}:`, error);
        }
    }

    tempCanvas.toBlob(blob => {
        const link = document.createElement('a');
        link.download = '$SAYO.png';
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
    }, 'image/png');
}

window.onload = async () => {
    for (const part in presets) {
        document.getElementById(`${part}Preset`).textContent = presets[part];
    }
    drawAvatar();
};
