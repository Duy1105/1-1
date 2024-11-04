const audioElement = document.getElementById('audio');
const idInput = document.getElementById('idInput');
const playButton = document.getElementById('playButton');
const randomButton = document.getElementById('randomButton');
const randomLoopButton = document.getElementById('randomLoopButton');
const songCount = document.getElementById('songCount');

let nextAudioElement = new Audio();
let isRandomLooping = false;

// Đọc tệp music_links.json
fetch('music_links.json')
  .then(response => response.json())
  .then(data => {
    window.musicLinks = data;
    updateSongCount();
  })
  .catch(error => {
    console.error("Error fetching music links:", error);
    alert("Không thể tải danh sách bài hát.");
  });

// Cập nhật số lượng bài hát
function updateSongCount() {
  songCount.textContent = `Số bài hát hiện có: ${Object.keys(musicLinks).length}`;
}

// Phát nhạc theo ID
function playMusicById(id) {
  const link = musicLinks[id];
  if (link) {
    audioElement.src = link;
    audioElement.play();
    preloadNextRandomSong();
  } else {
    alert("ID không hợp lệ");
  }
}

// Phát ngẫu nhiên bài hát
function playRandom() {
  const keys = Object.keys(musicLinks);
  const randomId = keys[Math.floor(Math.random() * keys.length)];
  playMusicById(randomId);
}

// Phát ngẫu nhiên liên tiếp
function playRandomLoop() {
  isRandomLooping = true;
  playRandom();
}

// Tải sẵn bài hát tiếp theo ngẫu nhiên
function preloadNextRandomSong() {
  const keys = Object.keys(musicLinks);
  const randomId = keys[Math.floor(Math.random() * keys.length)];
  nextAudioElement.src = musicLinks[randomId];
}

// Khi bài hát hiện tại kết thúc
audioElement.addEventListener('ended', () => {
  if (isRandomLooping) {
    audioElement.src = nextAudioElement.src; 
    audioElement.play();
    preloadNextRandomSong(); 
  } else {
    audioElement.style.display = 'none';
  }
});

playButton.addEventListener('click', () => {
  const id = idInput.value.trim();
  if (id) {
    playMusicById(id);
  }
});

randomButton.addEventListener('click', playRandom);

randomLoopButton.addEventListener('click', () => {
  isRandomLooping = true;
  playRandomLoop();
});

// Thêm sự kiện cho nhập ID
idInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    playMusicById(idInput.value.trim());
  }
});

// Ẩn thanh audio ban đầu
audioElement.style.display = 'none';
audioElement.addEventListener('play', () => {
  audioElement.style.display = 'block';
});
