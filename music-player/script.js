const wheel = document.querySelector('.wheel-box');
const centerButton = document.querySelector('.wheel-center');
const menuButton = document.querySelector('.menu');
const nextButton = document.querySelector('.next'); 
const prevButton = document.querySelector('.prev');
const screens = document.querySelectorAll('.screen');
const audio = document.getElementById('audio-player');
const progressBar = document.getElementById('progress-bar');
let currentItems = document.querySelectorAll('#main-menu li');
let currentActive = 0;  
let musicIndex = 0;      
let isDragging = false;
let lastAngle = null;
let angleAccumulator = 0;
const sensitivity = 15;
const languageData = {
    'English': {
        menu: ['Music', 'Photos', 'Extras', 'Settings'],
        settings: ['About', 'User', 'Appearance', 'Language'],
        appearance: ['Light Mode', 'Dark Mode'],
        languages: ['English', 'Español'],
        gallery: 'Gallery',
        empty: 'Currently no photos added'
    },
    'Español': {
        menu: ['Música', 'Fotos', 'Extras', 'Ajustes'],
        settings: ['Acerca de', 'Usuario', 'Apariencia', 'Idioma'],
        appearance: ['Modo Claro', 'Modo Oscuro'],
        languages: ['Inglés', 'Español'],
        gallery: 'Galería',
        empty: 'Actualmente no hay fotos'
    }
};
function updateTime() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    document.getElementById("clock").innerText = `${hours}:${minutes}`;
}
updateTime();
setInterval(updateTime, 1000);

function showScreen(screenId) {
    screens.forEach(s => s.classList.remove('active-screen'));
    const newScreen = document.getElementById(screenId);
    newScreen.classList.add('active-screen');
    
    const newItems = newScreen.querySelectorAll('li');
    if (newItems.length > 0) {
        currentItems = newItems;
        currentActive = 0; 
        currentItems.forEach(item => item.classList.remove('active'));
        currentItems[0].classList.add('active');
    }
}
function updateSelection(direction) {
    if (currentItems.length === 0) return;
    currentItems[currentActive].classList.remove('active');
    currentActive = (currentActive + direction + currentItems.length) % currentItems.length;
    currentItems[currentActive].classList.add('active');
}
function playSelectedSong() {
    const musicItems = document.querySelectorAll('#music-list li');
    if (musicItems.length === 0) return;

    const selectedSong = musicItems[musicIndex].innerText;
    const albumArt = document.getElementById('album-art');
    const songName = document.getElementById('song-name');
    const artistName = document.getElementById('artist-name');

    const songData = {
        "Real Gone": { src: "real gone.mp3", art: "realGonePoster.jpg", artist: "Sheryl Crow" },
        "Little Dark Age": { src: "Little dark age.mp3", art: "LDA.avif", artist: "MGMT" },
        "Cheri Cheri Lady": { src: "CCL.mp3", art: "CCLp.webp", artist: "Modern Talking" },
        "Saturday Nights alright for Fighting": { src: "SNAF.mp3", art: "nickelbackPoster.webp", artist: "Nickelback" }
    };
    const data = songData[selectedSong];
    if (data) {
        audio.src = data.src;
        albumArt.src = data.art;
        songName.innerText = selectedSong;
        artistName.innerText = data.artist;
    }
    showScreen('playback-screen');
    audio.play();
}
function applyLanguage(lang) {
    const data = languageData[lang];
    document.querySelectorAll('#menu-list li').forEach((li, i) => li.innerText = data.menu[i]);
    document.querySelectorAll('#settings-list li').forEach((li, i) => li.innerText = data.settings[i]);
    document.querySelectorAll('#appearance-list li').forEach((li, i) => li.innerText = data.appearance[i]);
    document.querySelectorAll('#language-list li').forEach((li, i) => li.innerText = data.languages[i]);
    document.getElementById('gallery-title').innerText = data.gallery;
    document.getElementById('gallery-empty').innerText = data.empty;
}
wheel.addEventListener('mousedown', (e) => {
    isDragging = true;
    const rect = wheel.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    lastAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
});
window.addEventListener('mouseup', () => {
    isDragging = false;
    lastAngle = null;
});
wheel.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const rect = wheel.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    let angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    if (lastAngle !== null) {
        let deltaAngle = angle - lastAngle;
        if (deltaAngle > 180) deltaAngle -= 360;
        if (deltaAngle < -180) deltaAngle += 360;
        angleAccumulator += deltaAngle;
        if (Math.abs(angleAccumulator) >= sensitivity) {
            updateSelection(angleAccumulator > 0 ? 1 : -1);
            angleAccumulator = 0; 
        }
    }
    lastAngle = angle;
});
centerButton.addEventListener('click', () => {
    const activeScreen = document.querySelector('.active-screen');
    
    if (activeScreen.id === 'main-menu') {
        if (currentActive === 0) showScreen('music-screen');
        else if (currentActive === 1) showScreen('photos-screen');
        else if (currentActive === 3) showScreen('setting-screen');
    } 
    else if (activeScreen.id === 'music-screen') {
        musicIndex = currentActive; 
        playSelectedSong();
    }
    else if (activeScreen.id === 'playback-screen') {
        if (audio.paused) audio.play();
        else audio.pause();
    }
    else if (activeScreen.id === 'setting-screen') {
        if (currentActive === 2) showScreen('appearance-screen');
        if (currentActive === 3) showScreen('language-screen');
    }
    else if (activeScreen.id === 'appearance-screen') {
        if (currentActive === 0) document.querySelector('.main-box').classList.remove('dark-mode');
        if (currentActive === 1) document.querySelector('.main-box').classList.add('dark-mode');
    }
    else if (activeScreen.id === 'language-screen') {
        applyLanguage(currentActive === 0 ? 'English' : 'Español');
    }
});
nextButton.addEventListener('click', () => {
    const musicItems = document.querySelectorAll('#music-list li');
    musicIndex = (musicIndex + 1) % musicItems.length;
    playSelectedSong();
});
prevButton.addEventListener('click', () => {
    const musicItems = document.querySelectorAll('#music-list li');
    musicIndex = (musicIndex - 1 + musicItems.length) % musicItems.length;
    playSelectedSong();
});
menuButton.addEventListener('click', () => {
    showScreen('main-menu');
});
audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        const progress = (audio.currentTime / audio.duration) * 100;
        if (progressBar) progressBar.style.width = `${progress}%`;
    }
});