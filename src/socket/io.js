import io from 'socket.io-client';

const socket = io('https://dashing-custard-186365.netlify.app:3000');

export default socket;