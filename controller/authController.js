
const User = require('../models/User');
const ErrorHandler = require('../utils/errorHandler');
const sendEmail = require('../utils/sendEmail');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const sendToken =require('../utils/jwtToken');
// register  api
exports.registerUser =catchAsyncErrors(async(req,res,next)=>{
    const { name, email, password,phone,role} =req.body
    const user =await User.create({
        name,
        email,
        password,
        phone,
        role
    })
    sendToken(user,200,res)
    console.log(token)
});
// Login User => login

exports.login =catchAsyncErrors(async(req,res,next)=>{
    const {  email, password} =req.body
    
    // check if email and password is entered by user
    if(!email || !password) {
        return next(new ErrorHandler("please enter your & password",400));
    }
    // Finding user in database
    const user = await User.findOne({email}).select('+password')
    if(!user){
        return next(new ErrorHandler('Invalid Email or Password', 401))
    }

    // Checks if password is correct or not
    const isPasswordMatched = await user.comparePassword(password)
    if(!isPasswordMatched){
        return next(new ErrorHandler('Invalid Email or Password',401))
    }
    sendToken(user,200,res)
});
// profile
exports.profile =catchAsyncErrors(async(req,res,next)=>{
    res.json(req.user);
})

// forgot password 

exports.forgotPassword = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findOne({email:req.body.email})
    if(!user){
        return next(new ErrorHandler('User not found with this email',404))
    }
    //  get rest token 
    const restToken = user.getResetPasswordToken()
    await user.save({validateBeforeSave:false})

    // create reset password url
    const restUrl =`${req.protocol}:://${req.get('host')}/password/reset/${restToken}`
    
    const message =`your password reset token is as follow: \n\n${restUrl} \n\n if you have not requested this email, then ignore it`

    try{
        await sendEmail({
            email:user.email,
            subject:'Longx Password Recovery'
        })
        res.status(200).send({
            success: true,
            message:`Email sent to ${user.email}`
        })
    }
    catch(err){
        user.resetPasswordToken=undefined
        user.resetPasswordExpire=undefined
        await user.save({validateBeforeSave:false})

        return next(new ErrorHandler(err, message,500))
    }


})


// logout user 

exports.logout =catchAsyncErrors(async(req,res,next)=>{
    res.cookie('token', null, {
        expires:new Date(Date.now()),
        httpOnly:true
    })
    res.status(200).json({
        success:true,
        message:"logged out"
    })
});
// get user information
exports.getUser =catchAsyncErrors (async (req, res) => {
    try {
        const userId = req.params.userId;

        // Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Error getting user details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// update user
// Update user details by ID
exports.userInfoUpdate =catchAsyncErrors(async(req,res,next)=>{
    try {
        const userId = req.params.userId;
        const updateFields = req.body;

        // Find the user by ID and update their details
        const user = await User.findByIdAndUpdate(userId, updateFields, { new: true });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User details updated successfully', user });
    } catch (error) {
        console.error('Error updating user details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.updatePassword=catchAsyncErrors( async(req,res,next)=>{
    try {
        const { currentPassword, newPassword } = req.body;

        // Find the user by ID
        const user = await User.findById(req.user._id).select('+password');

        // Check if the current password matches
        if (!(await user.comparePassword(currentPassword))) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        // Set the new password
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        // Check for specific errors
        if (error.name === 'MongoError' && error.code === 11000) {
            // Duplicate key error (e.g., if the new password violates a unique constraint)
            return res.status(400).json({ error: 'Duplicate key error' });
        } else if (error.name === 'ValidationError') {
            // Validation error (e.g., if the new password doesn't meet validation rules)
            return res.status(400).json({ error: error.message });
        } else {
            // Other server errors
            console.error(error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
})