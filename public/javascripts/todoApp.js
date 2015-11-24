var app = angular.module('todoApp', ['ui.router']);

app.config(['$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        console.log("app.config");
        $stateProvider.state('home', {
            url: '/home',
            templateUrl: '/home.html',
            controller: 'MainCtrl',
            resolve: {
                postPromise: ['todos', function(todos) {
                    return todos.getAll();
                }]
            }
        });
        $urlRouterProvider.otherwise("home");
    }
]);

app.factory('todos', ['$http', function($http) {
    var todoList = {
        todos: []
    };

    todoList.getAll = function() {
        return $http.get('/todos').success(function(data) {
            console.log(data);
            angular.copy(data, todoList.todos);
        });
    };
   
    todoList.maakNieuw = function(todo) {
        console.log("todoList.maakNieuw");
        return $http.post('/todos', todo).success(function(data) {});
    };
    todoList.getOneTodo = function(id) {
        return $http.get('/todos/todo',id).then(function(res) {
            return res.data;
        });
    };
    todoList.addMessage = function(id, message) {
        return $http.post('/todos/' + id + '/messages', message).success(function(data) {});
    };
    return todoList;
}]);

app.controller('MainCtrl', ['$scope', 'todos', function($scope, todos) {
    console.log("mainctrl");
    $scope.lijstTodo = todos;
    $scope.datum = {};
    $scope.datum.date = new Date();
    $scope.todo = '';

    $scope.maakNieuw = function() {
        if ($scope.datum != null && $scope.todo != '') {

            var zitErAlIn = false;
            var id = 0;

            for (var i = $scope.lijstTodo.todos.length - 1; i >= 0; i--) {
                var datumI = new Date($scope.lijstTodo.todos[i].datum);
                var datumTodo = new Date($scope.datum.date);

                if ((datumI.getDate() && datumI.getDay() && datumI.getFullYear()) === (datumTodo.getDate() && datumTodo.getDay() && datumTodo.getFullYear())) {
                    zitErAlIn = true;
                    id = $scope.lijstTodo.todos[i]._id;
                    break;
                }
            };
            if (!zitErAlIn) {
                console.log("ziterNIETin");
                todos.maakNieuw({
                    datum: $scope.datum.date.toString(),
                    message: $scope.todo
                });
            } else {
                console.log("ziterWELin");
                todos.addMessage(id, $scope.todo).success(function(message) {
                    $scope.todo.message.socket.push(message);
                });
            }


            $scope.datum.date = new Date();
            $scope.todo = '';
        }
    };


}]);
