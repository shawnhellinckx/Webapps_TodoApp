var mongoose = require('mongoose');

var TodoSchema = new mongoose.Schema({
    datum: {type: Date, default: Date.now},
    messages: [{type: mongoose.Schema.Types.ObjectId, ref: 'Message'}],    
});
mongoose.model('Todo', TodoSchema);
