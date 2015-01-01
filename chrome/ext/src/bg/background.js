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

//Listener for connections from other tabs
chrome.runtime.onConnect.addListener(function(port){
	console.log("chrome.runtime.onConnect.addListener called for background page.\n Attempting to send a message now...");
  	port.postMessage({greeting:"hello"});
  	port.onMessage.addListener(
  		function(message, sender) {
  			console.log(message);
  			scholar.indexedDB.addsnippets(message.text);
  		});
});
//Message Listener
chrome.runtime.onMessage.addListener(
	function(message,sender){
			console.log("hello ::"+message);
			scholar.indexedDB.addsnippets(message.text);
			scholar.indexedDB.getAllsnippets();
		});

window.onload = function initial () {
	console.log( "Hi, background has been inited! Let the fun begin");
	//paste the selected data to console.
		//copy the selected dat 					window.getSelectedText().toString()
		//store it to a variable					selected = window.getSelectedText().toString()
		//pass the reference here					
	document.execCommand("Paste");
	// console.log( copied);
}

/*
	Database Stuff
	Using IndexedDB for storage!
*/
	var scholar = {};
	scholar.indexedDB = {};

	scholar.indexedDB.db = null;

	scholar.indexedDB.open = function() {
  	
  		var version = 1;
  		var request = indexedDB.open("snippets", version);

  		request.onsuccess = function(e) {
    		scholar.indexedDB.db = e.target.result;
    		scholar.indexedDB.getAllsnippets();
  		};

  		request.onerror = scholar.indexedDB.onerror;
  		
  		// We can only create Object stores in a versionchange transaction.
  		request.onupgradeneeded = function(e) {
    	var db = e.target.result;
    	// A versionchange transaction is started automatically.
    	e.target.transaction.onerror = scholar.indexedDB.onerror;

    	if(db.objectStoreNames.contains("snippets")) {
      		db.deleteObjectStore("snippets");
    	}

    	var store = db.createObjectStore("snippets",
      		{keyPath: "timeStamp"});
  		};
	};

	//Adding objects
	scholar.indexedDB.addsnippets = function(snip) {
  	
  		var db = scholar.indexedDB.db;
  		var trans = db.transaction(["snippets"], "readwrite");
  		var store = trans.objectStore("snippets");
  		var request = store.put({
    		"text": snip,
    		"timeStamp" : new Date().getTime()
  		});

  		trans.oncomplete = function(e) {
    		// Re-render all the todo's
    		scholar.indexedDB.getAllsnippets();
  		};

  		request.onerror = function(e) {
    		console.log(e.value);
  		};
	};

	//Retrieving objects
	scholar.indexedDB.getAllsnippets = function() {
  		
  		//var snips = document.getElementById("todoItems");
  		//todos.innerHTML = "";

  		var db = scholar.indexedDB.db;
  		var trans = db.transaction(["snippets"], "readwrite");
  		var store = trans.objectStore("snippets");

  		// Get everything in the store;
  		var keyRange = IDBKeyRange.lowerBound(0);
  		var cursorRequest = store.openCursor(keyRange);

  		cursorRequest.onsuccess = function(e) {
    		var result = e.target.result;
    		if(!!result == false)
      			return;
    	
    	//renderTodo(result.value);
    	console.log( "This is from the database :: " + result.value.text);
    	result.continue();
  		};

  		cursorRequest.onerror = scholar.indexedDB.onerror;
	};

	//Deleting objects
	scholar.indexedDB.deletesnips = function(id) {
  		var db = scholar.indexedDB.db;
  		var trans = db.transaction(["snippets"], "readwrite");
  		var store = trans.objectStore("snippets");

  		var request = store.delete(id);

  		trans.oncomplete = function(e) {
    		scholar.indexedDB.getAllsnippets();  // Refresh the screen
  		};

  		request.onerror = function(e) {
    	console.log(e);
  		};
	};

	function init() {
  		scholar.indexedDB.open(); // open displays the data previously saved
	}

	window.addEventListener("DOMContentLoaded", init, false);
/*
	********************
*/