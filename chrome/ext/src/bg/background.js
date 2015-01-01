// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });


//example of using a message handler from the inject scripts
// chrome.extension.onMessage.addListener(
//   function(request, sender, sendResponse) {
//   	chrome.pageAction.show(sender.tab.id);
//     sendResponse();
//   });

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

chrome.runtime.onConnect.addListener(function(port){
	console.log("Called.")
  port.postMessage({greeting:"hello"});
});

window.onload = function init () {
	// body...
	console.log( "Hi");
	//paste the selected data to console.
		//copy the selected dat 					window.getSelectedText().toString()
		//store it to a variable					selected = window.getSelectedText().toString()
		//pass the reference here					
	document.execCommand("Paste");
	// console.log( copied);
}