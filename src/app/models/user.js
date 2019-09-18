const mongoose = require('../../database/connection');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  username: {
    type: String,
    unique: true,
    required: [true, 'Username is required'],
    lowercase: true,
  },
  email: {
    type: String,
    //unique: true,
    //required: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false,
  },
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetExpires: {
    type: Date,
    select: false,
  },
  status: {
    type: Boolean,
    default: true,
    select: false,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    select: false,
  },
}, {
    usePushEach: true
  });

UserSchema.path('username').validate(function (value) {
  return /^[a-zA-Z0-9]+$/.test(value);
}, 'Invalid Username');

UserSchema.pre('save', async function (next) {
  try {
    this.updatedAt = Date.now;
    if (this.isNew || this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 10);
      console.log('pass modificado')
    }
    next();
  } catch (err) {
    console.log(err)
  }

});


/** Você pode utilizar statics functions para buscas personalizadas
 * http://mongoosejs.com/docs/api.html#schema_Schema-static
 * EX:
 movieSchema.statics.findAllWithCreditCookies = (callback) => {
   this.find({ hasCreditCookie: true }, callback);
  };
 * **/

const User = mongoose.model('User', UserSchema);

module.exports = User;
