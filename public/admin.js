const newSongLinks = document.getElementById('newSongLinks');
const addSongsButton = document.getElementById('addSongsButton'); 
const toggleFileButton = document.getElementById('toggleFileButton');
const musicLinksDiv = document.getElementById('musicLinks');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('loginButton');
const loginMessage = document.getElementById('loginMessage');
const adminContent = document.getElementById('adminContent');
const loginForm = document.getElementById('loginForm');

const correctUsername = "duy11";
const correctPassword = "1105@";

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
        Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: 'Tài khoản hoặc mật khẩu không chính xác.',
        });
    }
});

let isFileVisible = false;

// Thêm nhiều bài hát mới
addSongsButton.addEventListener('click', () => {
    const links = newSongLinks.value.trim().split(/,|\n/);
    const validLinks = links.map(link => link.trim()).filter(link => link);
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
            Swal.fire({
                icon: data.success ? 'success' : 'error',
                title: data.success ? 'Thành công!' : 'Lỗi!',
                text: data.message,
            });
            newSongLinks.value = ''; 
        })
        .catch(error => {
            console.error("Error adding songs:", error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: 'Lỗi khi thêm bài hát.',
            });
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: 'Vui lòng nhập ít nhất một link MP3 hợp lệ.',
        });
    }
});

// Hiển thị hoặc ẩn file JSON khi nhấn nút
toggleFileButton.addEventListener('click', () => {
    if (isFileVisible) {
        musicLinksDiv.innerHTML = '';  
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
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    text: 'Không thể tải file nhạc.',
                });
            });
    }
    isFileVisible = !isFileVisible;
});
