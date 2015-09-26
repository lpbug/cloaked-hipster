var myApp = angular.module('checklistApp', []);
myApp.controller('AppCtrl', function ($scope, $http) {

  //Initialize item 
  $scope.item = {};
  
  //Initialize socket io 
  var socket = io();
  
  /**
   * Takes a JSON array to be sorted by the field "claimedby",
   * returns a sorted JSON array that clusters items with similar
   * "claimedby" values together
   */
  var arrange = function(jsonArray) {
    var unclaimedArray = [];
    var claimedArray = [];

    for (var i = 0; i < jsonArray.length; i++) {
      claimedby = jsonArray[i].claimedby;
      if(claimedby=="") {
        unclaimedArray.push(jsonArray[i]); 
      } else {
        claimedArray.push(jsonArray[i]);
      }
    }

    claimedArray.sort(function(a,b) {
      console.log("sorting claimed Array");  
      if (a.claimedby >= b.claimedby) {
        return 1;
      } else {
        return -1;
      };
    });

    console.log(claimedArray);

    return unclaimedArray.concat(claimedArray);

  };

  var refresh = function() {
    $http.get('/itemlist').success(function(res) {
      console.log("Refreshing");
      $scope.itemlist = arrange(res);
      
      //console.log(res);

      //Reset values
      $scope.item.name = "";
      $scope.item.check = false;
      $scope.item.claim = false;
      $scope.item.claimby = "";

      

    })
  };
  
  console.log("Checklist app controller started")
  //Load up the page
  refresh();
 
//Initialize heartbeat, which refreshes the page if the heartbeat has been lost for more than 5 seconds  
var lastHeartbeat=(new Date()).getTime();
//For debugging, print the number of times that refresh has kicked in due to heartbeat timeout
var count = 0;
setInterval(function() {
  currentHeartbeat = (new Date()).getTime();
  console.log("Heartbeat");
  if (currentHeartbeat > (lastHeartbeat + 5000)) {
    document.getElementById('test-counter').innerHTML = count;
    count +=1
    refresh();
  }
  lastHeartbeat = currentHeartbeat;
  },1000);

  socket.on("refresh", function() {
    refresh();
    //Vibrate the device for feedback
    if('vibrate' in navigator) {
      navigator.vibrate(100);      
    };
  });
  
  $scope.checkstatus = function (item) {
    //console.log(item.checked);
    return item.checked;
  };
  
  $scope.claimed = function (id, status, name) {
    if (status) {
      console.log(id + "has been claimed by:" + name);
      $http.post(/itemclaim/+id+"/"+status+"/"+name).success(function(res){
        //may be unnecessary
        refresh();  
      });
    } else {
      console.log(id + "has been unclaimed by:" + name);
      $http.post(/itemclaim/+id+"/"+status+"/"+name).success(function(res){
        //may be unnecessary
        refresh();  
      });
    }    
  };
  
  $scope.checked = function(id,status) {
    console.log(id + "has been set to:" + status);
    //Tell server that status has been changed
    console.log("Telling the server to check: " + id);
    $http.post("/itemcheck/"+id+"/"+status).success(function(res) {
      //may be unnecessary
      refresh();
    });
  }
  
  $scope.remove = function(id) {
    console.log("Telling the server to remove: " + id);
    $http.delete("/itemlist/"+id).success(function(res) {
      //may be unnecessary
      refresh();
    });
  }
  
  $scope.addItem = function() {
    console.log($scope.item);
    if($scope.item.claim) {$scope.item.claimby=$scope.shopper.name};
    $scope.item.time= (new Date()).getTime();
    $http.post('/itemlist',$scope.item).success(function (res) {
      //console.log(res);
      refresh();
    })
  };
  
  $scope.refresh = refresh;
});
