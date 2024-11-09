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

// Đường dẫn hình ảnh sẽ hiển thị trong thông báo trung tâm điều khiển
const artworkUrl = 'https://i.imgur.com/LS60rDX.jpeg';

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

function updateSongCount() {
  songCount.textContent = `Số bài hát hiện có: ${Object.keys(musicLinks).length}`;
}

function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}

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

function playMusicFromLink(link) {
  if (isValidURL(link)) {
    audioElement.src = link;
    audioElement.play();
  } else {
    Swal.fire('Lỗi!', 'Link không hợp lệ!', 'error');
  }
}

function playRandomLoop() {
  isRandomLooping = true;
  playMusicById(Object.keys(musicLinks)[Math.floor(Math.random() * Object.keys(musicLinks).length)]);
}

function preloadNextRandomSong() {
  const keys = Object.keys(musicLinks);
  const randomId = keys[Math.floor(Math.random() * keys.length)];
  nextAudioElement.src = musicLinks[randomId];
}

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
  const inputValue = idInput.value.trim();
  if (isValidURL(inputValue)) {
    playMusicFromLink(inputValue);
  } else if (inputValue) {
    playMusicById(inputValue);
  }
  idInput.value = '';
});

randomLoopButton.addEventListener('click', () => {
  isRandomLooping = true;
  playRandomLoop();
});

idInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    const inputValue = idInput.value.trim();

    if (isValidURL(inputValue)) {
      playMusicFromLink(inputValue);
    } else if (inputValue) {
      playMusicById(inputValue);
    }

    idInput.value = '';
  }
});

audioElement.style.display = 'none';
audioElement.addEventListener('play', () => {
  audioElement.style.display = 'block';
});

// Media Session API để hiển thị điều khiển cơ bản ở trung tâm điều khiển
if ('mediaSession' in navigator) {
  navigator.mediaSession.metadata = new MediaMetadata({
    title: document.title, // Sử dụng tiêu đề của trang web
    artwork: [
      { src: artworkUrl, sizes: '512x512', type: 'image/jpeg' }
    ]
  });

  navigator.mediaSession.setActionHandler('play', () => audioElement.play());
  navigator.mediaSession.setActionHandler('pause', () => audioElement.pause());
  navigator.mediaSession.setActionHandler('previoustrack', () => {
    // Xử lý chuyển bài trước (nếu cần)
  });
  navigator.mediaSession.setActionHandler('nexttrack', () => {
    if (isRandomLooping) {
      playMusicById(Object.keys(musicLinks)[Math.floor(Math.random() * Object.keys(musicLinks).length)]);
    }
  });
}

// Chế độ ngủ
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

function cancelSleepMode() {
  clearTimeout(sleepTimer);
  clearTimeout(warningTimer);
  Swal.fire('Thông báo', 'Chế độ ngủ đã được hủy.', 'success');
  hideSleepButtons();
}

function showSleepButtons() {
  cancelSleepTimerButton.style.display = 'inline-block';
}

function hideSleepButtons() {
  cancelSleepTimerButton.style.display = 'none';
}

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

cancelSleepTimerButton.addEventListener('click', () => {
  cancelSleepMode();
});
