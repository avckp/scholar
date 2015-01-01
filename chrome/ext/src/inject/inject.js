// chrome.extension.sendMessage({}, function(response) {
// 	var readyStateCheckInterval = setInterval(function() {
// 	if (document.readyState === "complete") {
// 		clearInterval(readyStateCheckInterval);

// 		// ----------------------------------------------------------
// 		// This part of the script triggers when page is done loading
// 		console.log("Hello. This message was sent from scripts/inject.js");
// 		// ----------------------------------------------------------

// 	}
// 	}, 10);
// });

 
//Checks the version of chrome and appropriate method for msg passing
if (!chrome.runtime) {
    // Chrome 20-21
    chrome.runtime = chrome.extension;
} else if(!chrome.runtime.onMessage) {
    // Chrome 22-25
    chrome.runtime.onMessage = chrome.extension.onMessage;
    chrome.runtime.sendMessage = chrome.extension.sendMessage;
    chrome.runtime.onConnect = chrome.extension.onConnect;
    chrome.runtime.connect = chrome.extension.connect;
}

window.onload = function anon () {
	// body...
	// alert("HiHiHiHi");
	console.log("Hi from the injected page.");	
}
var port = chrome.runtime.connect({name:"mycontentscript"});

port.postMessage({greeting:"Calling you from Inject script. If this works I can pass random things from here."});

port.onMessage.addListener(function(message,sender){
  
  console.log(message);

  if(message.greeting === "hello"){
    //alert(message.greeting);
    console.log(message.greeting);
  }
});

document.onmousedown = sendSelection;
URL = document.URL;
function sendSelection () {
	// body...
	selected = window.getSelection().toString();
	if(selected !="")
	{
		port.postMessage({text:selected,URL:URL});
	}
}