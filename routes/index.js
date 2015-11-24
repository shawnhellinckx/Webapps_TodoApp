var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Todo = mongoose.model('Todo');



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

router.param('idTodo', function(req, res, next, idTodo) {
    console.log('params');
    var query = Todo.findById(idTodo);
    query.exec(function(err, todo) {
        if (err) {
            return next(err);
        }
        if (!todo) {
            return next(new Error('Geen todo gevonden'));
        }
        req.todo = todo;
        return next();
    });
});

//GET one todo
router.get('/todos/:idTodo', function(req, res, next) {
    req.todo.populate('messages', function(err, todo) {
        if (err) {
            return next(err);
        }
        res.json(todo);

    });
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

router.post('/todos/:idTodo/messages', function(req, res, next) {
    console.log("todos/messages");
    var message = new Message(req.body.message);
    message.todo = req.todo;

    message.save(function(err, message) {
        if (err) {
            return next(err);
        }
        req.todo.message.push(message);
        req.todo.save(function(err, todo) {
            if (err) {
                return next(err);
            }
            res.json(message);
        });
    });
});

module.exports = router;
