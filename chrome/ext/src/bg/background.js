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
  			scholar.indexedDB.addsnippets(message.text,message.URL);
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
	chrome.tabs.create({url:"reviewsnips.html",active:true});

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
  		// snippets is the name of database
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

   	if(db.objectStoreNames.contains("snips")) {
     		db.deleteObjectStore("snips");
   	}

    if(db.objectStoreNames.contains("groups")) {
         db.deleteObjectStore("groups");
    }

    if(db.objectStoreNames("books")){
        db.deleteObjectStore("books");
    }

   	var snip_store = db.createObjectStore("snips",
      		{keyPath: "timeStamp"});
  	};
  
 //    snip_store.createIndex("by_tags","tags");

 //    var group_store = db.createObjectStore("groups",
 //         {keyPath: "timeStamp"});
 //    };
 //    group_store.createIndex("by_tags","tags");

 //    var book_store = db.createObjectStore("books",
 //        {keyPath: "timeStamp"});
 //    };
 //    book_store.createIndex("by_tags","tags");

	// };

	//Adding objects
	scholar.indexedDB.addsnippets = function(snip,url) {
  	
  		var db = scholar.indexedDB.db;
  		var trans = db.transaction(["snippets"], "readwrite");
  		var store = trans.objectStore("snips");
  		var request = store.put({
    		"text": snip,
    		"URL": url,
    		"timeStamp" : new Date().getTime(),
        "tags"  : [],
        "groups": [],
        "books" : [],
        "summary":"",
        "deleted":0
  		});

  		trans.oncomplete = function(e) {
    		// Re-render all the todo's
    		scholar.indexedDB.getAllsnippets();
  		};

  		request.onerror = function(e) {
    		console.log(e.value);
  		};
	};

  scholar.indexedDB.searchByTags = function(objectStoreName, tag){
    
    var db = scholar.indexedDB.db;
    var trans = db.transaction(["snippets"], "readwrite");
    var store = trans.objectStore(objectStoreName);
    var index = store.index("by_tags");

    var request = index.openCursor(IDBKeyRange.only(tag));
    
    request.onsuccess = function(){
      var cursor = request.result;
      if(cursor){
        console.log(cursor.value.text);
        cursor.continue();
      } else{
        console.log("404::Not Found Any Thing With "+tag);
      }
    };
};

  scholar.indexedDB.updateSnippetsById = function (id, field, newValue, replace) {
    
    var db = scholar.indexedDB.db;
    var trans = db.transaction(["snippets"], "readwrite");
    var store = trans.objectStore(objectStoreName);
    
    var keyRange = IDBKeyRange.only(id);
    var request = store.openCursor(keyRange);
    
    request.onsuccess = function(){
      var cursor = request.result;
      if(cursor){
        console.log(cursor.value.field);
        if(Object.prototype.toString.call(cursor.value.field) === '[object Array]' && replace)
        {
          cursor.value.field = [newValue];
        }
        else if(Object.prototype.toString.call(cursor.value.field) === '[object Array]')
        {
          cursor.value.field.push(newValue);
        }
        else if(Object.prototype.toString.call(cursor.value.field) === '[object String]' )
        {
          cursor.value.field = newValue;
        }
        cursor.continue();
      } else{
        console.log("404::Not Found Any Thing With "+tag);
      }
    };
  }
	//Retrieving objects
	scholar.indexedDB.getAllsnippets = function() {
  		
  		//var snips = document.getElementById("todoItems");
  		//todos.innerHTML = "";

  		var db = scholar.indexedDB.db;
  		var trans = db.transaction(["snippets"], "readwrite");
  		var store = trans.objectStore("snips");

  		// Get everything in the store;
  		var keyRange = IDBKeyRange.lowerBound(0);
  		var cursorRequest = store.openCursor(keyRange);

  		cursorRequest.onsuccess = function(e) {
    		var result = e.target.result;
    		if(!!result == false)
      			return;
    	
    	if(result.value.text!=null && result.value.URL!=null)
    		{
    			//renderSnip(result.value);
				console.log( "This is from the database :: " + result.value.text+" and URL " + result.value.URL);
			}
//    	renderSnip(result.value);
    	// console.log( "This is from the database :: " + result.value.text,result.value.URL);
    	result.continue();
  		};

  		cursorRequest.onerror = scholar.indexedDB.onerror;
	};

	//Deleting objects
	scholar.indexedDB.deletesnips = function(id) {
  		var db = scholar.indexedDB.db;
  		var trans = db.transaction(["snippets"], "readwrite");
  		var store = trans.objectStore("snips");

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

