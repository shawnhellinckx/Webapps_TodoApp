var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Todo = mongoose.model('Todo');
var passport = require('passport');
var User = mongoose.model('User');
var jwt = require('express-jwt');

var auth = jwt({
    secret: 'SECRET',
    userProperty: 'payload'
});

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
router.get('/todos/:idTodo',auth, function(req, res, next) {
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
router.post('/todos/:idTodo/message',auth, function(req, res, next) {
    var message = req.body;
    var todo = req.todo;
    console.log(message.message);

    req.todo.messages.push(message.message);
    req.todo.save(function(err, todo) {

        res.json(message);
    });

    console.log(todo.messages);

});

router.post('/register', function(req, res, next) {
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({
            message: 'Please fill out all fields'
        });
    }

    var user = new User();

    user.username = req.body.username;

    user.setPassword(req.body.password)

    user.save(function(err) {
        if (err) {
            return next(err);
        }

        return res.json({
            token: user.generateJWT()
        })
    });
});

router.post('/login', function(req, res, next) {
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({
            message: 'Please fill out all fields'
        });
    }

    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return next(err);
        }

        if (user) {
            return res.json({
                token: user.generateJWT()
            });
        } else {
            return res.status(401).json(info);
        }
    })(req, res, next);
});


module.exports = router;
