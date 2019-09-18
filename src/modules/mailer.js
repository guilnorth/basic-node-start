const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
var smtpTransport = require("nodemailer-smtp-transport");

const { host, port, user, pass, service } = require('../config/mail.json');

const transport = nodemailer.createTransport(smtpTransport, {
  //service,
  host,
  port,
  auth: { user, pass }
});

transport.use('compile', hbs({
  viewEngine: 'handlebars',
  //viewPath: path.resolve('../resources/mail/'),
  //viewPath: path.resolve('/app/src/resources/mail/'),
  viewPath: process.cwd() + '/src/resources/mail/',
  extName: '.html',
}));

// verify connection configuration
transport.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log('Servidor de mensagens iniciado...');
  }
});


module.exports = transport;

