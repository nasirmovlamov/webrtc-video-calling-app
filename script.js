const video = document.getElementById('video');

let start_button = document.querySelector("#start-record");
let stop_button = document.querySelector("#stop-record");
let download_link = document.querySelector("#save-record");

let camera_stream = null;
let media_recorder = null;
let blobs_recorded = [];

let black_camera_stream = null
let black_media_recorder = null
let black_blobs_recorded = null


const getUserVideo = async () => {
    const constraints = {
        audio: true,
        video: {
            facingMode: 'user',
        },
    };
    camera_stream =  await navigator.mediaDevices.getUserMedia(constraints)
    video.srcObject = camera_stream
    video.play()
}


var canvas = document.getElementById('canvas');
var ctx    = canvas.getContext('2d');
let canvas_stream  = null


video.addEventListener('canplay', async function () {
    canvas.width =  video.videoWidth
    canvas.height =  video.videoHeight,
    (function loop() {
        if (!video.paused && !video.ended) {
            
            ctx.drawImage(video , 0, 0 )
            // ctx.drawImage(video, 0, 0, video.width, video.height);
            var frame = ctx.getImageData(0, 0, video.videoWidth, video.videoHeight);
            var l = frame.data.length / 4;

            for (var i = 0; i < l; i++) {
                var grey = (frame.data[i * 4 + 0] + frame.data[i * 4 + 1] + frame.data[i * 4 + 2]) / 3;

                frame.data[i * 4 + 0] = grey;
                frame.data[i * 4 + 1] = grey;
                frame.data[i * 4 + 2] = grey;
            }
            ctx.putImageData(frame, 0, 0);
            canvas_stream = canvas.captureStream(25)
            setTimeout(loop, 1000 / 30); // drawing at 30fps
        }
    })();
}, 0);


document.querySelector('#start-camera').onclick = getUserVideo


start_button.addEventListener('click', function() {
    // set MIME type of recording as video/webm
    console.log(camera_stream)
    media_recorder = new MediaRecorder(canvas_stream, { mimeType: 'video/webm' });

    // event : new recorded video blob available 
    media_recorder.addEventListener('dataavailable', function(e) {
		blobs_recorded.push(e.data);
    });

    // event : recording stopped & all blobs sent
    media_recorder.addEventListener('stop', function() {
    	// create local object URL from the recorded video blobs
    	let video_local = URL.createObjectURL(new Blob(blobs_recorded, { type: 'video/webm',name:"record_1" }));
    	download_link.href = video_local;
    });

    // start recording with each recorded blob having 1 second video
    media_recorder.start(1000);
});

stop_button.addEventListener('click', function() {
	media_recorder.stop(); 
});