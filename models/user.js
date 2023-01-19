const mongoose = require('mongoose')
mongoose.set('strictQuery',true);
const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:[true, "Name is required"],
        // match:["^[A-Za-z][A-Za-z0-9_]{7,29}$"]
    },
    email:{
        type:String,
        unique: true,
        required:[true,'Email address is required'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    passwordHash:{
        type:String,
        required:[true,'Password is required'],
    },
    age:{
        type:Number,
        min:18,
        required:[true, "Age is required"]
    },
    contact:{
        type:String,
        unique: true,
        maxlength:10,
        required:[true, "Contact Number is required"]
    },
})
const User = mongoose.model('User',userSchema)


module.exports = User
