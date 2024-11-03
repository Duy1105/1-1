const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.port || 8080;

app.use(express.json());

app.use((req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log(`IP người dùng truy cập: ${ip}`);
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

// API lấy link nhạc
app.get('/music_links.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'music_links.json'));
});

// API thêm một bài hát
app.post('/addSong', (req, res) => {
    const newLink = req.body.link;

    fs.readFile(path.join(__dirname, 'public', 'music_links.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Không thể đọc file" });
        }

        const musicLinks = JSON.parse(data);
        const newId = Object.keys(musicLinks).length + 1;
        musicLinks[newId] = newLink;
fs.writeFile(path.join(__dirname, 'public', 'music_links.json'), JSON.stringify(musicLinks, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ message: "Không thể ghi file" });
            }
            res.json({ message: "Bài hát đã được thêm thành công!" });
        });
    });
});

// API thêm nhiều bài hát
app.post('/addSongs', (req, res) => {
    const { links } = req.body;
    if (!Array.isArray(links) || links.length === 0) {
        return res.status(400).json({ message: "Vui lòng cung cấp ít nhất một link nhạc hợp lệ." });
    }
    fs.readFile(path.join(__dirname, 'public', 'music_links.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Không thể đọc file" });
        }

        const musicLinks = JSON.parse(data);
        let newId = Object.keys(musicLinks).length + 1;

        // Lặp qua các link và thêm từng bài hát
        links.forEach(link => {
            musicLinks[newId] = link;
            newId++;
        });

        // Ghi lại vào file
        fs.writeFile(path.join(__dirname, 'public', 'music_links.json'), JSON.stringify(musicLinks, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ message: "Không thể ghi file" });
            }
            res.json({ message: "Các bài hát đã được thêm thành công!" });
        });
    });
});

// Bắt đầu server
app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});
