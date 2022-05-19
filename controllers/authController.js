const crypto=require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const {User} = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');
const Joi=require("joi");


const createSendToken=(user,statusCode,res)=>{
    const token = signToken(user._id);
    const cookieOptions={
        expires: new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES_IN *24*60*60*1000) ,
        httpOnly:true //cookie is not modify
    };
    if(process.env.NODE_ENV==='development') cookieOptions.secure=true;

    res.cookie('jwt',token,cookieOptions);

    //remove the password from output
    user.password=undefined;


    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
}
const signToken = id => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
}
exports.signup=catchAsync(async(req,res,next)=>{

     const schema =Joi.object({
        civilite:Joi.string().required(),
        nom:Joi.string().min(3).max(30).required(),
        prenom:Joi.string().min(2).max(80).required(),
        telephone:Joi.string().required(),
        email:Joi.string().min(3).max(200).required().email(),
        password:Joi.string().min(6).max(200).required(),
        passwordConfirm:Joi.string().min(6).max(200).required()
    });
    const {error} = schema.validate(req.body);


    if(error) return res.status(201).send(error.details[0].message);

    let user = await User.findOne({email:req.body.email});
    if(user) return res.status(201).send("L'utilisateur existe...");
    user= new User(req.body);

    const newUser = await user.save();
    createSendToken(newUser,201,res);


})

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    const schema =Joi.object({
        email:Joi.string().min(3).max(200).required().email(),
        password:Joi.string().min(6).max(200).required()
    });
    const {error} = schema.validate(req.body);

    if(error) return res.status(201).send(error.details[0].message);

    let user = await User.findOne({email:req.body.email}).select('+password');
    const correct = await user.correctPassword(password, user.password);
    if (!user || !correct) {
        return res.status(201).send('Incorrect email or password')
    }

    //3)if everything ok , send token to client
    createSendToken(user,200,res);

});