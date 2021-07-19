const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true
    },
    name: {
        type: String,
        //require: true,
         default: ""
    },
    year: {
        type: String,
        //required: true,
        default: "",
        enum: ['', 'FY', 'SY', 'TY', 'BE']
    },
    department: {
        type: String,
       // required: true,
        default: "",
        enum: ['', 'Computer', 'IT', 'Mechanical', 'E&TC', 'Civil', 'FY']
    },
    phoneNumber: {
        type: Number,
        //required: true,
        min: 0,
        default: 9999999999
    }
});

const UserData = mongoose.model('UserData', dataSchema);

module.exports = UserData;