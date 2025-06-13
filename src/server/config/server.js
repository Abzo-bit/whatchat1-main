const express = require('express');
const jsonServer = require('json-server');
const cors = require('../middleware/cors');
const config = require('./json-server.config');
const multer = require('multer');
const path = require('path');

const server = jsonServer.create();
const router = jsonServer.router(config.db);
const middlewares = jsonServer.defaults({ static: './public' });

// Configuration de multer pour les uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/assets/images/contacts')
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        cb(null, `${timestamp}${ext}`);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.mimetype)) {
            cb(new Error('Type de fichier non supporté'));
            return;
        }
        cb(null, true);
    }
});

server.use(middlewares);
server.use(cors);

// Route pour l'upload d'images
server.post('/api/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Aucun fichier uploadé' });
        }
        const imagePath = `/assets/images/contacts/${req.file.filename}`;
        res.json({ path: imagePath });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l\'upload' });
    }
});

server.use(router);

server.listen(config.port, () => {
    console.log(`JSON Server is running on port ${config.port}`);
});

module.exports = server;
