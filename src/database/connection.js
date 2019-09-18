const mongoose = require('mongoose');
const CONF = require('../config/env.json')[process.env.NODE_ENV || 'development'];

mongoose.connect(process.env.BD_URI,
    { user: CONF.BD.USER, pass: process.env.BD_PASS, useMongoClient: true },
    function (err) {
        if (err)
            console.log(err);
    });

mongoose.connection.on('connected', function () {
    console.log('Conectado ao MongoDB');
});

mongoose.connection.on('error', function () {
    console.log('Erro na conexão com o MongoDB');
});

mongoose.connection.on('disconnected', function () {
    console.log('Desconectado do MongoDB');
});

process.on('SIGINT', function () {
    mongoose.connection.close(function () {
        console.log('Conexão MongoDB fechada pelo término da aplicação');
        process.exit(0);
    });
});


mongoose.Promise = global.Promise;

module.exports = mongoose;