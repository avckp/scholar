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
	scholar.indexedDB.addsnippets = function(snip,url) {
  	
  		var db = scholar.indexedDB.db;
  		var trans = db.transaction(["snippets"], "readwrite");
  		var store = trans.objectStore("snippets");
  		var request = store.put({
    		"text": snip,
    		"URL": url,
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
    	
    	if(result.value.text!=null && result.value.URL!=null)
    		{
    			renderSnip(result.value);
				console.log( "This is from the database :: " + result.value.text);
			}
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
/*
<div class="card">
		<div class="close-btn">
		</div>
		<a class="snip-link" href="">
			<div class="snip">
				Main Content
			</div>
		</a>
		<div>

		</div>
	</div>
*/
	function renderSnip(row) {
	  var container = document.getElementById("big-container");
	  var divCard = document.createElement("div");
	  var divClose = document.createElement("span");
	  var a = document.createElement("a");
	  var divSnip = document.createElement("div");

	  divSnip.innerHTML = row.text;
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