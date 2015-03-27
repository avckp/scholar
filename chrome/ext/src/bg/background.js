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
        console.log("Here");
        console.log(message.text);
        // scholar.indexedDB.addsnippets(message.text,message.URL,message.title);
        console.log("hello ::"+message);
        
        console.log("the msg text NOT init"+message.URL);
        scholar.indexedDB.addsnippets(message.text,message.URL);
        scholar.indexedDB.addsnip_parent(message.title,message.URL);
      // scholar.indexedDB.getAllsnippets();

      });
});

chrome.browserAction.onClicked.addListener(function (Tab){
  chrome.tabs.create({url:"src/review/index.html",active:true});
});
window.onload = function initial () {
  console.log( "Hi, background has been inited! Let the fun begin");
  //paste the selected data to console.
    //copy the selected dat           window.getSelectedText().toString()
    //store it to a variable          selected = window.getSelectedText().toString()
    //pass the reference here         
  // chrome.tabs.create({url:"src/review/index.html",active:true});

  // console.log( copied);
}


window.addEventListener("DOMContentLoaded", init, false);

function init() {
      scholar.indexedDB.open(); // open displays the data previously saved
      // scholar.indexedDB.flushStores();
  }

  
/*
	Database Stuff
	Using IndexedDB for storage!
*/
	var scholar = {};
	scholar.indexedDB = {};

	scholar.indexedDB.db = null;
  scholar.indexedDB.onerror = function  (e) {
   // body...
   console.log("Error::"+e.target.errorCode);}

	scholar.indexedDB.open = function() {	
  	var version = 7;
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

        if(db.objectStoreNames.contains("parent")){
         db.deleteObjectStore("parent");
        }
    
    if(db.objectStoreNames.contains("snip_parent")){
        db.deleteObjectStore("snip_parent");
    }

   	var snip_store = db.createObjectStore("snips",
      		{keyPath:"id", autoIncrement: true});
    // snip_store.createIndex("by_parent","parent");
    // snip_store.createIndex("by_tags","tags");
    snip_store.createIndex("by_URL","URL");


    var snip_parent = db.createObjectStore("parent",
      {keyPath:"id",autoIncrement:true});
    snip_parent.createIndex("by_id","id");
    snip_parent.createIndex("by_URL","URL",{unique: true});


    // var group_store = db.createObjectStore("groups",
    //      {keyPath:"id",autoIncrement: true});
  
    // group_store.createIndex("by_tags","tags");

    // var book_store = db.createObjectStore("books",
    //     {keyPath:"id",autoIncrement: true});
    // book_store.createIndex("by_tags","tags");
    };
  

	 };

	//Adding objects
	scholar.indexedDB.addsnip_parent= function(title,url) {
    console.log("in addsnip_parent");
      var db = scholar.indexedDB.db;
      var trans = db.transaction(["parent"], "readwrite");
      var store = trans.objectStore("parent");
      var request = store.add({
        
        "title": title,
        "URL": url,
        "timeStamp" : new Date().getTime(),
        "tags"  : [],
        "summary":"",
        "deleted":0
      });

      // trans.oncomplete = function(e) {
      //   // Re-render all the todo's
      //   scholar.indexedDB.getAllsnippets();
      // };
       request.onsuccess = function(event) {
    // event.target.result == customerData[i].ssn;
        console.log(event.target.result);
        return event.target.result;
      };

      request.onerror = function(e) {
        console.log(e.target.errorCode);
      };
  };
  scholar.indexedDB.findparent = function (URL) {
    var db = scholar.indexedDB.db;
    var trans = db.transaction(["parent"],"readonly");
    var store= trans.objectStore("parent");
    var index = store.index("by_URL");
    index.get(URL).onsuccess = function  (event) {
      console.log("The parent for "+URL+" is "+event.target.result.parent);
      return event.target.result.parent;
    };
  }

  scholar.indexedDB.addsnippets = function(snip,url) {
  	console.log("in addsnippets");
  		var db = scholar.indexedDB.db;
  		var trans = db.transaction(["snips"], "readwrite");
  		var store = trans.objectStore("snips");
  		var request = store.add({
        
    		"text": snip,
    		"URL": url,
    		"timeStamp" : new Date().getTime(),
        "deleted":0
  		});

  		trans.oncomplete = function(e) {
    		// Re-render all the todo's
    		// scholar.indexedDB.getAllsnippets();
        console.log("trans completed");
  		};

  		request.onerror = function(e) {
    		console.log(e.target.errorCode);
  		};
	};

  //Search by Tags 
  //**TODO** 
  // UNTESTED
  //Handling the search results
  //Create a Json and return to renderer
  scholar.indexedDB.searchByTags = function(objectStoreName, tag){
    
    var db = scholar.indexedDB.db;
    var trans = db.transaction([objectStoreName], "readwrite");
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

  /*
  update snippets by id
  pass the id, which field to update new value and 
  replace : boolean 1 for replacing the content, 0 for appending in say array fields

  */
  scholar.indexedDB.updateSnippetsById = function (objectStoreName, id, field, newValue, replace) {
    
    var db = scholar.indexedDB.db;
    var trans = db.transaction([objectStoreName], "readwrite");
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
  		var trans = db.transaction(["snips"], "readwrite");
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

	//Deleting objects by ID from objectstore
	scholar.indexedDB.deletesnips = function(objectStoreName, id) {
  		var db = scholar.indexedDB.db;
  		var trans = db.transaction([objectStoreName], "readwrite");
  		var store = trans.objectStore(objectStoreName);

  		var request = store.delete(id);

  		trans.oncomplete = function(e) {
    		scholar.indexedDB.getAllsnippets();  // Refresh the screen
  		};

  		request.onerror = function(e) {
    	console.log(e);
  		};
	};
 //flushing the stores

 scholar.indexedDB.flushStores = function(){
      var db = scholar.indexedDB.db;
      var trans = db.transaction(["snips","books","groups"], "readwrite");
      var store = trans.objectStore("snips");
      store.clear();

      store = trans.objectStore("books");
      store.clear();

      store = trans.objectStore("groups");
      store.clear();
 }
/*
	********************
*/
