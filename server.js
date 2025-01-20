const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let connectedUsers = {}; // Stocker les utilisateurs avec leur état

io.on('connection', (socket) => {
    console.log('Un utilisateur s\'est connecté.');

    socket.on('set username', (username) => {
        socket.username = username;
        connectedUsers[username] = { active: true }; // Ajouter avec état "actif"
        console.log(`Utilisateur connecté : ${username}`);
        io.emit('update user list', connectedUsers);
        socket.emit('username set', username);
    });

    // Marquer l'utilisateur comme actif lorsqu'il tape
    socket.on('user active', () => {
        if (socket.username) {
            connectedUsers[socket.username].active = true;
            io.emit('update user list', connectedUsers);
            // Planifier un passage à l'état "inactif" après 10 secondes
            clearTimeout(socket.activityTimeout);
            socket.activityTimeout = setTimeout(() => {
                if (connectedUsers[socket.username]) {
                    connectedUsers[socket.username].active = false;
                    io.emit('update user list', connectedUsers);
                }
            }, 10000); // 10 secondes d'inactivité
        }
    });
    socket.on('chat message', (msg) => {
        const fullMessage = `${socket.username || 'Anonyme'}: ${msg}`;
        io.emit('chat message', fullMessage);
    });
    // Déconnexion de l'utilisateur
    socket.on('disconnect', () => {
        if (socket.username) {
            console.log(`Utilisateur déconnecté : ${socket.username}`);
            delete connectedUsers[socket.username]; // Retirer de la liste
            io.emit('update user list', connectedUsers);
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
