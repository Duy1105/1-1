const audioElement = document.getElementById('audio');
const idInput = document.getElementById('idInput');
const playButton = document.getElementById('playButton');
const randomButton = document.getElementById('randomButton');
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

// Sự kiện cho nút phát nhạc
playButton.addEventListener('click', () => {
  const id = idInput.value.trim();
  if (id) {
    playMusicById(id);
  }
});

// Sự kiện cho nút phát ngẫu nhiên
randomButton.addEventListener('click', playRandom);

// Sự kiện cho nút phát ngẫu nhiên liên tiếp
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

  // Thông báo trước 10 giây để gia hạn
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

  showSleepButtons();
}

// Hàm gia hạn thêm chế độ ngủ
function extendSleepMode(extraMinutes) {
  clearTimeout(sleepTimer);
  clearTimeout(warningTimer);

  sleepTimeRemaining += extraMinutes * 60000;

  // Thiết lập lại sleepTimer và warningTimer
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

  // Thông báo gia hạn thành công
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

// Đăng ký Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker đã được đăng ký với phạm vi: ', registration.scope);
      })
      .catch(error => {
        console.error('Đăng ký Service Worker thất bại: ', error);
      });
  });
}

// Thêm Background Sync khi cần
async function addNewSongs(links) {
  // Gửi yêu cầu đến server hoặc xử lý bài hát ở đây

  // Khi bạn muốn đồng bộ hóa với Background Sync
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('syncNewSongs');
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }
}
