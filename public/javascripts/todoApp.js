var app = angular.module('todoApp', ['ui.router']);

app.config(['$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
    	console.log("app.config");
        $stateProvider.state('home', {
            url: '/home',
            templateUrl: '/home.html',
            controller: 'MainCtrl'
        });
        $urlRouterProvider.otherwise("home");
    }
]);

app.factory('todos', [function(){
	var todoList = {
		todos: [
		{title: "nummer 1", message:"ik moet nummer 1 nog doen."},
		{title: "nummer 2", message:"ik moet nummer 2 nog doen."},
		{title: "nummer 3", message:"ik moet nummer 3 nog doen."}
		]
	};
	return todoList;
}]);

app.controller('MainCtrl', ['$scope','todos', function($scope,todos) {
console.log("mainctrl");
$scope.lijstTodo = todos;
    $scope.maakNieuw = function() {
        if ($scope.title != null && $scope.todo != null) {
            console.log($scope.title);
            console.log($scope.todo);
            $scope.lijstTodo.todos.push({title: $scope.title, message: $scope.todo});
        }
    };
}]);


