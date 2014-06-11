/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto'),
    _ = require('underscore'),
    authTypes = ['github', 'twitter', 'facebook', 'google'];

var emailer = require('../controllers/formmailer'); 

    MAX_LOGIN_ATTEMPTS = 3;

    // lock time 2hrs
    //LOCK_TIME = 2 * 60 * 60 * 1000;
    LOCK_TIME = 5 * 60 * 1000;

/**
 * User Schema
 */
var UserSchema = new Schema({
    name: String,
    email: String,
    username: String,
    provider: String,
    hashed_password: String,
    salt: String,
    createdAt: Date,
    verified: {type: Boolean, required: true, default: false},    // needs verification after creating a/c
    disabled: {type: Boolean, required: true, default: false},    // 3 wrong password attempts
    deactivated: {type: Boolean, required: true, default: false}, // deactivated by user
    loginAttempts: {type: Number, required: true, default: 0},
    lockUntil: {type: Number, required: true, default: 0},
    role : {type: Number, required: true, default: 9},            // default: 9 for buyer, 0 for admin, 1
    address1: String,
    address2: String,
    address3: String,
    city: String,
    state: String,
    country: String,
    zipcode: String,
    facebook: {},
    twitter: {},
    github: {},
    google: {},
    logs: [ { updates: String,
              _userId: {type: Schema.Types.ObjectId, required:true, ref: 'Yuser'},
              date: Date  
            }
          ]
});

/**
 * Virtuals
 */
UserSchema.virtual('password').set(function(password) {
        this._password = password;
        this.salt = this.makeSalt();
        this.hashed_password = this.encryptPassword(password);
    }).get(function() {
    return this._password;
});

UserSchema.virtual('isLocked').get(function() {
    // check for a future lockUntil timestamp
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

var reasons = UserSchema.statics.failedLogin = {
    NOT_FOUND: 0,
    PASSWORD_INCORRECT: 1,
    MAX_ATTEMPTS: 2
};

/**
 * Validations
 */
var validatePresenceOf = function(value) {
    return value && value.length;
};




/**
 * Pre-save hook
 */
UserSchema.pre('save', function(next) {
    if (!this.isNew) return next();

    if (!validatePresenceOf(this.password) && authTypes.indexOf(this.provider) === -1)
        next(new Error('Invalid password'));
    else
        next();
});

/**
 * Methods
 */
UserSchema.methods = {
    /**
     * Authenticate - check if the passwords are the same
     *
     * @param {String} plainText
     * @return {Boolean}
     * @api public
     */
    authenticate: function(plainText) {
        return this.encryptPassword(plainText) === this.hashed_password;
    },

    /**
     * Make salt
     *
     * @return {String}
     * @api public
     */
    makeSalt: function() {
        return Math.round((new Date().valueOf() * Math.random())) + '';
    },

    /**
     * Encrypt password
     *
     * @param {String} password
     * @return {String}
     * @api public
     */
    encryptPassword: function(password) {
        if (!password) return '';
        // return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
        return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
    },

    /* track incomplete login attempts */
    incLoginAttempts: function(cb) {
        // if we have previous lock that has expired, restart at 1
        if (this.lockUntil && this.lockUntil < Date.now()) {
            // update user document
            return this.update ({
                $set: {loginAttempts: 1},
                $unset: {lockUntil: 1}
            },cb);
        }
        // otherwise, we are incrementing
        var updates = {$inc: {loginAttempts: 1}};
        // lock account if we have reached max attempts and its not lock already
        if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
            emailer.sendFormMail(this.name, this.email, this. username, 'Your Patak account has been suspended', 
                null, 'maxlogin', function(error,response) {
                    if (error) {
                        console.log('Error in sending maxlogin email ' + response);
                    }          
            });

            updates.$set = { lockUntil: Date.now() + LOCK_TIME};
        }

        
        return this.update(updates,cb);
    }
};
  

mongoose.model('User2', UserSchema);
