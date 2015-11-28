var mongoose = require('mongoose');

var TodoSchema = new mongoose.Schema({
    datum: {type: Date, default: Date.now},
    messages: [String]    
});
mongoose.model('Todo', TodoSchema);
