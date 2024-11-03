document.addEventListener('DOMContentLoaded', function () {
    // Tự động đồng bộ chế độ sáng/tối
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.classList.toggle('dark-mode', isDarkMode);

    // Chuyển đổi chế độ tối/sáng
    document.addEventListener('DOMContentLoaded', function () {
        const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.classList.toggle('dark-mode', isDarkMode);

        // Lắng nghe sự thay đổi chế độ màu
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            document.body.classList.toggle('dark-mode', e.matches);
        });
    });


    // Phát bài hát theo ID
    document.getElementById('playSongButton').addEventListener('click', function () {
        const songId = document.getElementById('songIdInput').value;
        fetch('/api/music')
            .then(response => response.json())
            .then(data => {
                const songLink = data[songId];
                const audioPlayer = document.getElementById('audioPlayer');
                const audioSource = document.getElementById('audioSource');

                if (songLink) {
                    audioSource.src = songLink;
                    audioPlayer.style.display = 'block'; // Hiện thanh audio
                    audioPlayer.load();
                    audioPlayer.play(); // Phát bài hát
                } else {
                    alert("Không tìm thấy bài hát với ID này.");
                }
            })
            .catch(error => console.error("Error loading song:", error));
    });

    // Chức năng phát ngẫu nhiên
    document.getElementById('randomPlayButton').addEventListener('click', function () {
        fetch('/api/music')
            .then(response => response.json())
            .then(data => {
                const keys = Object.keys(data);
                const randomId = keys[Math.floor(Math.random() * keys.length)]; // Lấy ID ngẫu nhiên
                const songLink = data[randomId];
                const audioPlayer = document.getElementById('audioPlayer');
                const audioSource = document.getElementById('audioSource');

                if (songLink) {
                    audioSource.src = songLink;
                    audioPlayer.style.display = 'block'; // Hiện thanh audio
                    audioPlayer.load();
                    audioPlayer.play(); // Phát bài hát ngẫu nhiên
                } else {
                    alert("Không tìm thấy bài hát với ID ngẫu nhiên.");
                }
            })
            .catch(error => console.error("Error loading random song:", error));
    });
});
