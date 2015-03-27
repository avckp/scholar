
    var app = angular.module("scholarapp",["ngRoute"]);
    
    app.config(['$routeProvider',function($routeProvider) {
        $routeProvider.when('/all',{
            templateUrl: 'template/all.html',
            controller: 'AppController'
        }).
        when('/grouped',{
            templateUrl: 'template/grouped.html',
            controller: 'AppController'
        }).
        when('/about',{
            templateUrl: 'template/about.html',
            controller: 'AppController'
        }).
        otherwise({
            redirectTo: '/grouped'
        });
    }]);

    app.controller("AppController",function ($scope) {
        $scope.datais={};
        $scope.dataisdata={};

      /**/
       var scholar = {};
       scholar.indexedDB = {};
       scholar.indexedDB.db = null;
       scholar.indexedDB.onerror = function  (e) {
        console.log("Error::"+e.target.errorCode);
        };

        scholar.indexedDB.open = function() {   
        var version = 7;
        console.log("opening");
            // snippets is the name of database
        var request = indexedDB.open("snippets", version);
        console.log(request);
        request.onsuccess = function(e) {
            scholar.indexedDB.db = e.target.result;
            console.log("request successful");
            // scholar.indexedDB.flushStores();
            // scholar.indexedDB.deletesnips("parent",15);
            // scholar.indexedDB.updateSnippetsById("parent", 43, "summary", "not useful site", 1);
            scholar.indexedDB.getAllparents();
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
        snip_store.createIndex("by_parent","parent");
        snip_store.createIndex("by_tags","tags");
        
        var snip_parent = db.createObjectStore("parent",
            {keyPath:"id",autoIncrement:true});
        snip_parent.createIndex("by_id","id");
        snip_parent.createIndex("by_URL","URL");
    };
  

   };
   // init(); 
     
    //Adding objects




    //Retrieving objects


    scholar.indexedDB.getAllparents = function() {
        // init();
        //var snips = document.getElementById("todoItems");
        //todos.innerHTML = "";
        var r=[];
        var db = scholar.indexedDB.db;
        if (db==null) {init();};
        var trans = db.transaction(["parent"], "readwrite");
        var store = trans.objectStore("parent");

        // Get everything in the store;
        var keyRange = IDBKeyRange.lowerBound(0);
        var cursorRequest = store.openCursor(keyRange);

        cursorRequest.onsuccess = function(e) {
            var result = e.target.result;
            if(!!result == false)
                return;
        if(result){
            if(result.value.URL!=null)
                {
                    //renderSnip(result.value);
                    // console.log( "This is from the database :: " + result.value.text+" and URL " + result.value.URL);
                    r.push (result.value);
                    
                }
            result.continue();
        }
        
            console.log("While Fetch::: "+r);
            $scope.$apply(function() {
                $scope.datais.data=r;
                });
        
//      renderSnip(result.value);
        
console.log( "This is from the database parent :: " );
console.log($scope.datais);
        
        };
        cursorRequest.onerror = scholar.indexedDB.onerror;
        // return cursorRequest;
    };


    scholar.indexedDB.getAllsnippets = function() {
        // init();
        //var snips = document.getElementById("todoItems");
        //todos.innerHTML = "";
        var r=[];
        var db = scholar.indexedDB.db;
        if (db==null) {init();};
        var trans = db.transaction(["snips"], "readwrite");
        var store = trans.objectStore("snips");

        // Get everything in the store;
        var keyRange = IDBKeyRange.lowerBound(0);
        var cursorRequest = store.openCursor(keyRange);

        cursorRequest.onsuccess = function(e) {
            var result = e.target.result;
            if(!!result == false)
                return;
        if(result){
            if(result.value.text!=null && result.value.URL!=null)
                {
                    //renderSnip(result.value);
                    // console.log( "This is from the database :: " + result.value.text+" and URL " + result.value.URL);
                    r.push (result.value);
                    
                }
            result.continue();
        }
        
            console.log("While Fetch::: "+r);
            $scope.$apply(function() {
                $scope.dataisdata.realdata=r;
                });
        
//      renderSnip(result.value);
        
console.log( "This is from the database snips:: " );
console.log($scope.dataisdata.realdata);
        
        };
        cursorRequest.onerror = scholar.indexedDB.onerror;
        // return cursorRequest;
    };

    //Deleting objects by ID from objectstore
    scholar.indexedDB.deletesnips = function(objectStoreName, id) {
        // console.error("obsn "+objectStoreName);
        var db = scholar.indexedDB.db;
        var trans = db.transaction([objectStoreName], "readwrite");
        var store = trans.objectStore(objectStoreName);

        var request = store.delete(id);

        trans.oncomplete = function(e) {
            // scholar.indexedDB.getAllfpets();  // Refresh the screen
            console.log("Deleted");
        };

        request.onerror = function(e) {
        console.log(e);
        };
    };

    scholar.indexedDB.updateSnippetsById = function (objectStoreName, id, field, newValue, replace) {
    
    var db = scholar.indexedDB.db;
    var trans = db.transaction([objectStoreName], "readwrite");
    var store = trans.objectStore(objectStoreName);
    
    var request = store.get(id);
    // var keyRange = IDBKeyRange.only(id);
    // var request = store.openCursor(keyRange);
    
    request.onsuccess = function(e){
      
        console.log("successful updation "+request.result);
        console.log(request);
        var data = request.result;
        data.summary = newValue;
        console.log("successful updation "+data.field);
        var req_update = store.put(data);
        req_update.onerror=function() {
            console.log("shit happened");
        };
        req_update.onsuccess=function() {
            console.log("Did it");
        };
        
      }
    request.onerror =function(){
        console.log("404::Not Found Any Thing ");
      }
    };
  

 //flushing the stores

 scholar.indexedDB.flushStores = function(){
      var db = scholar.indexedDB.db;
      var trans = db.transaction(["snips","parent"], "readwrite");
      var store = trans.objectStore("snips");
      store.clear();

      store = trans.objectStore("parent");
      store.clear();

 }
  /**/
        // $scope.load= function  () {
        //     // body...
        //     alert("loaded");
        // }
        // $scope.load = dbfactory.init();
        console.log(" in ");

        console.log("dbfactory");

        scholar.indexedDB.open();        
        $scope.updatesummary = function(id,summary) {
            // scholar.indexedDB.updateSnippetsById(objectStoreName, id, field, newValue, replace);
            scholar.indexedDB.updateSnippetsById("parent", id, "summary", summary, 1);
        };
        $scope.trashthis = function(i,id) {
            //i=0 for parent
            //i=1 for snips
            console.error("id id "+id);
            scholar.indexedDB.deletesnips((i?"snips":"parent"),id);
            scholar.indexedDB.getAllparents();
            scholar.indexedDB.getAllsnippets();
        };
        $scope.checkURL = function(l,k,m) {
            // console.debug("Received "+l+" + "+ k);
            return l===k && m;
        };
        $scope.islegit = function(p) {
            if(p)
                return false;
            else return true;
        };
        $scope.getinitialdata = function() {
            return document.URL;
        };
    });