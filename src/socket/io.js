import io from 'socket.io-client';

const socket = io('https://dashing-custard-186365.netlify.app:3000/bundle.js');

export default socket;