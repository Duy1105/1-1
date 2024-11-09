const audioElement = document.getElementById('audio');
const idInput = document.getElementById('idInput');
const playButton = document.getElementById('playButton');
const randomLoopButton = document.getElementById('randomLoopButton');
const songCount = document.getElementById('songCount');
const sleepTimerInput = document.getElementById('sleepTimerInput');
const setSleepTimerButton = document.getElementById('setSleepTimerButton');
const cancelSleepTimerButton = document.getElementById('cancelSleepTimerButton');
let nextAudioElement = new Audio();
let isRandomLooping = false;
let sleepTimer, warningTimer;
let sleepTimeRemaining;

fetch('music_links.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    window.musicLinks = data;
    updateSongCount();
  })
  .catch(error => {
    console.error("Error fetching music links:", error);
    Swal.fire('Lỗi!', 'Không thể tải danh sách bài hát.', 'error');
  });

// Cập nhật số lượng bài hát
function updateSongCount() {
  songCount.textContent = `Số bài hát hiện có: ${Object.keys(musicLinks).length}`;
}

// Kiểm tra nếu URL hợp lệ
function isValidURL(url) {
  try {
    new URL(url);  // Tạo một đối tượng URL từ chuỗi
    return true; // Nếu không có lỗi, URL hợp lệ
  } catch (_) {
    return false; // Nếu có lỗi, URL không hợp lệ
  }
}

// Phát nhạc theo ID
function playMusicById(id) {
  const link = musicLinks[id];
  if (link) {
    audioElement.src = link;
    audioElement.play();
    preloadNextRandomSong();
  } else {
    Swal.fire('Lỗi!', 'ID không hợp lệ', 'error');
  }
}

// Phát nhạc từ link người dùng nhập
function playMusicFromLink(link) {
  if (isValidURL(link)) {
    audioElement.src = link;
    audioElement.play();
  } else {
    Swal.fire('Lỗi!', 'Link không hợp lệ!', 'error');
  }
}

// Phát ngẫu nhiên liên tiếp
function playRandomLoop() {
  isRandomLooping = true;
  playMusicById(Object.keys(musicLinks)[Math.floor(Math.random() * Object.keys(musicLinks).length)]);
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

// Sự kiện cho nút phát nhạc
playButton.addEventListener('click', () => {
  const inputValue = idInput.value.trim(); // Nhập từ ô input
  if (isValidURL(inputValue)) {
    playMusicFromLink(inputValue); // Nếu là link hợp lệ
  } else if (inputValue) {
    playMusicById(inputValue); // Nếu là ID hợp lệ
  }

  idInput.value = '';  // Reset ô nhập ID bài hát hoặc link
});

// Sự kiện cho nút phát ngẫu nhiên liên tiếp
randomLoopButton.addEventListener('click', () => {
  isRandomLooping = true;
  playRandomLoop();
});

// Thêm sự kiện cho nhập ID hoặc link
idInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    const inputValue = idInput.value.trim(); // Nhập từ ô input

    if (isValidURL(inputValue)) {
      playMusicFromLink(inputValue); // Nếu là link hợp lệ
    } else if (inputValue) {
      playMusicById(inputValue); // Nếu là ID hợp lệ
    }

    idInput.value = '';  // Reset ô nhập ID bài hát hoặc link
  }
});

// Ẩn thanh audio ban đầu
audioElement.style.display = 'none';
audioElement.addEventListener('play', () => {
  audioElement.style.display = 'block';
});

// Hàm đặt chế độ ngủ
function setSleepMode(minutes) {
  clearTimeout(sleepTimer);
  clearTimeout(warningTimer);

  sleepTimeRemaining = minutes * 60000;

  sleepTimer = setTimeout(() => {
    audioElement.pause();
    Swal.fire({
      icon: 'info',
      title: 'Đã hết thời gian phát nhạc theo chế độ ngủ.',
      text: 'Nhạc đã dừng lại.',
      confirmButtonText: 'OK'
    });
    hideSleepButtons();
  }, sleepTimeRemaining);

  warningTimer = setTimeout(() => {
    Swal.fire({
      title: 'Đã hết thời gian phát nhạc theo chế độ ngủ.',
      icon: 'info',
      input: 'number',
      inputLabel: 'Nhập số phút gia hạn:',
      inputPlaceholder: 'Số phút',
      showCancelButton: true,
      confirmButtonText: 'Gia hạn',
      cancelButtonText: 'Hủy',
      preConfirm: (extraMinutes) => {
        if (!extraMinutes || isNaN(extraMinutes) || extraMinutes <= 0) {
          Swal.showValidationMessage('Vui lòng nhập số phút hợp lệ!');
          return false;
        }
        return extraMinutes;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const extraMinutes = parseInt(result.value, 10);
        extendSleepMode(extraMinutes);
      }
    });
  }, sleepTimeRemaining - 10000);

  showSleepButtons();
}

// Hàm gia hạn thêm chế độ ngủ
function extendSleepMode(extraMinutes) {
  clearTimeout(sleepTimer);
  clearTimeout(warningTimer);

  sleepTimeRemaining += extraMinutes * 60000;

  sleepTimer = setTimeout(() => {
    audioElement.pause();
    Swal.fire({
      icon: 'info',
      title: 'Đã hết thời gian phát nhạc theo chế độ ngủ.',
      text: 'Nhạc đã dừng lại.',
      confirmButtonText: 'OK'
    });
    hideSleepButtons();
  }, sleepTimeRemaining);

  warningTimer = setTimeout(() => {
    Swal.fire({
      title: 'Đã hết thời gian phát nhạc theo chế độ ngủ.',
      text: 'Nhạc đã dừng lại.',
      icon: 'info',
      input: 'number',
      inputLabel: 'Nhập số phút gia hạn:',
      inputPlaceholder: 'Số phút',
      showCancelButton: true,
      confirmButtonText: 'Gia hạn',
      cancelButtonText: 'Hủy',
      preConfirm: (extraMinutes) => {
        if (!extraMinutes || isNaN(extraMinutes) || extraMinutes <= 0) {
          Swal.showValidationMessage('Vui lòng nhập số phút hợp lệ!');
          return false;
        }
        return extraMinutes;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const extraMinutes = parseInt(result.value, 10);
        extendSleepMode(extraMinutes);
      }
    });
  }, sleepTimeRemaining - 10000);

  Swal.fire('Thành công!', `Chế độ ngủ đã được gia hạn thêm ${extraMinutes} phút.`, 'success');
}

// Hàm hủy chế độ ngủ
function cancelSleepMode() {
  clearTimeout(sleepTimer);
  clearTimeout(warningTimer);
  Swal.fire('Thông báo', 'Chế độ ngủ đã được hủy.', 'success');
  hideSleepButtons();
}

// Hiển thị nút hủy
function showSleepButtons() {
  cancelSleepTimerButton.style.display = 'inline-block';
}

// Ẩn các nút khi chế độ ngủ kết thúc hoặc bị hủy
function hideSleepButtons() {
  cancelSleepTimerButton.style.display = 'none';
}

// Sự kiện cho nút đặt chế độ ngủ
setSleepTimerButton.addEventListener('click', () => {
  const minutes = parseInt(sleepTimerInput.value, 10);

  if (isNaN(minutes) || minutes <= 0) {
    Swal.fire('Lỗi!', 'Vui lòng nhập số phút hợp lệ!', 'error');
    return;
  }

  setSleepMode(minutes);
  Swal.fire('Thông báo', `Nhạc sẽ dừng sau ${minutes} phút.`, 'success');
  sleepTimerInput.value = '';
});

// Sự kiện cho nút hủy chế độ ngủ
cancelSleepTimerButton.addEventListener('click', () => {
  cancelSleepMode();
});
