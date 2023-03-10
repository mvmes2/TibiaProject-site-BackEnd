const path = require('path')
require('dotenv').config();
const nodemailer = require("nodemailer")
const hbs = require("nodemailer-express-handlebars")

//const {host, port, IAM, user, pass} = require("../config/mailConfig.json")

const host = process.env.EMAIL_HOST
const port = process.env.EMAIL_PORT
const user = process.env.EMAIL_USER
const pass = process.env.EMAIL_PASS

const transport = nodemailer.createTransport({
    // host,
    // port,
    // secure: false,
    // auth: {user, pass },
    // debug: true
    service: 'gmail',
    auth: {
        user:'tibiaprojectbr@gmail.com',
        pass: 'wjbettncnjcnhdns'
    }
});

const handlebarOptions = {
    viewEngine: {
      extName: '.html',
      partialsDir: 'src',
      layoutsDir: 'src',
      defaultLayout: '',
    },
    viewPath: 'src',
    extName: '.html',
  };

transport.use('compile', hbs(handlebarOptions))

module.exports = transport;
