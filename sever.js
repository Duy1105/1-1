const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.port || 8080;

// Middleware để parse JSON body
app.use(express.json());

// Middleware để ghi lại địa chỉ IP
app.use((req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log(`IP người dùng truy cập: ${ip}`);
    next();
});

// Phục vụ tệp tĩnh trong thư mục public
app.use(express.static(path.join(__dirname, 'public')));

// API lấy link nhạc
app.get('/music_links.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'music_links.json'));
});

// API thêm bài hát
app.post('/addSong', (req, res) => {
    const newLink = req.body.link;

    // Đọc file music_links.json
    fs.readFile(path.join(__dirname, 'public', 'music_links.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Không thể đọc file" });
        }

        // Chuyển đổi dữ liệu JSON thành đối tượng
        const musicLinks = JSON.parse(data);
        const newId = Object.keys(musicLinks).length + 1; // Tính ID mới

        // Thêm bài hát mới vào đối tượng
        musicLinks[newId] = newLink;

        // Ghi lại vào file
        fs.writeFile(path.join(__dirname, 'public', 'music_links.json'), JSON.stringify(musicLinks, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ message: "Không thể ghi file" });
            }
            res.json({ message: "Bài hát đã được thêm thành công!" });
        });
    });
});

// Bắt đầu server
app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});
