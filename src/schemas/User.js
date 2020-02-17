import mongoose from 'mongoose'
import validator from 'validator'

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: 'Email address is required',
        validate: [validator.isEmail,'invalid email'],
        unique: true
    },
    fullname: {
        type: String,
        required: 'Fullname is required',
    },
    password: {
        type: String,
        required: 'Password is required',
    },
    confirmed: {
        type: Boolean,
        default: false
    },
    avatar: String,
    confirm_hash: String,
    last_seen: Date
}, {
    timestamps: true
})

export default mongoose.model('User', UserSchema)
