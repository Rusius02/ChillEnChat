const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public')); // Servir les fichiers statiques

// Gestion des connexions WebSocket
io.on('connection', (socket) => {
    console.log('Un utilisateur s\'est connecté.');

    // Stocker le pseudo de l'utilisateur
    socket.on('set username', (username) => {
        socket.username = username; // Stocke le pseudo dans le contexte du socket
        console.log(`Pseudo défini : ${username}`);
        socket.emit('username set', username); // Confirmation au client
    });

    // Réception d'un message
    socket.on('chat message', (msg) => {
        const fullMessage = `${socket.username || 'Anonyme'}: ${msg}`;
        io.emit('chat message', fullMessage); // Réémet le message à tous
    });

    socket.on('disconnect', () => {
        console.log(`${socket.username || 'Un utilisateur'} s'est déconnecté.`);
    });
});

// Lancer le serveur
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
