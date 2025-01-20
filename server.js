const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public')); // Servir les fichiers statiques

// Liste des utilisateurs connectés
let connectedUsers = [];

io.on('connection', (socket) => {
    console.log('Un utilisateur s\'est connecté.');

    // Stocker le pseudo de l'utilisateur
    socket.on('set username', (username) => {
        socket.username = username;
        connectedUsers.push(username); // Ajouter l'utilisateur à la liste
        console.log(`Utilisateur connecté : ${username}`);
        io.emit('update user list', connectedUsers); // Mettre à jour la liste des utilisateurs
        socket.emit('username set', username);
    });

    // Réception d'un message
    socket.on('chat message', (msg) => {
        const fullMessage = `${socket.username || 'Anonyme'}: ${msg}`;
        io.emit('chat message', fullMessage);
    });

    // Déconnexion d'un utilisateur
    socket.on('disconnect', () => {
        if (socket.username) {
            console.log(`Utilisateur déconnecté : ${socket.username}`);
            connectedUsers = connectedUsers.filter((user) => user !== socket.username);
            io.emit('update user list', connectedUsers); // Mettre à jour la liste des utilisateurs
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
