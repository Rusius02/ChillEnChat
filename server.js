const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir les fichiers statiques (frontend)
app.use(express.static('public'));

// Gestion des connexions WebSocket
io.on('connection', (socket) => {
    console.log('Un utilisateur s\'est connecté');

    // Réception d'un message du client
    socket.on('chat message', (msg) => {
        // Réémet le message à tous les clients connectés
        io.emit('chat message', msg);
    });

    socket.on('disconnect', () => {
        console.log('Un utilisateur s\'est déconnecté');
    });
});

// Lancer le serveur
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
