const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

// Lấy thông tin IP của máy chủ khi bắt đầu chạy server
axios.get('https://ipinfo.io/json')
    .then(response => {
        const data = response.data;
        console.log("Thông tin về IP của máy chủ:");
        console.log("| Địa chỉ IP |", data.ip);
        console.log("| Quốc gia   |", data.country);
        console.log("| Thành phố  |", data.city);
        console.log("| Nhà Mạng   |", data.org);
    })
    .catch(error => {
        console.log("Lỗi khi lấy thông tin IP:", error);
    });

// Ghi log IP người dùng truy cập (nếu cần)
app.use((req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log(`IP người dùng truy cập: ${ip}`);
    next();
});

// Cung cấp các tệp tĩnh từ thư mục 'public'
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

        links.forEach(link => {
            musicLinks[newId] = link;
            newId++;
        });

        fs.writeFile(path.join(__dirname, 'public', 'music_links.json'), JSON.stringify(musicLinks, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ message: "Không thể ghi file" });
            }
            res.json({ message: "Các bài hát đã được thêm thành công!" });
        });
    });
});

// API xóa một bài hát theo ID và tự động cập nhật lại ID
app.delete('/deleteSong/:id', (req, res) => {
    const songId = req.params.id;

    fs.readFile(path.join(__dirname, 'public', 'music_links.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Không thể đọc file" });
        }

        const musicLinks = JSON.parse(data);

        if (musicLinks[songId]) {
            // Xóa bài hát khỏi danh sách
            delete musicLinks[songId];

            // Cập nhật lại ID của các bài hát còn lại
            const updatedMusicLinks = {};
            let newId = 1;
            Object.keys(musicLinks).forEach(oldId => {
                updatedMusicLinks[newId] = musicLinks[oldId];
                newId++;
            });

            // Lưu lại danh sách nhạc đã cập nhật
            fs.writeFile(path.join(__dirname, 'public', 'music_links.json'), JSON.stringify(updatedMusicLinks, null, 2), (err) => {
                if (err) {
                    return res.status(500).json({ message: "Không thể ghi file" });
                }
                res.json({ message: `Bài hát với ID ${songId} đã được xóa.` });
            });
        } else {
            res.status(404).json({ message: "ID bài hát không tồn tại" });
        }
    });
});

// Bắt đầu server
app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});
