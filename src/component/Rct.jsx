import React, { useRef, useState, useEffect } from "react";
import platform from "platform";
import io, { Socket } from "socket.io-client";
import "./Rct.css";

//const coturn_config = null;
const coturn_config = {
  /*
  iceServers: [
    // {
    //   urls: 'stun:[STUN_IP]:[PORT]',
    //   'credentials': '[YOR CREDENTIALS]',
    //   'username': '[USERNAME]'
    // },
    { urls: "stun:stun.stunprotocol.org:3478" },
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun1.l.google.com:19302" },
    //{urls: "stun:stun.ourcodeworld.com:5349"},
  ],
  */
  iceServers: [
    { urls: "stun:stun.stunprotocol.org:3478" },
    { urls: "stun:stun.l.google.com:19302" },
  ],
};

const SOCKET_EVENT = {
  CONNECTED: "connected",
  DISCONNECTED: "disconnect",
  CREATEROOM: "createroom",
  CREATED: "created",
  JOIN: "join",
  READY: "ready",
  FULL: "full",
  IP: "ipaddr",
  MSG: "message",
  OFFER: "offer",
  ANSWER: "answer",
  CANDIDATE: "cadidate",
  GETOFFER: "getoffer",
  GETANSWER: "getanswer",
  GETCANDIDATE: "getcadidate",
};
const SOCKET_SERVER_URL = "localhost:7000"; //node server
const Rct = ({}) => {
  let socketRef = useRef();
  let peerConn = useRef();
  const dataChannelRef = useRef();

  const video_src = "./test_video.mp4"; //video src
  //const img_src = "./arcam_02062021_154808_50fps.mkv_00001186.jpg"; //video src
  const videoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const btnSendRef = useRef(null);
  const btnConnectRef = useRef(null);
  //const canvasRef = useRef(null);
  //const ctxRef = useRef(null);
  //const timerId = useRef(null);
  const localstreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  //const imgRef = useRef(null);

  const [isReady, setReady] = useState(false);
  const CHUNK_LEN = 64000;
  let videow = 1920;
  let videoh = 1280;
  let room = "room1";

  useEffect(() => {
    // ctxRef.current = canvasRef.current.getContext("2d");

    //sokcetRef.current = io.connect(SOCKET_SERVER_URL,{transports:['websocket']});
    socketRef.current = io.connect(SOCKET_SERVER_URL);
    const socket = socketRef.current;

    setReady(false);
    socket.on(SOCKET_EVENT.IP, function (ipaddr) {
      console.log("Server IP address is: " + ipaddr);
    });

    socket.on(SOCKET_EVENT.CREATED, ({ room, clientId }) => {
      console.log(SOCKET_EVENT.CREATED, room, "- my client ID is", clientId);

      //grabWebCamVideo();
    });

    socket.on(SOCKET_EVENT.JOIN, function (room, clientId) {
      console.log(
        "This peer has joined room",
        room,
        "with client ID",
        clientId
      );
      //grabWebCamVideo();
      setReady(true);
    });

    socket.on(SOCKET_EVENT.FULL, function (room) {
      alert("Room " + room + " is full. We will create a new room for you.");
      window.location.hash = "";
      window.location.reload();
    });

    socket.on(SOCKET_EVENT.READY, function () {
      console.log("Socket is ready");
      setReady(true);
      // createOffer();
    });

    socket.on(SOCKET_EVENT.MSG, function (message) {
      console.log("Client received message:", message);
    });

    socket.on(SOCKET_EVENT.GETOFFER, (sdp) => {
      // console.log(sdp);
      console.log("get offer");

      createAnswer(sdp);
    });

    socket.on(SOCKET_EVENT.GETANSWER, async (sdp) => {
      //sdp = RTCSessionDescription
      console.log("get answer");
      if (!peerConn.current) {
        console.log("peerConn.current not aliv");
        return;
      }
      await peerConn.current.setRemoteDescription(sdp);

      //Promise.all([peerConn.current.localDescription, sdp]);
      //console.log(sdp);
    });

    socket.on(SOCKET_EVENT.GETCANDIDATE, async (candidate) => {
      //candidate = RTCIceCandidateInit
      console.log("GETCANDIDATE");
      if (!peerConn.current) {
        console.log("peerConn.current not aliv");
        return;
      }

      peerConn.current.addIceCandidate(new RTCIceCandidate(candidate));
      console.log("candidate add success");
    });
    // Joining a room.
    /*
    if (window.location.hostname.match(/localhost|127\.0\.0/)) {
      socket.emit(SOCKET_EVENT.IP);
    }
    */
    socket.emit(SOCKET_EVENT.CREATEROOM, room);
    // Leaving rooms and disconnecting from peers.
    socket.on(SOCKET_EVENT.DISCONNECTED, function (reason) {
      console.log(`Disconnected: ${reason}.`);
    });
    if (socket.connect().connected) {
      console.log("alive");
    }
    socket.emit(SOCKET_EVENT.MSG, "Hello~");

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (peerConn.current) {
        peerConn.current.close();
      }

      //clearInterval(timerId.current);
    };
  }, []);

  const onDataChannelCreated = (channel) => {
    console.log("onDataChannelCreated:", channel);

    channel.onopen = function () {
      console.log("CHANNEL opened!!!");
      //send ghkftjdghk
    };

    channel.onclose = function () {
      console.log("Channel closed.");
      //send enable, video stop ,interval end
    };

    channel.onmessage = (e) => {
      console.log(e.data);
    };
    /*
      platform.name === "Firefox"
        ? receiveDataFirefoxFactory()
        : receiveDataChromeFactory();
        */
  };
  /*
  const receiveDataChromeFactory = () => {
    let buf, count;

    return (onmessage = (e) => {
      if (typeof e.data === "string") {
        buf = window.buf = new Uint8ClampedArray(parseInt(e.data));
        count = 0;
        console.log("Expecting a total of " + buf.byteLength + " bytes");
        return;
      }

      var data = new Uint8ClampedArray(e.data);
      buf.set(data, count);

      count += data.byteLength;
      console.log("count: " + count);

      if (count === buf.byteLength) {
        // we're done: all data chunks have been received
        console.log("Done. Rendering photo.");
        renderPhoto(buf);
      }
    });
  };

  const receiveDataFirefoxFactory = () => {
    let count,
      total,
      parts = [];
    return (onmessage = (e) => {
      if (typeof e.data === "string") {
        total = parseInt(e.data);
        parts = [];
        count = 0;
        console.log("Expecting a total of " + total + " bytes");
        return;
      }

      parts.push(e.data);
      count += e.data.size;
      console.log(
        "Got " + e.data.size + " byte(s), " + (total - count) + " to go."
      );

      if (count === total) {
        console.log("Assembling payload");
        var buf = new Uint8ClampedArray(total);
        var compose = function (i, pos) {
          var reader = new FileReader();
          reader.onload = function () {
            buf.set(new Uint8ClampedArray(this.result), pos);
            if (i + 1 === parts.length) {
              console.log("Done. Rendering photo.");
              renderPhoto(buf);
            } else {
              compose(i + 1, pos + this.result.byteLength);
            }
          };
          reader.readAsArrayBuffer(parts[i]);
        };
        compose(0, 0);
      }
    });
  };
*/
  const gotIceCandidate = async (event) => {
    if (event.candidate != null) {
      console.log("got ice candidate");
      socketRef.current.emit(SOCKET_EVENT.CANDIDATE, event.candidate);
      console.log("sent ice candiate to remote");
    }
  };
  const onAddStream = async (event) => {
    console.log("onAddStream");
    remoteStreamRef.current = event.streams;

    remoteVideoRef.current.srcObject = remoteStreamRef.current;
    remoteVideoRef.current.play();
  };
  const onRemoveStream = async (event) => {
    console.log("onRemoveStream");
  };
  const createOffer = async (iscall) => {
    console.log("create offer ", iscall);
    if (!socketRef.current) return;

    peerConn.current = new RTCPeerConnection(coturn_config);
    peerConn.current.onicecandidate = gotIceCandidate;
    // peerConn.current.onaddstream = onAddStream;
    // peerConn.current.onremotestream = onRemoveStream;
    peerConn.current.ontrack = (ev) => {
      console.log("add remotetrack success");
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = ev.streams[0];
      }
    };

    localstreamRef.current
      .getTracks()
      .forEach((track) =>
        peerConn.current.addTrack(track, localstreamRef.current)
      );

    if (iscall === true) {
      dataChannelRef.current = peerConn.current.createDataChannel("data");
      onDataChannelCreated(dataChannelRef.current);
    } else {
      peerConn.current.ondatachannel = function (event) {
        console.log("ondatachannel ");
        dataChannelRef.current = event.channel;
        onDataChannelCreated(event.channel);
      };
    }
    if (iscall === true) {
      await peerConn.current
        .createOffer(
          async (offer) => {
            console.log("create offer sucees");
            await peerConn.current.setLocalDescription(offer);
            console.log(
              " setLocalDescription sucees",
              peerConn.current.localDescription
            );

            await socketRef.current.emit(
              SOCKET_EVENT.OFFER,
              peerConn.current.localDescription
            );
            console.log("send end");
          },
          (reason) => {
            console.log(reason);
          },
          {
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          }
        )
        .catch((reason) => console.error(reason));
    }
    //console.log("sending local desc:", peerConn.current.localDescription);
  };
  const createAnswer = async (sdp) => {
    //RTCSessionDescription

    if (peerConn.current == null) createOffer(false);
    console.log("createAnswer");
    if (!(peerConn.current && socketRef.current)) return;
    if (sdp == null) {
      console.log("sdp is null");
      return;
    }

    const pc = peerConn.current;
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    console.log("set remote description");
    await peerConn.current
      .createAnswer()
      .then(async (answer) => {
        await peerConn.current.setLocalDescription(answer);
        console.log(
          "set local answer description",
          peerConn.current.localDescription
        );
        await socketRef.current.emit(
          SOCKET_EVENT.ANSWER,
          peerConn.current.localDescription
        );
      })
      .catch((reason) => console.error(reason));
  };
  /*
  function renderPhoto(data) {
    let canvas = canvasRef.current;
    canvas.width = videow;
    canvas.height = videoh;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    let context = ctxRef.current;
    if (!context) {
      context = canvasRef.current.getContext("2d");
      ctxRef.current = context;
    }

    var img = context.createImageData(videow, videoh);
    img.data.set(data);
    context.putImageData(img, 0, 0);
  }
*/
  const onClick_send = () => {
    return;
    /*
    let canvas = canvasRef.current;
    canvas.width = videow;
    canvas.height = videoh;

    timerId.current = setInterval(() => {
      if (
        videoRef == null ||
        videoRef.current.paused ||
        videoRef.current.ended
      ) {
        return;
      }
      send_video_frame();
    }, 3);
    */
  };
  /*
  const send_video_frame = () => {
    const ctx = ctxRef.current;
    ctx.drawImage(videoRef.current, 0, 0, videow, videoh);

    console.log("width and height ", videow, videoh);
    var img = ctx.getImageData(0, 0, videow, videoh),
      //var img = canvas.toDataURL("image/jpeg");
      len = img.data.byteLength,
      //len = img.length;
      n = (len / CHUNK_LEN) | 0;

    console.log("Sending a total of " + len + " byte(s)");
    const dataChannel = dataChannelRef.current;
    if (!dataChannel) {
      console.log(
        "Connection has not been initiated. " +
          "Get two peers in the same room first"
      );
      return;
    } else if (dataChannel.readyState === "closed") {
      console.log("Connection was lost. Peer closed the connection.");
      return;
    }

    dataChannel.send(len);
    // split the photo and send in chunks of about 64KB
    for (var i = 0; i < n; i++) {
      var start = i * CHUNK_LEN,
        end = (i + 1) * CHUNK_LEN;
      console.log(start + " - " + (end - 1));
      dataChannel.send(img.data.subarray(start, end));
    }
    // send the reminder, if any
    if (len % CHUNK_LEN) {
      console.log("last " + (len % CHUNK_LEN) + " byte(s)");
      dataChannel.send(img.data.subarray(n * CHUNK_LEN));
    }
  };
  */
  const onLoadImg = () => {
    console.log("onLoadImg");
  };

  const onClick_connect = () => {
    console.log("onClick_connect");
    createOffer(true);
  };

  const onLoadedVideo = ({ nativeEvent }) => {
    const e = nativeEvent.target;

    //setVideo(e);
    //setVideoW(e.videoWidth);
    //setVideoH(e.videoHeight);
    videow = e.videoWidth;
    videoh = e.videoHeight;
    console.log(e.id + "w" + e.videoWidth + "x h " + e.videoHeight);
    const fps = 0;
    const localvideo = videoRef.current;

    if (localvideo.captureStream) {
      localstreamRef.current = localvideo.captureStream(fps);
    } else if (localvideo.mozCaptureStream) {
      localstreamRef.current = localvideo.mozCaptureStream(fps);
    } else {
      console.error("stream not supported");
      localstreamRef.current = null;
    }
    //  console.log(e.getTracks());
  };
  const retmoe_play = ({ nativeEvent }) => {
    remoteVideoRef.current.play();
  };

  /*
  <video
  className="video"
  id="video_play" 
  ref={videoRef}
  onLoadedMetadata={onLoadedVideo}
  muted="muted"
  loop="loop"
  controls
>
  <source src={video_src} type="video/mp4"></source>
</video>
<img src={img_src} ref={imgRef}></img>
  <canvas className="canvas" id="canvas" ref={canvasRef}></canvas>
*/
  return (
    <div className="main" id="main-container">
      <button
        onClick={onClick_connect}
        ref={btnConnectRef}
        disabled={!isReady}
        width="30"
        height="20"
      >
        connect
      </button>
      <button onClick={onClick_send} ref={btnSendRef} width="30" height="20">
        disconnect
      </button>
      <video
        className="video"
        id="video_play"
        ref={videoRef}
        onLoadedMetadata={onLoadedVideo}
        muted
        loop
        controls
        playsInline
        autoPlay
      >
        <source src={video_src} type="video/mp4"></source>
      </video>

      <video
        className="video"
        id="video_remote"
        ref={remoteVideoRef}
        playsInline
        autoplay
        onCanPlay={retmoe_play}
      ></video>
    </div>
  );
};

export default Rct;
