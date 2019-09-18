const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mailer = require('../../modules/mailer');
const authConfig = require('../../config/auth');
const User = require('../models/user');
const authModule = {};
const ObjectId = require('mongoose').Types.ObjectId;
const CONF = require('../../config/env.json')[process.env.NODE_ENV || 'development'];

function generateToken(params = {}) {
  return jwt.sign(params, authConfig.secret, {
    expiresIn: 86400,
  });
}

authModule.register = async (req, res) => {
  const { username } = req.body;

  try {
    if (await User.findOne({ username }))
      return res.status(400).send({ error: 'User already exists' });

    const user = await User.create(req.body);

    user.password = undefined;

    return res.send({
      user,
      token: generateToken({ id: user.id }),
    });
  } catch (err) {
    return res.status(400).send({ error: 'Registration failed' });
  }
};


authModule.authenticate = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username }).select('+password');

  if (!user)
    return res.status(400).send({ error: 'User not found' });

  if (!await bcrypt.compare(password, user.password))
    return res.status(400).send({ error: 'Invalid password' });

  if (!user.status)
    return res.status(400).send({ error: 'User not active' });

  user.password = undefined;

  res.send({
    user,
    token: generateToken({ id: user.id }),
  });
};


authModule.forgot_password = async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({username});

    if (!user)
      return res.status(400).send({ error: 'User not found' });

    const token = crypto.randomBytes(20).toString('hex');


    const now = new Date();
    now.setHours(now.getHours() + 1);

    await User.findByIdAndUpdate(user.id, {
      '$set': {
        passwordResetToken: token,
        passwordResetExpires: now,
      }
    });

    /** Url you front recover pass **/
    let urlResetPass = `${CONF.BASE_URL_FRONT}/#/auth/reset-password?t=${token}&u=${username}`;

    mailer.sendMail({
      to: user.email,
      subject: `Recuperar Acesso`,
      from: 'Contato -  <contato@you.com.br>',
      template: 'auth/forgot_password',
      context: {
        username,
        urlResetPass
      },
    }, (err) => {
      if (err) {
        return res.status(400).send({ error: 'Cannot send forgot password email' });
      }


      return res.send();
    })
  } catch (err) {
    res.status(400).send({ error: 'Error on forgot password, try again' });
  }
};


authModule.reset_password = async (req, res) => {
  const { username, token, password } = req.body;

  try {
    const user = await User.findOne({ username })
      .select('+passwordResetToken passwordResetExpires');

    if (!user)
      return res.status(400).send({ error: 'User not found' });

    if (token !== user.passwordResetToken)
      return res.status(400).send({ error: 'Token invalid' });

    const now = new Date();

    if (now > user.passwordResetExpires)
      return res.status(400).send({ error: 'Token expired, generate a new one' });

    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.password = password;

    await user.save();

    res.send();
  } catch (err) {
    res.status(400).send({ error: 'Cannot reset password, try again' });
  }
};

//Close your session
authModule.sign_out = async (req, res) => {
  return res.send();
};

module.exports = authModule;
