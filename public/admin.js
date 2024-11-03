// Các biến để lấy các phần tử từ DOM
const newSongLinks = document.getElementById('newSongLinks'); // Nhận nhiều link
const addSongsButton = document.getElementById('addSongsButton'); // Nút thêm nhiều bài hát
const toggleFileButton = document.getElementById('toggleFileButton');
const musicLinksDiv = document.getElementById('musicLinks');
const alertMessage = document.getElementById('alertMessage');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('loginButton');
const loginMessage = document.getElementById('loginMessage');
const adminContent = document.getElementById('adminContent');
const loginForm = document.getElementById('loginForm');

// Thông tin đăng nhập đúng
const correctUsername = "duy11";
const correctPassword = "1105@";

// Kiểm tra đăng nhập
loginButton.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (username === correctUsername && password === correctPassword) {
        // Hiển thị nội dung quản trị
        loginForm.style.display = 'none';
        adminContent.style.display = 'block';
        loginMessage.style.display = 'none';
    } else {
        // Thông báo lỗi đăng nhập
        loginMessage.textContent = "Tài khoản hoặc mật khẩu không chính xác.";
        loginMessage.style.display = 'block';
    }
});

let isFileVisible = false;

// Hiển thị thông báo phản hồi
function showAlert(message, isError = false) {
    alertMessage.textContent = message;
    alertMessage.classList.toggle('error', isError);
    alertMessage.style.display = 'block';
    alertMessage.style.opacity = '1';

    setTimeout(() => {
        alertMessage.style.opacity = '0';
        setTimeout(() => alertMessage.style.display = 'none', 300);
    }, 3000);
}

// Thêm nhiều bài hát mới
addSongsButton.addEventListener('click', () => {
    const links = newSongLinks.value.trim().split(/,|\n/); // Chia nhiều link theo dấu phẩy hoặc xuống dòng
    const validLinks = links.map(link => link.trim()).filter(link => link); // Loại bỏ khoảng trắng và link rỗng

    if (validLinks.length > 0) {
        fetch('/addSongs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ links: validLinks }),
        })
        .then(response => response.json())
        .then(data => {
            showAlert(data.message, !data.success);
            newSongLinks.value = ''; // Xóa textarea sau khi thêm
        })
        .catch(error => {
            console.error("Error adding songs:", error);
            showAlert("Lỗi khi thêm bài hát.", true);
        });
    } else {
        showAlert("Vui lòng nhập ít nhất một link MP3 hợp lệ", true);
    }
});

// Hiển thị hoặc ẩn file JSON khi nhấn nút
toggleFileButton.addEventListener('click', () => {
    if (isFileVisible) {
        musicLinksDiv.innerHTML = '';  // Xóa nội dung khi ẩn
        musicLinksDiv.classList.remove('visible');
        toggleFileButton.innerText = 'Hiển thị file music_links.json';
    } else {
        fetch('music_links.json')
            .then(response => response.json())
            .then(data => {
                musicLinksDiv.innerHTML = '<h3>Nội dung của music_links.json:</h3>';
                Object.keys(data).forEach(key => {
                    musicLinksDiv.innerHTML += `<p>ID: ${key} - Link: ${data[key]}</p>`;
                });
                musicLinksDiv.classList.add('visible');
                toggleFileButton.innerText = 'Ẩn file music_links.json';
            })
            .catch(error => {
                console.error("Error loading music_links.json:", error);
                showAlert("Không thể tải file nhạc.", true);
            });
    }
    isFileVisible = !isFileVisible;
});
