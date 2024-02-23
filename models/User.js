const  mongoose  = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, 'Please enter your name'],
        maxLength:[50, 'Your name must be at least 50 characters'],
    },
    phone:{
        type:String, 
        required:[true, 'Please enter your phone number'],
        unique:true,
    },
    email:{
        type:String,
        required:[true, 'Please enter your email'],
        unique:true,
        validate:[validator.isEmail, 'Please enter a valid email address']
    },
    password:{
        type:String,
        required:[true, 'Please enter your password'],
        minLength:[6, 'Please enter at least 6 characters'],
        select:false
    },
    role:{
        type:String,
        default:'user'
    },
    balance:{
        type:Number,
        default:0
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    resetPasswordToken: String,
    resetPasswordExpire:Date
})
// compare the password
userSchema.methods.comparePassword = async function (enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password)
}
// Encrypting the password  before saving user
userSchema.pre('save',async function(next){
    if(!this.isModified('password')){
        next()
    }
    this.password =await bcrypt.hash(this.password,10)
})
// Return JWT token
userSchema.methods.getJwtToken =function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_TIME
    })
}

// generate password reset token 

userSchema.methods.getResetPasswordToken =function() {
    // generate  token
    const restToken = crypto.randomBytes(20).toString('hex')

    // hash and set to reset password token
    this.resetPasswordToken= crypto.createHash('sha256').update(restToken).digest('hex')
    
    // set token expiration time
    this.resetPasswordExpire= Date.now() + 30 * 60 * 1000

    return restToken

}
module.exports =mongoose.model('User',userSchema)
