const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public')); // Sert les fichiers statiques dans le dossier public

let connectedUsers = {}; // Stocke les utilisateurs avec leur état

io.on('connection', (socket) => {
    console.log('Un utilisateur s\'est connecté.');

    // L'utilisateur envoie son pseudo
    socket.on('set username', (username) => {
        socket.username = username;
        connectedUsers[username] = { active: true }; // Ajouter avec état "actif"
        console.log(`Utilisateur connecté : ${username}`);
        
        // Envoi de la mise à jour de la liste des utilisateurs à tous les clients
        io.emit('update user list', connectedUsers);

        // Envoi du pseudo à l'utilisateur qui vient de se connecter
        socket.emit('username set', username);
    });

    // Quand l'utilisateur tape un message, il devient "actif"
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

    // Quand un utilisateur envoie un message de chat
    socket.on('chat message', (msg) => {
        const fullMessage = `${socket.username || 'Anonyme'}: ${msg}`;
        io.emit('chat message', fullMessage);
    });

    // Quand l'utilisateur se déconnecte
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
