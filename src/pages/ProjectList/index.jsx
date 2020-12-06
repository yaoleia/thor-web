import React from 'react';
import { connect } from 'umi';
import io from 'socket.io-client';

const socket = io(SOCKETIO, {
  query: {
    rooms: 'admin',
  },
});
socket.on('connect', () => {
  console.log('connect!');
});

socket.on('res', (msg) => {
  console.log(msg);
});

window.socket = socket;

const ProjectList = () => {
  return <div></div>;
};

export default connect(() => ({}))(ProjectList);
