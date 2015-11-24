var mongoose = require('mongoose');

var MessageSchema = new mongoose.Schema({
	message: String,
	todo: {type: mongoose.Schema.Types.ObjectId, ref: 'Todo'}
});

mongoose.model('Message', MessageSchema);