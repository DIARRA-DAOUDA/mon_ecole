const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    civilite: {
        type: String,
        required: true,
        enum: ['M.', 'Mme', 'Mlle']
    },
    nom: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 30
    },
    prenom: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 80
    },
    telephone: {type: String, maxlength: 10, required: true,unique: true},
    email: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 200,
        unique: true,
        validate: [validator.isEmail, 'Veuillez fournir un e-mail valide']
    },
    sexe: {
        type: String,
        enum: ['M', 'F'],
    },
    photo: String,
    role: {
        type: String,
       // enum: ['user', 'guide', 'lead-guide', 'admin'],
       // default: 'user'
    },
    password: {
        type: String,
        required:true,
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required:true,
        validate: {
            //This only works on CREATE AND SAVE !!!
            validator: function (el) {
                return el === this.password;
            },
            message: 'Les mots de passe ne sont pas identiques!'

        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active:{
        type:Boolean,
        default:true,
        select:false
    }
});

userSchema.pre('save', async function (next) {
    //Only run this function if password is modified
    if (!this.isModified('password')) return next();
    //Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    //Delete the password confirm field
    this.passwordConfirm = undefined;
    next();
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.passwordResetExpires=Date.now()+10*60*1000;
    //S console.log({resetToken},this.passwordResetToken);
    return resetToken;
}

userSchema.pre(/^find/,function(next){
    this.find({active:{$ne:false}});
    next();
})


const User = mongoose.model("User", userSchema);
exports.User = User;
