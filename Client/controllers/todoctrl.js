var myApp = angular.module('todoApp', []);
myApp.controller('AppCtrl', function ($scope, $http) {
  $scope.todoLists = [{},{}];
});