const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const UserName = mongoose.model('UserName', dataSchema);

module.exports = UserName;