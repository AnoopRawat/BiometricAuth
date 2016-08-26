// localized messages
var guimessages = {
    // init error messages
    'capture-error': 'Video capture failed to start with error: {0}<br />The user might have denied access to their camera.<br />Sorry, but without access to a camera, biometric face recognition is not possible!',
    'nogetUserMedia': 'Your browser does not support the HTML5 Media Capture and Streams API. We are trying to load a Silverlight module to access the multimedia capture device.',
    'SilverlightError': 'Unhandled error in Silverlight Application {0}',
    // status on screen messages (arguments: uploading + uploaded, recordings)
    'DisplayTag': '',
    'Uploading': 'Uploading sample {0} of {1} ...',
    'Uploaded': '', // 'Sample {2} of {1} has been uploaded.',
    'NoFaceFound': 'Upload failed: no face found',
    'MultipleFacesFound': 'Upload failed: multiple faces were found',
    'NoMovement': 'No motion detected, please move your head',
    'Verifying': 'Verifying ...',
    'Training': 'Training ...',
    'LiveDetectionFailed': 'Live detection failed - retrying...',
    'ChallengeResponseFailed': 'Challenge-Response failed!<br />Please turn head toward arrows...',
    'NotRecognized': 'You have not been recognized - retrying...'
};

// localization and string formatting (additional arguments replace {0}, {1}, etc. in guimessages[key])
function formatText(key) {
    var formatted = key;
    if (guimessages[key] !== undefined) {
        formatted = guimessages[key];
    }
    for (var i = 1; i < arguments.length; i++) {
        formatted = formatted.replace("{" + (i - 1) + "}", arguments[i]);
    }
    return formatted;
}

var silverlightHost = null;
var capture = null;
var recordings = 2;
var executions = 3;
var maxHeight = 480;
var counter = 0;
$(document).ready(function () {
    // init BWS capture jQuery plugin (see bws.capture.js)
    var Model = {
        Token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbmlkIjoiOGFkYzg2NmEtN2I1NS00ODkwLWJjZTgtNTZhNjEwYjEyMGZhIiwiY2xudCI6IlBsYXlncm91bmQiLCJhcHAiOiI1OTU1MjAyNzIuNi5hcHAuYmlvaWQuY29tIiwiYmNpZCI6ImJpb2lkLzQyLzM1NTk0OTQwMSIsInRhc2siOjI1OSwiaXNzIjoiQldTIiwiYXVkIjoiaHR0cHM6Ly9id3MuYmlvaWQuY29tIiwiZXhwIjoxNDQwNzU2NjQ0LCJuYmYiOjE0NDA3NTYwNDR9.fU9ZR8M5hPiUUxYlxAVykdCvu67JAZbfVe-utlIVugE',
        Host: 'bws.bioid.com',
        ChallengeResponse: 'true'
    }
    capture = bws.initcapture(document.getElementById('guicanvas'), document.getElementById('guimotionbar'), Model.Token, {
        host: Model.Host,
        task: "enrollment",
        maxheight: maxHeight,
        challengeResponse: 'true',
        recordings: recordings
    });
    // and start everything
    onStart();
});

// Silverlight stuff - only used if HTML5 version fails
function CreateSLPlugin() {
    console.log("start silverlight plugin");
    $("#guiapp").show();
    $("#guicanvas").hide();
    $("#guisilverlight").show();
    $("#guidemo").html("BWS unified user interface - Silverlight version");
    Silverlight.createObjectEx({
        source: '/ClientBin/BioID.Silverlight.Capture.xap',
        parentElement: document.getElementById("guisilverlight"),
        id: 'SilverlightCapture',
        properties: {
            width: '100%',
            height: '100%',
            version: '5.0.61118.0',
            enableHtmlAccess: 'true',
            windowless: 'true'
        },
        events: {
            onLoad: onSLPluginLoaded,
            onError: onSilverlightError
        },
        context: null
    });
}

function onSilverlightError(sender, args) {
    var appSource = "";
    if (sender != null && sender != 0) {
        appSource = sender.getHost().Source;
    }
    var errMsg = "Unhandled Error in Silverlight Application " + appSource + "\n";
    console.log(errMsg);
    $("#guierror").html(formatText('SilverlightError', appSource));
}

function onSLPluginLoaded(plugIn, userContext, sender) {
    console.log("silverlight plugin loaded");
    $("#guisplash").hide();
    silverlightHost = sender.getHost();
}

// only called from Silverlight plugin!
function upload(dataURL) {    
    capture.upload(dataURL);
}


// only called from Silverlight plugin!
function motionBar(motion) {
    capture.drawMotionBar(motion);
}

// called by onStart or the Silverlight plugin to update GUI
function captureStarted() {
    $("#guisplash").hide();
    $("#guiapp").show();
    $("#guimessage").show();
    $("#guiarrows").show();
    $("#guimirror").show().click(mirror);
    $("#guistart").show().click(startRecording);
}

// called from Start button and onStart to initiate a new recording
function startRecording() {    
    capture.startCountdown(function () {
        for (var i = 1; i <= recordings; i++) {
            $("#guiuploaded" + i).hide();
            $("#guiupload" + i).hide();
            $("#guiwait" + i).show();
            $("#guiimage" + i).show();
        }
        capture.startRecording();
        if (silverlightHost) {
            silverlightHost.Content.MainPage.StartCapturing();
        }
    });
}

// called from onStart when recording is done
function stopRecording() {
    capture.stopRecording();
    if (silverlightHost) {
        silverlightHost.Content.MainPage.StopCapturing();
    }
    for (var i = 1; i <= recordings; i++) {
        $("#guiimage" + i).hide();
    }
}

// called from Mirror button to mirror the captured image
function mirror() {
    if (silverlightHost) {
        silverlightHost.Content.MainPage.MirrorDisplay();
    } else {
        capture.mirror();
    }
}

// startup code
function onStart() {
    capture.start(function () {
        $("#guicanvas").show();
        $("#guisilverlight").hide();
        captureStarted();
    }, function (error) {
        if (error !== undefined) {
            // different browsers use different errors
            if (error.code === 1 || error.name === "PermissionDeniedError") {
                // in the spec we find code == 1 and name == PermissionDeniedError for the permission denied error
                $("#guierror").html(formatText('capture-error', 'Permission denied!'));
            } else {
                // otherwise try to print the error
                $("#guierror").html(formatText('capture-error', error));
            }
        } else {
            // no error info typically says that browser doesn't support getUserMedia
            $("#guierror").html(formatText('nogetUserMedia'));
            // try to load silverlight plugin
            CreateSLPlugin();
        }
    }, function (error, retry) {
        // done
        stopRecording();
        executions--;
        if (error !== undefined && retry && executions > 0) {
            // if failed restart if retries are left, but wait a bit until the user has read the error message!
            setTimeout(function () { startRecording(); }, 1800);
        } else {
            // done: redirect to caller ...
            var url = "@Model.ReturnUrl?access_token=@Model.Token";
            if (error !== undefined) {
                url = url + "&error=" + error;
            }
            url = url + "&state=@Model.State";
            window.location.replace(url);
        }
    }, function (status, message, dataURL) {
        if (status === 'DisplayTag') {
            if (message.search("up") < 0) { $("#guiarrowup").hide(); } else { $("#guiarrowup").show(); }
            if (message.search("down") < 0) { $("#guiarrowdown").hide(); } else { $("#guiarrowdown").show(); }
            if (message.search("left") < 0) { $("#guiarrowleft").hide(); } else { $("#guiarrowleft").show(); }
            if (message.search("right") < 0) { $("#guiarrowright").hide(); } else { $("#guiarrowright").show(); }
        } else {
            // report a message on the screen
            var uploaded = capture.getUploaded();
            var recording = uploaded + capture.getUploading();
            var msg = formatText(status, recording, recordings);
            var $msg = $("#guimessage");
            $msg.html(msg);
            $msg.stop(true).fadeIn(400).fadeOut(3000);

            // we display some animations/images dpending on the status
            if (status === 'Uploading') {
                // begin an upload
                $("#guiwait" + recording).hide();
                $("#guiupload" + recording).show();
            } else if (status === 'Uploaded') {
                // successfull upload (we should have a dataURL)
                if (dataURL) {
                    $("#guiupload" + uploaded).hide();
                    $image = $("#guiuploaded" + uploaded);
                    $image.attr("src", dataURL);
                    $image.attr("width", 90);
                    $image.attr("height", 120);
                    $image.show();
                }
            } else if (status === 'NoFaceFound' || status === 'MultipleFacesFound') {
                // upload failed
                recording++;
                $("#guiupload" + recording).hide();
                $("#guiwait" + recording).show();
            }
        }
    });
};