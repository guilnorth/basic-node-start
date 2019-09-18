"use strict";
const consign = require('consign');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

/**
 * Armazena o time do build atual
 * **/
let buildVersion = new Date().getTime();

app.use(
    bodyParser.json(),
    bodyParser.urlencoded({ extended: false }),
    express.static(path.resolve('app/public')),
);

app.use(express.static('./public/dist'));



app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');


    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,authorization,x-access-token');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', false);

    //res.setHeader("Access-Control-Allow-Origin", "*");

    /**
     * Enviando time do build no cabeçalho
     * Liberando para acesso
     * **/
    res.setHeader('version', buildVersion);
    res.setHeader('Access-Control-Expose-Headers', 'version');

    // Pass to next layer of middleware
    next();
});


consign({ cwd: process.cwd() + "/src/app" })
    .include('routers')
    .then('controllers')
    .into(app);

module.exports = app;