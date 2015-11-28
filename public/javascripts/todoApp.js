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
            angular.copy(data, todoList.todos);
        });
    };

    todoList.maakNieuw = function(todo) {
        return $http.post('/todos', todo).success(function(data) {
            todoList.todos.push(data);
        });
    };
    todoList.getOne = function(id) {
        return $http.get("/todos/" + id).then(function(res) {
            return res.data;
        });
    };
    todoList.voegToe = function(id, message) {
        var config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        return $http.post('/todos/' + id + '/message', message, config).
        success(function(data) {
            console.log(data);
            for (var i = todoList.todos.length - 1; i >= 0; i--) {
                if (todoList.todos[i]._id === id) {
                    todoList.todos[i].messages.push(data.message);
                    break;
                }
            };
        });
    };
    return todoList;
}]);

app.controller('MainCtrl', ['$scope', 'todos', function($scope, todos) {
    console.log("mainctrl");
    $scope.lijstTodo = todos;
    $scope.datum = {};
    $scope.datum.date = new Date();

    $scope.maakNieuw = function() {
        if ($scope.datum.date != null && $scope.todo != null && $scope.todo != '') {
            //eerst checken of dat het er al in zit
            //indien het er nog niet inzit: maakNieuw
            //indien het er inzit: update messages
            var datumZitAlInDeLijst = false;
            var datumVanTodo = new Date($scope.datum.date);
            var datumVanTodoModified = datumVanTodo.getDate() + '/' + datumVanTodo.getMonth() + '/' + datumVanTodo.getFullYear();
            var id = 0;

            for (var i in $scope.lijstTodo.todos) {
                var datumVanFor = new Date($scope.lijstTodo.todos[i].datum);
                var datumVanForModified = datumVanFor.getDate() + '/' + datumVanTodo.getMonth() + '/' + datumVanTodo.getFullYear();

                if (datumVanForModified === datumVanTodoModified) {
                    datumZitAlInDeLijst = true;
                    id = $scope.lijstTodo.todos[i]._id;
                    break;
                }
            }

            if (datumZitAlInDeLijst) {
                var message = {
                    "message": $scope.todo
                };
                $scope.lijstTodo.voegToe(id, message);
            } else {
                $scope.lijstTodo.maakNieuw({
                    datum: $scope.datum.date,
                    messages: $scope.todo
                });
            }


            for (var i = $scope.lijstTodo.todos.length - 1; i >= 0; i--) {
                var datum = new Date($scope.lijstTodo.todos[i].datum);
                var oneDay = datum.getDate() + '/' + datum.getMonth() + '/' + datum.getFullYear();
            };
        }

        $scope.datum.date = new Date();
        $scope.todo = '';


    };


}]);
