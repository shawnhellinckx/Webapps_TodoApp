var app = angular.module('todoApp', ['ui.router', 'ngMessages']);

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
        $stateProvider.state('login', {
            url: '/login',
            templateUrl: '/login.html',
            controller: 'AuthCtrl',
            onEnter: ['$state', 'auth', function($state, auth) {
                if (auth.isLoggedIn()) {
                    $state.go('home');
                }
            }]
        });
        $stateProvider.state('register', {
            url: '/register',
            templateUrl: '/register.html',
            controller: 'AuthCtrl',
            onEnter: ['$state', 'auth', function($state, auth) {
                if (auth.isLoggedIn()) {
                    $state.go('home');
                }
            }]
        });
        $urlRouterProvider.otherwise("home");
    }
]);

app.factory('auth', ['$http', '$window', function($http, $window) {
    var auth = {};

    auth.saveToken = function(token) {
        $window.localStorage['todo-token'] = token;
    };

    auth.getToken = function() {
        return $window.localStorage['todo-token'];
    }
    auth.isLoggedIn = function() {
        var token = auth.getToken();

        if (token) {
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            return payload.exp > Date.now() / 1000;
        } else {
            return false;
        }
    };
    auth.currentUser = function() {
        if (auth.isLoggedIn()) {
            var token = auth.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            return payload.username;
        }
    };
    auth.register = function(user) {
        return $http.post('/register', user).success(function(data) {
            auth.saveToken(data.token);
        });
    };
    auth.logIn = function(user) {
        return $http.post('/login', user).success(function(data) {
            auth.saveToken(data.token);
        });
    };
    auth.logOut = function() {
        $window.localStorage.removeItem('todo-token');
        console.log("logout");
    };

    return auth;
}])

app.factory('todos', ['$http', 'auth', function($http, auth) {
    var todoList = {
        todos: []
    };

    todoList.getAll = function() {
        return $http.get('/todos', null, {
            headers: {
                Authorization: 'Bearer ' + auth.getToken()
            }
        }).success(function(data) {
            angular.copy(data, todoList.todos);
            todoList.remove();
        });
    };
    todoList.maakNieuw = function(todo) {
        return $http.post('/todos', todo, {
            headers: {
                Authorization: 'Bearer ' + auth.getToken()
            }
        }).success(function(data) {
            todoList.todos.push(data);
        });
    };
    todoList.getOne = function(id) {
        return $http.get("/todos/" + id, null, {
            headers: {
                Authorization: 'Bearer ' + auth.getToken()
            }
        }).then(function(res) {
            return res.data;
        });
    };
    todoList.voegToe = function(id, message) {
        var config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + auth.getToken()
            }
        };
        return $http.post('/todos/' + id + '/message', message, config).
        success(function(data) {
            for (var i = todoList.todos.length - 1; i >= 0; i--) {
                if (todoList.todos[i]._id === id) {
                    todoList.todos[i].messages.push(data.message);
                    break;
                }
            };
        });
    };
    todoList.remove = function() {
        var date = new Date();

        for (var i = todoList.todos.length - 1; i >= 0; i--) {
            var datumVanTodoRemove = new Date(todoList.todos[i].datum);
            datumVanTodoRemove.setDate(datumVanTodoRemove.getDate() + 1)
            if (datumVanTodoRemove < date) {
                var config = {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + auth.getToken()
                    }
                };
                return $http.delete('/todos/' + todoList.todos[i]._id, config).success(function(data) {
                    todoList.getAll();
                });
            }
        };


    };
    return todoList;
}]);

app.controller('MainCtrl', ['$scope', 'auth', 'todos', function($scope, auth, todos) {
    console.log("mainctrl");
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.focusTodo = true;
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
            var messages = [];

            for (var i in $scope.lijstTodo.todos) {
                var datumVanFor = new Date($scope.lijstTodo.todos[i].datum);
                var datumVanForModified = datumVanFor.getDate() + '/' + datumVanTodo.getMonth() + '/' + datumVanTodo.getFullYear();
                messages = $scope.lijstTodo.todos[i].messages;
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
                var teller = 0;
                for (var i = messages.length - 1; i >= 0; i--) {
                    if (messages[i] === $scope.todo) {
                        teller++;
                        break;
                    }
                };
                if (teller === 0) {
                    $scope.lijstTodo.voegToe(id, message);
                    $scope.showError = false;
                } else {
                    $scope.showError = true;

                }
                console.log($scope.showError);
            } else {
                $scope.lijstTodo.maakNieuw({
                    datum: $scope.datum.date,
                    messages: $scope.todo
                });
            }
        }
        $scope.datum.date = new Date();
        $scope.todo = '';

    };
}]);

app.controller('AuthCtrl', [
    '$scope',
    '$state',
    'auth',
    function($scope, $state, auth) {
        $scope.user = {};

        $scope.register = function() {
            auth.register($scope.user).error(function(error) {
                $scope.error = error;
            }).then(function() {
                $state.go('home');
            });
        };

        $scope.logIn = function() {
            auth.logIn($scope.user).error(function(error) {
                $scope.error = error;
            }).then(function() {
                $state.go('home');
            });
        };
    }
]);

app.controller('NavCtrl', [
    '$scope',
    'auth',
    function($scope, auth) {
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.currentUser = auth.currentUser;
        $scope.logOut = auth.logOut;
    }
]);

//directive waardoor je automatische focus krijgt op een inputField
app.directive('myFocus', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
            scope.$watch(attr.myFocus, function(n, o) {
                if (n != 0 && n) {
                    element[0].focus();
                }
            });
        }
    };
});
