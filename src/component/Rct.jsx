import React, { useRef, useState, useEffect } from "react";

import io, { Socket } from "socket.io-client";
import "./Rct.css";

const coturn_config = {
    iceServers: [
      // {
      //   urls: 'stun:[STUN_IP]:[PORT]',
      //   'credentials': '[YOR CREDENTIALS]',
      //   'username': '[USERNAME]'
      // },
      {urls: "stun:stun.l.google.com:19302",},
      {urls: "stun:stun1.l.google.com:19302",},
      {urls: "stun:stun2.l.google.com:19302",},
      {urls: "stun:stun3.l.google.com:19302",},    
      {urls: "stun:stun4.l.google.com:19302",},    
      
      //{urls: "stun:stun.ourcodeworld.com:5349"},
    ],
  };
  const SOCKET_EVENT = {
    CONNECTED: "connected",
    DISCONNECTED: "disconnect", 
    CREATEROOM : "createroom",
    CREATED: "created",
    JOIN:"join",
    READY :"ready",
    FULL:"full",
    IP:"ipaddr",
    MSG : "message",
  };
  
  const SOCKET_SERVER_URL = "http://127.0.0.1:7000"; //node server
  const Rct = ({}) => {

    const  sokcetRef =useRef();
    let room = "rctRoom";
useEffect(() => {    
  sokcetRef.current = io.connect(SOCKET_SERVER_URL);

  const socket= sokcetRef.current;


socket.on(SOCKET_EVENT.IP, function(ipaddr) {
  console.log('Server IP address is: ' + ipaddr);
 
});

socket.on(SOCKET_EVENT.CREATED, function(room, clientId) {
  console.log('Created room', room, '- my client ID is', clientId);
  //isInitiator = true;
  //grabWebCamVideo();
});

socket.on(SOCKET_EVENT.JOIN, function(room, clientId) {
  console.log('This peer has joined room', room, 'with client ID', clientId);
 // isInitiator = false;
  //createPeerConnection(isInitiator, configuration);
  //grabWebCamVideo();
});

socket.on(SOCKET_EVENT.FULL, function(room) {
  alert('Room ' + room + ' is full. We will create a new room for you.');
  window.location.hash = '';
  window.location.reload();
});

socket.on(SOCKET_EVENT.READY, function() {
  console.log('Socket is ready');
  //createPeerConnection(isInitiator, configuration);
});

socket.on(SOCKET_EVENT.MSG, function(message) {
  console.log('Client received message:', message);
 // signalingMessageCallback(message);
});

// Joining a room.
socket.emit(SOCKET_EVENT.CREATEROOM, room);

if (window.location.hostname.match(/localhost|127\.0\.0/)) {
  socket.emit(SOCKET_EVENT.IP);
}

// Leaving rooms and disconnecting from peers.
socket.on(SOCKET_EVENT.DISCONNECTED, function(reason) {
  console.log(`Disconnected: ${reason}.`);
  //sendBtn.disabled = true;
  //snapAndSendBtn.disabled = true;
});

socket.emit(SOCKET_EVENT.MSG, "Hello~");
 
    return () => {
     
    };
  }, []);
    return (
    <div className ="main" id ="main-container">
      hello!
        <button>
            connect
        </button>
        <button>
            connect
        </button>
    </div>)
  };

  export default Rct;
  