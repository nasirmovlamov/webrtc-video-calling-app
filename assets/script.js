//#region starting data
// const socket = io("/"); 
// const user = prompt("Enter your name");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
const showChat = document.querySelector("#showChat");
const backBtn = document.querySelector(".header__back");

const socketChat = new WebSocket("ws://localhost:8080/hello?id=1");
const socketStreaming = new WebSocket("ws://localhost:8080/hello?id=1");


var urlCreator = window.URL || window.webkitURL;

myVideo.muted = true;
//#endregion starting data



//#region Streaming
function getName() {
  return +new Date()
}

const STREAM_NAME = getName()

function permittedGetUserMedia() {
  return !!(navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia);
}

function sendFile(file, chunkNumber) {
  var reader = new FileReader();
  var rawData = new ArrayBuffer();            
  reader.loadend = function() {}
  reader.onload = function(e) {
      rawData = e.target.result;
      const fromRawDataToString = new TextDecoder("utf-8").decode(rawData);
      socket.send(JSON.stringify({type:"streaming", file:fromRawDataToString , name:STREAM_NAME, chunk:chunkNumber}))
  }
  reader.readAsArrayBuffer(file);
}

function registerRecord(stream) {
  const mediaRecorder = new MediaRecorder(stream)
  let countUploadChunk = 0

  mediaRecorder.ondataavailable = (data) => {
      sendFile(data.data, countUploadChunk)
      countUploadChunk++
  }
  mediaRecorder.start()

  setInterval(() => {
      mediaRecorder.requestData()
  }, 2000)
}

function registerPlayer(mediaSource) {
  const videoBuffer = mediaSource.addSourceBuffer('video/webm;codecs=vp8');
  let countDownloadChunk = 0
  socketVD.onmessage = (event) => {
    // let data = JSON.parse(event.data)
    // const fromStringToArrayBufer = new TextEncoder("utf-8").encode(data.file)
    if(data.type === "streaming" && data.name === STREAM_NAME) {
      console.log(data)
      // const  buffer = fromStringToArrayBufer
      // videoBuffer.appendBuffer(buffer)
      // countDownloadChunk++
    }
  }
  //#region legacy code
  // setInterval(() => {
  //     fetch(`/api/download?name=${STREAM_NAME}&chunk=${countDownloadChunk}`)
  //         .then((response) => {
  //             if (response.status !== 200) {
  //                 throw Error('no such file')
  //             }
  //             return response.arrayBuffer()
  //         }).then((buffer) => {
  //             countDownloadChunk++
  //             videoBuffer.appendBuffer(buffer)
  //         }).catch(() => {})
  // }, 1000)
  //#endregion legacy code
}



if (permittedGetUserMedia()) {
  const mediaSource = new MediaSource();

  myVideo.src = URL.createObjectURL(mediaSource);
  
  
  mediaSource.addEventListener('sourceopen' , async function(){
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
    })
    // processStream(stream, mediaSource)
    // registerPlayer(mediaSource)
    // registerRecord(stream)
    // myVideo.srcObject = stream;
    console.log(mediaSource.readyState); // open
    addVideoStream(myVideo , stream)
  })

  
}




function processStream(stream, mediaSource) {
  registerRecord(stream)
  registerPlayer(mediaSource)
  addVideoStream(myVideo , stream)
}


//#endregion Streaming

//#region socket video
  let myVideoStream;

  //#region Video
  // navigator.mediaDevices
  //   .getUserMedia({
  //     audio: true,
  //     video: true,
  //   })
  //   .then((stream) => {
  //     myVideoStream = stream;
  //     addVideoStream(myVideo, stream);
      
      // socket.send(JSON.stringify({type:"connecting",name:createRandomUserName(),myVideoStream:stream.encode()}));
      
     
      // socket.send(JSON.stringify(myVideoStream));
      // setInterval(() => {
      //   console.log(myVideoStream)
      // }, 30);
      
      //#REGION JUST LEGACYCODE
      // peer.on("call", (call) => {
      //   call.answer(stream);
      //   const video = document.createElement("video");
      //   call.on("stream", (userVideoStream) => {
      //     addVideoStream(video, userVideoStream);
      //   });
      // });
      
      // socket.on("user-connected", (userId) => {
      //   connectToNewUser(userId, stream);
      // });
      //#ENDREGION

  // });
  //#endregion Video

  //#REGION LEGACY CODE
  // const connectToNewUser = (userId, stream) => {
    // const call = peer.call(userId, stream);
    // const video = document.createElement("video");
    // call.on("stream", (userVideoStream) => {
    //   addVideoStream(video, userVideoStream);
    // });
  // };

  // peer.on("open", (id) => {
  //   socket.emit("join-room", ROOM_ID, id, user);
  // });
  //#ENDREGION LEGACY CODE

  const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
      videoGrid.append(video);
    });
  };
  
  socket.onopen = (ev) => {
    console.log("Socket connected")
    // socket.send(JSON.stringify({type:"connecting", name:createRandomUserName()}));
  };

  const createRandomUserName = () => {
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let text = "";
    for (let i = 0; i < 5; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };
  
  socket.onmessage = function(event) {
    const data = JSON.parse(event.data)
    if(data.type === "message"){
      messages.innerHTML =
       messages.innerHTML +
       `<div class="message">
           <span>${data.message}</span>
       </div>`;
    }
    if(data.type === "connecting"){
      console.log(event.data);
    }
    if(data.type = "streaming"){
      
    }
  };

  socket.onclose = function(event) {
      if (event.wasClean) {
          console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
      } else {
          // e.g. server process killed or network down
          // event.code is usually 1006 in this case
          console.log('[close] Connection died');
      }
  };

  socket.onerror = function(e) {
      console.log(e);
  };
//#endregion socket video

//#region Socket Message
  let text = document.querySelector("#chat_message");
  let send = document.getElementById("send");
  let messages = document.querySelector(".messages");

  send.addEventListener("click", (e) => {
    if (text.value.length !== 0) {
      socket.send(JSON.stringify({type:'message', message:text.value}));
      text.value = "";
    }
  });

  text.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && text.value.length !== 0) {
      socket.send(JSON.stringify({type:'message', message:text.value}));
      text.value = "";
    }
  });

//#endregion Socket Message

//#region Video Settings 
 
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");
const recordButton = document.querySelector("#recordButton");

muteButton.addEventListener("click", () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    html = `<i class="fas fa-microphone-slash"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    html = `<i class="fas fa-microphone"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  }
});

stopVideo.addEventListener("click", () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    html = `<i class="fas fa-video-slash"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    html = `<i class="fas fa-video"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  }
});

recordButton.addEventListener("click", () => {
  if (!stopVideo.classList.contains('background__red')) {
    recordButton.classList.toggle("background__red");
  } else {
    recordButton.classList.toggle("background__red");
  }
});

//#endregion Video Settings 

//#region Invite user
const inviteButton = document.querySelector("#inviteButton");

inviteButton.addEventListener("click", (e) => {
  prompt(
    "Copy this link and send it to people you want to meet with",
    window.location.href
  );
});
//#endregion invite user

//#region Chat mobile-controls
backBtn.addEventListener("click", () => {
  document.querySelector(".main__left").style.display = "flex";
  document.querySelector(".main__left").style.flex = "1";
  document.querySelector(".main__right").style.display = "none";
  document.querySelector(".header__back").style.display = "none";
});

showChat.addEventListener("click", () => {
  document.querySelector(".main__right").style.display = "flex";
  document.querySelector(".main__right").style.flex = "1";
  document.querySelector(".main__left").style.display = "none";
  document.querySelector(".header__back").style.display = "block";
});
//#endregion Chat mobile controls
