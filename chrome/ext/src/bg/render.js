/*
	Database Stuff
	Using IndexedDB for storage!
*/
	var scholar = {};
	scholar.indexedDB = {};

	scholar.indexedDB.db = null;

	scholar.indexedDB.open = function() {	
  	var version = 4;
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

    if(db.objectStoreNames.contains("books")){
        db.deleteObjectStore("books");
    }

   	var snip_store = db.createObjectStore("snips",
      		{keyPath:"id", autoIncrement: true});
    snip_store.createIndex("by_tags","tags");

    var group_store = db.createObjectStore("groups",
         {keyPath:"id",autoIncrement: true});
  
    group_store.createIndex("by_tags","tags");

    var book_store = db.createObjectStore("books",
        {keyPath:"id",autoIncrement: true});
    book_store.createIndex("by_tags","tags");
    };
  

	 };

	//Adding objects
	scholar.indexedDB.addsnippets = function(snip,url) {
  	
  		var db = scholar.indexedDB.db;
  		var trans = db.transaction(["snips"], "readwrite");
  		var store = trans.objectStore("snips");
  		var request = store.add({
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
    			renderSnip(result.value);
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

	function init() {
  		scholar.indexedDB.open(); // open displays the data previously saved
	}

	window.addEventListener("DOMContentLoaded", init, false);


	function renderSnip(row) {
	  var container = document.getElementById("big-container");
	  var divCard = document.createElement("div");
	  var divClose = document.createElement("div");
	  var a = document.createElement("a");
	  var divSnip = document.createElement("div");

	  divSnip.innerHTML = row.text;
	  a.href=row.URL;
	  a.appendChild(divSnip);
	  divCard.appendChild(divClose);
	  divCard.appendChild(a);
	  container.appendChild(divCard);

	  divClose.addEventListener("click", function(e){
	  	divCard.className = "hidden";
	  });


	}	

// <div class="card">
// 		<div class="close-btn"></div>

// 		<a class="snip-link" href="">Visit</a>
// 		<div class="snip">
// 				Main Content
// 		</div>
// 		<div class="snip-summary-container">
// 			<div class="snip-summary">
// 				This is the summary of the snips
// 			</div>
// 			<div class="snip-editor">

// 			</div>
// 		</div>
// 		<div class="snip-tag-container">
// 		</div>
// 		<div>

// 		</div>
// 	</div>

	function renderSnip(row) {
	  var container = document.getElementById("big-container");
	  var divCard = document.createElement("div");
	  var divClose = document.createElement("span");
	  var a = document.createElement("a");
	  var divSnip = document.createElement("div");

	  console.log(row);
	  
	  divSnip.innerHTML = row.text;
	  divSnip.setAttribute('data-id',row.id);
	  divSnip.className="snip";

	  a.href=row.URL;
	  a.className="snip-link";

	  a.appendChild(divSnip);
	  divClose.innerHTML="X";
	  divClose.className="close-btn";
	  divCard.appendChild(divClose);
	  divCard.appendChild(a);
	  divCard.className="card";
	  
	  container.appendChild(divCard);

	  divClose.addEventListener("click", function(e){
	  	divCard.className = "hidden";
	  });
	}