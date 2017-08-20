
    var app = angular.module("scholarapp",["ngRoute"]);
    
    app.config(['$routeProvider',function($routeProvider) {
        $routeProvider.when('/all',{
            templateUrl: 'template/all.html'
        }).
        when('/grouped',{
            templateUrl: 'template/grouped.html'
            
        }).
        when('/about',{
            templateUrl: 'template/about.html',
            controller: 'AppController'
        }).
        when('/ind',{
            templateUrl: 'index1.html'
        }).
        otherwise({
            redirectTo: '/grouped'
        });
    }]);
    app.controller("AppController",function ($scope,$timeout,dexiedb) {
        $scope.datais={};
        $scope.dataisdata={};
        $scope.dataisdata.array=[];
        $scope.datais.array =[];
        $scope.alldata = {};

       var scholar = {};

       scholar.indexedDB = {};
       scholar.indexedDB.db = null;
       scholar.indexedDB.onerror = function  (e) {
        console.log("Error::"+e.target.errorCode);
        };

       var _db;
        

        window.initial = 0;
     var callback_alldata = function(err,data){
      if(!err){
         // $scope.$apply(function() {
         $timeout(function(){
            $scope.alldata = data;
                });
     }
      console.log('in callback_alldata ',err,data);
    };
    var callback_parents = function (err,data) {
      if(!err){
         // $scope.$apply(function() {
          $timeout(function(){
            $scope.datais.array.push(data);
                });
     }
      console.log('in callback_parents ',err,data);
    }
    var callback_snips = function (err,data) {
      if(!err){
         // $scope.$apply(function() {
        $timeout(function(){
            $scope.dataisdata.array.push(data);
                });
     }
      console.log('in callback_snips ',err,data);
    }

     var init = function() {
                console.log('hi in init');
/*Example
var db = new Dexie("puppets");
db.version(1).stores({
    snips: "++id, text, URL, timeStamp, deleted",
    parent: "++id, title, URL, timeStamp, *tags, summary, deleted"
});

db.open().catch(function (e) {
    console.error("Open failed: " + e.stack);
});

db.transaction('rw', db.snips, function () {
  console.log('in dbusers transaction');
   
    db.snips.add({text:'abhishek pandey is db man', URL:'www.abhishek.com',timeStamp:12121221,deleted:0});
    db.snips.where("URL").startsWith("www")
        .each(function (user) {
            console.log("Found text: " + user.text);
        });

}).catch (function (e) {
    console.error(e.stack);
});

End Example*/
    console.log(dexiedb);
    dexiedb.getdata(callback_alldata);
    dexiedb.getparents(callback_parents);
    dexiedb.getsnips(callback_snips);
    console.log($scope);
    };
     
   init(); 


    scholar.indexedDB.updateSnippetsById = function (objectStoreName, id, field, newValue, replace) {
    
    var db = scholar.indexedDB.db;
    var trans = db.transaction([objectStoreName], "readwrite");
    var store = trans.objectStore(objectStoreName);
    
    var request = store.get(id);
    // var keyRange = IDBKeyRange.only(id);
    // var request = store.openCursor(keyRange);
    
    request.onsuccess = function(e){
      
        // console.log("successful updation "+request.result);
        // console.log(request);
        var data = request.result;
        data.summary = newValue;
        // console.log("successful updation "+data.field);
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

        // scholar.indexedDB.open();        
        $scope.updatesummary = function(id,summary) {
            // scholar.indexedDB.updateSnippetsById(objectStoreName, id, field, newValue, replace);
            scholar.indexedDB.updateSnippetsById("parent", id, "summary", summary, 1);
        };

        $scope.trashthis = function(i,id) {
            //i=0 for parent
            //i=1 for snips
            console.error("id id "+id);
            if(i==1){
              dexiedb.deletesnips(id);
            }
            // scholar.indexedDB.getAllparents();
            // scholar.indexedDB.getAllsnippets();
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
        //create hashtags
        $scope.returnall = function(tagarray){
          var tags = "";
          for (var i = 0; i < (tagarray.length -1); i++) {
            tags+= "#"+tagarray[i] + ", "
          };
          tags+= "#"+tagarray[tagarray.length-1];
          return tags;
        }

        //on click of hashtag search
        $scope.searchHashTag = function(value){
          console.log(value+"__ value");
          $scope.searchtext = value;
        }
    });

app.service('dexiedb',function(){
    
      var createdData = {};
      var _db = null;
      var parentData = {};
      var snipsData = {};

      var service = {};
      service.init = function(){
      console.log('service.init called');

        _db = new Dexie('puppets');

        _db.version(1).stores({
            snips: "++id, text, URL, timeStamp, deleted",
            parent: "++id, title, URL, timeStamp, *tags, summary, deleted"
        });

        _db.open().then(function(){
          service.createdata();
          service.getAllparents();
          service.getAllsnippets();
          
          console.log('service.init then called');

         }).catch(function(e){
          console.log('error opening',e);
                });
      };

       service.createdata = function(callback){
          console.log('createdata');
            var alldata = [];
          _db.transaction('rw',_db.parent, _db.snips, function(){
            
            _db.parent.each(function(par){
              var r = {'parent':par,'snips':[]};
              _db.snips.where('URL').equals(par.URL).each(function(snip){
                  r.snips.push(snip);
              });
              alldata.push(r);
              // console.log(alldata);
            }).then(function(){
              createdData = alldata;
              console.log('createdata',createdData);
              if (callback) {
                return callback(null,createdData);
              }
              return createdData;
            }).catch(function(e){
              console.error('error createdata', e);
            });
          });
        };

        service.getAllparents = function(callback){
            console.log('In getAllparents ');
            var r = [];
            
            _db.transaction('rw',_db.parent,function(){
            
            _db.parent.each(function(parent){
            // console.log(parent.URL,parent.id);
            
                r.push(parent);
            
            }).then(function(){
                parentData = r;
                console.log('parentData',parentData,r);
                if (callback) {
                  return callback(null,parentData);
                }
                return parentData;
            });

              

           });
        };

     service.getAllsnippets = function(callback) {
        console.log('In getAllsnippets ');
         var r = [];

            _db.transaction('rw',_db.snips,function(){
              
                _db.snips.each(function(snip){
                    // console.log(snip.URL,snip.id,snip.text);
                    r.push(snip);
                    //console.log('r',r);
              }).then(function(){
                  snipsData = r;
                console.log('scholar.indexedDB.getAllparents',snipsData,r);
                if (callback) {
                  return callback(null,snipsData);
                }
                return snipsData;
              });  
            });

        };

       //Deleting objects by ID from objectstore
    service.deletesnips = function(id) {

        _db.transaction('rw',_db.snips,function(){

            _db.snips.delete(parseInt(id)).then(function(e){
            console.log('deleted');
            return service.createdata();
          });
        });
    };

    service.getsnips = function(callback){
      console.log(snipsData);
      if (Object.keys(snipsData).length==0) {
        return service.getAllsnippets(callback);
      } else return callback(null,snipsData);
    };
      
    service.getparents = function(callback){
      console.log(parentData);
      if (Object.keys(parentData).length==0) {
        return service.getAllparents(callback);
      } else return callback(null,parentData);
    };
    service.getdata = function(callback){
      // console.log(createdData);
      if (Object.keys(createdData).length==0) {
        console.log('createdData was empty');
        return service.createdata(callback);
      } else return callback(null,createdData);
    }


    service.init();
    
    return service;
    
  });
