var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Todo = mongoose.model('Todo');


router.param('idTodo', function(req, res, next, idTodo) {
    console.log("param");
    var query = Todo.findById(idTodo, function(err, todo) {
        if (!todo) {
            return next(new Error('Geen todo gevonden'));
        }
        req.todo = todo;
        return next();
    });
});
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'Express'
    });
});

//GET all the todos
router.get('/todos', function(req, res, next) {
    console.log("getTodos");
    Todo.find(function(err, todos) {
        if (err) {
            return next(err);
        }
        res.json(todos);
    });
});

//GET one todo
router.get('/todos/:idTodo', function(req, res, next) {
    res.json(req.todo);
});
//POST create new todo
router.post('/todos', function(req, res, next) {
    console.log("router.post");
    var todo = new Todo(req.body);

    todo.save(function(err, todo) {
        if (err) {
            return next(err);
        }
        res.json(todo);
    });
});
router.post('/todos/:idTodo/message', function(req, res, next) {
    var message = req.body;
    var todo = req.todo;
    console.log(message.message);
    
    req.todo.messages.push(message.message);
    req.todo.save(function(err, todo) {

        res.json(message);
    });

    console.log(todo.messages);

});



module.exports = router;
