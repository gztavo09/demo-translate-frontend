import io from 'socket.io-client';

const socket = io('https://demo-translate-backend-production.up.railway.app', {
    path: "/"
});

export default socket;