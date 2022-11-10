const mongoose = require('mongoose')

//Zdefiniowanie schematu bazy danych notatek
const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            index: { unique: true }
        },
        password: {
            type: String,
            required: true
        },
        contacts: {
            type: Array
        },
        notes: {
            type: Array
        },
        events: {
            type: Array
        },
        weatherCity: {
            type: Number
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model('User', userSchema);

module.exports = User;