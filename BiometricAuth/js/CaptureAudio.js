// variables
var leftchannel = [];
var rightchannel = [];
var recorder = null;
var recording = false;
var recordingLength = 0;
var volume = null;
var audioInput = null;
var sampleRate = null;
var audioContext = null;
var context = null;
var outputElement = document.getElementById('output');
var outputString;

// feature detection 
if (!navigator.getUserMedia)
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
                  navigator.mozGetUserMedia || navigator.msGetUserMedia;

if (navigator.getUserMedia) {
    navigator.getUserMedia({ audio: true }, success, function (e) {
        alert('Error capturing audio.');
    });
} else alert('getUserMedia not supported in this browser.');



// if R is pressed, we start recording
function recordNow() {
    $('#micImg').show();
    $('#stopRecodring').show();
    recording = true;
    // reset the buffers for the new recording
    leftchannel.length = rightchannel.length = 0;
    recordingLength = 0;
    outputElement.innerHTML = 'Recording now...';
    // if S is pressed, we stop the recording and package the WAV file
}

function stopRecording() {
    $('#guistart').hide();
    $('#micImg').hide();
    $('#stopRecodring').hide();
    $('#enrolBWS').show();

    // we stop recording
    recording = false;
    outputElement.innerHTML = 'Building wav file...';

    // we flat the left and right channels down
    var leftBuffer = mergeBuffers(leftchannel, recordingLength);
    //leftBuffer = interpolateArray(leftBuffer, 16000, sampleRate);
    var rightBuffer = mergeBuffers(rightchannel, recordingLength);
    //rightBuffer = interpolateArray(rightBuffer, 16000, sampleRate);
    // we interleave both channels together
    var interleaved = interleave(leftBuffer, rightBuffer);   
    // we create our wave file
    var buffer = new ArrayBuffer(44 + interleaved.length * 2);
    var view = new DataView(buffer);

    // RIFF chunk descriptor
    writeUTFBytes(view, 0, 'RIFF');
    view.setUint32(4, 44 + interleaved.length * 2, true);
    writeUTFBytes(view, 8, 'WAVE');
    // FMT sub-chunk
    writeUTFBytes(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    // stereo (2 channels)
    view.setUint16(22, 2, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 4, true);
    view.setUint16(32, 4, true);
    view.setUint16(34, 16, true);
    // data sub-chunk
    writeUTFBytes(view, 36, 'data');
    view.setUint32(40, interleaved.length * 2, true);

    // write the PCM samples
    var lng = interleaved.length;
    var index = 44;
    var volume = 1;
    for (var i = 0; i < lng; i++) {
        view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
        index += 2;
    }

    // our final binary blob
    var blob = new Blob([view], { type: 'audio/wav' });

    // let's save it locally
    outputElement.innerHTML = 'Voice Captured successfully. </br> </br> Authenticate from BioID Now..';
    var url = (window.URL || window.webkitURL).createObjectURL(blob);
    // save file
    var link = window.document.createElement('a');
    link.href = url;
    link.download = 'output.wav';
    var click = document.createEvent("Event");
    click.initEvent("click", true, true);
    link.dispatchEvent(click);
}

function BWSenrol() {
    outputElement.innerHTML = 'Samples Enrolling in BWS service in-progress... </br></br>Please wait..';
    $.get('api/Upload/Enroll').done(function (data) {
        if (data.length > 0) {
            alert('Enroll success');
            $('#verifyBWS').show();
            outputElement.innerHTML = 'Enrollment successfully done.';
        } else {
            alert('Enroll Failed');

        }
    });
}
function BWSverify() {
    outputElement.innerHTML = 'Samples Verification in BWS service in-progress... </br></br>Please wait..';
    $.get('api/Upload/Verify').done(function (data) {
        if (data.length > 0) {
            outputElement.innerHTML = 'Verification successfully done.';
            alert('Login now..');
            window.location.href = 'index.html';
        } else {
            alert('Verification Failed');
        }
    });
}

// for changing the sampling rate, data,
function interpolateArray(data, newSampleRate, oldSampleRate) {
    var fitCount = Math.round(data.length * (newSampleRate / oldSampleRate));
    var newData = new Array();
    var springFactor = new Number((data.length - 1) / (fitCount - 1));
    newData[0] = data[0]; // for new allocation
    for (var i = 1; i < fitCount - 1; i++) {
        var tmp = i * springFactor;
        var before = new Number(Math.floor(tmp)).toFixed();
        var after = new Number(Math.ceil(tmp)).toFixed();
        var atPoint = tmp - before;
        newData[i] = this.linearInterpolate(data[before], data[after], atPoint);
    }
    newData[fitCount - 1] = data[data.length - 1]; // for new allocation
    return newData;
};
function linearInterpolate(before, after, atPoint) {
    return before + (after - before) * atPoint;
};

function interleave(leftChannel, rightChannel) {
    var length = leftChannel.length + rightChannel.length;
    var result = new Float32Array(length);

    var inputIndex = 0;

    for (var index = 0; index < length;) {
        result[index++] = leftChannel[inputIndex];
        result[index++] = rightChannel[inputIndex];
        inputIndex++;
    }
    return result;
}

function mergeBuffers(channelBuffer, recordingLength) {
    var result = new Float32Array(recordingLength);
    var offset = 0;
    var lng = channelBuffer.length;
    for (var i = 0; i < lng; i++) {
        var buffer = channelBuffer[i];
        result.set(buffer, offset);
        offset += buffer.length;
    }
    return result;
}

function writeUTFBytes(view, offset, string) {
    var lng = string.length;
    for (var i = 0; i < lng; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

function success(e) {
    // creates the audio context
    audioContext = window.AudioContext || window.webkitAudioContext;
    context = new audioContext();
    // we query the context sample rate (varies depending on platforms)
    sampleRate = context.sampleRate;
    //sampleRate = 22000;
    console.log('success');
    // creates a gain node
    volume = context.createGain();
    // creates an audio node from the microphone incoming stream
    audioInput = context.createMediaStreamSource(e);
    // connect the stream to the gain node
    audioInput.connect(volume);

    /* From the spec: This value controls how frequently the audio-process event is 
    dispatched and how many sample-frames need to be processed each call. 
    Lower values for buffer size will result in a lower (better) latency. 
    Higher values will be necessary to avoid audio breakup and glitches */
    var bufferSize = 2048;
    recorder = context.createScriptProcessor(bufferSize, 2, 2);
    recorder.onaudioprocess = function (e) {
        if (!recording) return;
        var left = e.inputBuffer.getChannelData(0);
        var right = e.inputBuffer.getChannelData(1);
        // we clone the samples
        leftchannel.push(new Float32Array(left));
        rightchannel.push(new Float32Array(right));
        recordingLength += bufferSize;
        console.log('recording');
    }

    // we connect the recorder
    volume.connect(recorder);
    recorder.connect(context.destination);
}