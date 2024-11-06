document.addEventListener('DOMContentLoaded', function () {
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.classList.toggle('dark-mode', isDarkMode);
    document.addEventListener('DOMContentLoaded', function () {
        const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.classList.toggle('dark-mode', isDarkMode);
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
                    audioPlayer.style.display = 'block';
                    audioPlayer.load();
                    audioPlayer.play();
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
                const randomId = keys[Math.floor(Math.random() * keys.length)];
                const songLink = data[randomId];
                const audioPlayer = document.getElementById('audioPlayer');
                const audioSource = document.getElementById('audioSource');

                if (songLink) {
                    audioSource.src = songLink;
                    audioPlayer.style.display = 'block';
                    audioPlayer.load();
                    audioPlayer.play();
                } else {
                    alert("Không tìm thấy bài hát với ID ngẫu nhiên.");
                }
            })
            .catch(error => console.error("Error loading random song:", error));
    });
});
