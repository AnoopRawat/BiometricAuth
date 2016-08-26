/*====================================
 JQUERY SCRIPTS 
====================================*/


$(document).ready(function () {
    // pop up js
    $('.popup').click(function () {
        $('.overlay').css('display', 'block');
        $('.popup1').css('display', 'block')
    });
    $('.close').click(function () {
        $('.overlay').css('display', 'none');
        $('.popup1').css('display', 'none')
    });
    $('.setting-link').click(function () {
        $(this).parent().find('.setting-list').toggleClass('active');
    });
    $('.setting-list').click(function () {
        $(this).toggleClass('active');
        $(this).parent().parent().parent().hide();
    });
    // language-list js
    $('.language').click(function () {
        $('.language-list').toggleClass('active');
    });
    /*$('.language-list').click(function(){
        $(this).hide();
    });*/
    // collapse-link js
    $('.collapse-link.defaullt').click(function () {
        $(this).toggleClass('closed');
        $(this).parent().parent().parent().parent().find('.child-content').slideToggle("fast");
    });
    // section collapse 
    $('.collapse-arrow').click(function () {
        $(this).toggleClass('close');
        $(this).parent().parent().parent().find('.hide-section').toggleClass('active');
    });
    // graph collapse 
    $('.graph-link').click(function () {
        $(this).parent().parent().find('.hide-section').toggleClass('active');
    });
    //collapse section 
    $('.collase-icon').click(function () {
        $(this).toggleClass('remove');
        $(this).parent().find('.open-detail').toggleClass('close');
        $('.collapse-section').toggleClass('border');
    });
    // calender selection
    //$('td').filter('[data-year='2014']').filter('[data-month='9']').find('a').css({border: '5px solid #F00'});
    // right section open
    $('.right-side-link').click(function () {
        $('.right-section').toggleClass('enable');
    });
    $('.sub-nav').hover(function () {
        $(this).parent().addClass('selected');
    }, function () {
        $(this).parent().removeClass('selected');
    });
    if (jQuery(window).width() < 767) {
        $('.sub-nav').hover(function () {
            $(this).parent().removeClass('selected');
        });
    }
    $('.social-icon').hover(function () {
        $(this).clearQueue().stop().animate({ 'right': '0px' }, 500);
    });
    $('.social-icon').mouseleave(function (e) {
        $(this).clearQueue().stop().animate({ 'right': '-92px' }, 500);
    });
    $('.menu-link').click(function () {
        $('.menu').toggleClass('active');
    });
    $('.monthly-rating li a').click(function () {
        $('.monthly-rating a').removeClass('active');
        $(this).addClass('active');
        var currenttab = $(this).attr('href');
        $('.graph-container > div').slideUp();
        $(currenttab).slideDown();
        return false;
    });


    $('#addPayeeSubmitBtn').click(function (e) {
        if ($("#otpTextID").val() === '1234') {
            alert('Payee Added Successfully !!')
            window.location.href = 'index.html';
        } else {
            alert('Incorrect OTP');
        }
    })

    $('#loginSubmitBtn').click(function (e) {
        if ($("#otpTextID").val() === '1234') {
            alert('OTP verified Successfully !!')
            window.location.href = 'index.html';
        } else {
            alert('Incorrect OTP');
        }
    })
    $('#transferModalBtn').click(function (e) {
        window.location.href = 'login-1.html';
    })
});

var final_transcript = 'hello';
var recognizing = false;

if ('webkitSpeechRecognition' in window) {
    var imgJsonArray = new Array();
    var recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onstart = function () {
        recognizing = true;
    };

    recognition.onerror = function (event) {
        console.log(event.error);
    };

    recognition.onend = function () {
        recognizing = false;
    };

    recognition.onresult = function (event) {
        console.log(event.results);
        //alert('A');
        var interim_transcript = '';
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
                //alert(final_transcript);
                if (final_transcript.toLowerCase().indexOf("open") > -1) {

                    if (final_transcript.length > 6) {
                        navigate(final_transcript.toLowerCase().split('open')[1]);
                    }
                }
            } else {
                interim_transcript += event.results[i][0].transcript;
            }
        }

        if (final_transcript) {
            switch (true) {
                case (final_transcript.indexOf("index") > -1) || (final_transcript.indexOf("password") > -1):
                    {
                        window.location.href = '/index.html';
                    }
                    break;
                case final_transcript.indexOf("giro") > -1:
                    {
                        window.location.href = '/giro.html';
                    }
                    break;
                case final_transcript.indexOf("transfer") > -1:
                    {
                        window.location.href = '/transfer-step-1.html';
                    }
                    break;
                case final_transcript.indexOf("deposit") > -1:
                    {
                        window.location.href = '/term-deposit.html';
                    }
                    break;
                case final_transcript.indexOf("cheque") > -1:
                    {
                        window.location.href = '/issueChequeBook.html';
                    }
                    break;
                case final_transcript.indexOf("payee") > -1:
                    {
                        window.location.href = '/addPayee.html';
                    }
                    break;
                case final_transcript.indexOf("out") > -1:
                    {
                        window.location.href = '/login-1.html';
                    }
                    break;
            }
        }
    };
}

var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
    return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}

function capitalize(s) {
    return s.replace(s.substr(0, 1), function (m) { return m.toUpperCase(); });
}

function startDictation(event) {
    if (recognizing) {
        recognition.stop();
        return;
    }
    final_transcript = '';
    recognition.lang = 'en-US';
    recognition.start();
    final_span.innerHTML = '';
    interim_span.innerHTML = '';
}
