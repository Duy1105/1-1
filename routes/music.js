const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const musicFilePath = path.join(__dirname, '../public/music_links.json');

// Lấy danh sách nhạc
router.get('/', (req, res) => {
    fs.readFile(musicFilePath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Error reading file' });
        res.json(JSON.parse(data));
    });
});

// Lấy bài hát theo ID
router.get('/:id', (req, res) => {
    fs.readFile(musicFilePath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Error reading file' });
        const musicData = JSON.parse(data);
        const song = musicData[req.params.id];
        if (song) {
            res.json({ link: song });
        } else {
            res.status(404).json({ error: 'Song not found' });
        }
    });
});

// Thêm bài hát mới
router.post('/', (req, res) => {
    const { id, link } = req.body;
    if (!id || !link) {
        return res.status(400).json({ error: 'ID and link are required' });
    }

    fs.readFile(musicFilePath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Error reading file' });
        const musicData = JSON.parse(data);
        musicData[id] = link;

        fs.writeFile(musicFilePath, JSON.stringify(musicData, null, 2), (err) => {
            if (err) return res.status(500).json({ error: 'Error saving file' });
            res.status(201).json({ message: 'Song added successfully' });
        });
    });
});

module.exports = router;
