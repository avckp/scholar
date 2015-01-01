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

 
window.onload = function anon () {
	// body...
	// alert("HiHiHiHi");
	console.log("Hi from the injected page.");	
}
var port = chrome.runtime.connect({name:"mycontentscript"});

port.onMessage.addListener(function(message,sender){
  console.log(message);

  if(message.greeting === "hello"){
    alert(message.greeting);
  }
});