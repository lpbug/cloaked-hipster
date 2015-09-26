var myApp = angular.module('todoApp', []);
myApp.controller('AppCtrl', function ($scope, $http) {

  $scope.todoList = {};
  $scope.item = {};
  refresh();

  $scope.addItem = function () {
    $scope.item.time = (new Date()).getTime();
    console.log($scope.item)
    $http.post('/todolist', $scope.item).success(function (res) {
      //console.log(res);
      refresh();
    })
  };

  $scope.remove = function (id) {
    console.log("Telling the server to remove: " + id);
    $http.delete("/todolist/" + id).success(function (res) {
      refresh();
    });
  }

  function refresh() {
    $scope.item.checked = false;
    $scope.item.name = "";
    $http.get('/todolist').success(function (res) {
      console.log(res);
      $scope.todoList = res;
    });
  }
});
