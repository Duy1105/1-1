const audioElement = document.getElementById('audio');
const idInput = document.getElementById('idInput');
const playButton = document.getElementById('playButton');
const randomButton = document.getElementById('randomButton');
const randomLoopButton = document.getElementById('randomLoopButton');
const songCount = document.getElementById('songCount');

fetch('music_links.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    window.musicLinks = data; // Lưu trữ các liên kết nhạc vào biến toàn cục
    updateSongCount(); // Cập nhật số lượng bài hát
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
  } else {
    alert("ID không hợp lệ");
  }
}

// Phát ngẫu nhiên bài hát
function playRandom() {
  const keys = Object.keys(musicLinks); // Lấy danh sách các ID bài hát
  const randomId = keys[Math.floor(Math.random() * keys.length)]; // Chọn một ID ngẫu nhiên
  playMusicById(randomId); // Phát bài hát theo ID ngẫu nhiên
}

// Phát ngẫu nhiên liên tiếp
function playRandomLoop() {
  playRandom();
  audioElement.addEventListener('ended', playRandom);
}

playButton.addEventListener('click', () => {
  const id = idInput.value.trim();
  if (id) {
    playMusicById(id); // Gọi hàm phát nhạc theo ID người dùng nhập
  }
});

randomButton.addEventListener('click', playRandom);

randomLoopButton.addEventListener('click', playRandomLoop);

// Thêm sự kiện cho nhập ID
idInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault(); // Ngăn chặn hành động mặc định của phím Enter
    playMusicById(idInput.value.trim()); // Gọi hàm phát nhạc theo ID
  }
});

// Ẩn thanh audio ban đầu
audioElement.style.display = 'none';
audioElement.addEventListener('play', () => {
  audioElement.style.display = 'block'; // Hiện thanh audio khi phát nhạc
});

audioElement.addEventListener('ended', () => {
  audioElement.style.display = 'none'; // Ẩn thanh audio khi bài hát kết thúc
});
