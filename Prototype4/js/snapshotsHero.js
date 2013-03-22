var video,canvas,context = null;
picsArray = [];

//$(document).ready(function(){
//	initDOM();
//});
$(document).ready(function(){
	initDOM();
	var nSeconds = 10;
	window.setInterval(function(){
		takeSnapshot();
	},nSeconds*1000);
});


function errorFn(e) {
    console.log('error', e);
};

function initDOM(){
	console.log(document);
	video = document.createElement('video');
	video.setAttribute('autoplay', true);
	video.style.display = 'none';

	canvas = document.createElement('canvas');
	canvas.setAttribute('id','snapshotsCanvas');
	canvas.setAttribute('width', 640);
	canvas.setAttribute('height', 480);	
	canvas.style.display = 'none';
	context = canvas.getContext('2d');
	window.URL = window.URL || window.webkitURL;
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

	
	
	navigator.getUserMedia({video: true, audio: true}, function(stream) {
	        video.src = window.URL.createObjectURL(stream);
	        localMediaStream = stream;
	        context.drawImage(video,0,0,canvas.width,canvas.height);

	}, errorFn);
};

function takeSnapshot(){
	console.log('taking snapshot');
	context.drawImage(video,0,0);
	//var imgUrl = canvas.toDataURL('image/png');
    var img = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
	upload2imgur(img);
};


function upload2imgur(img){
	$.ajax({
		url: 'https://api.imgur.com/3/image',
		type: 'POST',
		headers:{
		    Authorization: 'Client-ID 22e8729d97c8bd1'
		},

		data: {
		    //type: 'base64',
		    // get your key here, quick and fast http://imgur.com/register/api_anon
		    image: img
		},
		dataType: 'json'
    }).success(function(data) {
    	console.log("Successfully uploaded to imgur")
    	picsArray.push(data.data.link)
		localStorage.picsArray = JSON.stringify(picsArray);//LocalStorage only allows string. To parse, issue the command JSON.parse(localStorage.picsArray)
	
    }).error(function() {
        //alert('Could not reach api.imgur.com. Sorry :(');
    });
}



/*
$(document).click(function(){
	takeSnapshot();
	var img = document.createElement('img');
	img.setAttribute('src',picsArray[picsArray.length-1]);
	img.style.display = 'block';
    document.getElementById('pics').appendChild(img);
});*/