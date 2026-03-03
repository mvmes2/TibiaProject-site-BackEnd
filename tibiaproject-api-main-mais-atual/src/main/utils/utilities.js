const jsSHA = require('jssha');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const jsrsasign = require('jsrsasign');
const mailer = require('../modules/mailer');
const { addMinutes, format } = require('date-fns');
const instagram_logo = 'https://res.cloudinary.com/dqncp7bg6/image/upload/v1678229806/instagram_nrqx0k.png';
const youtube_logo = 'https://res.cloudinary.com/dqncp7bg6/image/upload/c_pad,b_auto:predominant,fl_preserve_transparency/v1678229812/youtube_buxwrq.jpg';
const discord_logo = 'https://res.cloudinary.com/dqncp7bg6/image/upload/v1678229803/discord_rh9nrm.png';
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const moment = require('moment-timezone');
const { twitchApiaUTH, twitchApi } = require('../modules/twitch/api/twitchApi');

const encryptPassword = (password) => {
  const sha1 = new jsSHA("SHA-1", "TEXT");
  sha1.update(password);
  return sha1.getHash("HEX");
}

const checkPassword = (givenPassword, encryptedPassword) => {
  let passwordHash = null;
  try {
    passwordHash = encryptPassword(givenPassword);
  } catch (err) {
    console.log(err);
  }
  return passwordHash === encryptedPassword;
}

const hashGenerator = (size) => {
  const first = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
  const second = []
  first.map((item) => second.push(item.toLowerCase()))
  const third = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  const fifth = [first, second, third]
  const string = []
  do {
    const random = Math.floor(Math.random() * 10)
    const random2 = Math.floor(Math.random() * 3)
    if (string.length >= size) break
    if (string.length <= size) {
      string.push(fifth[random2][random])
    }
  } while (string.length <= size)
  return string.join('')
}

const validateRegexSecurity = (inputToTest) => {
  const regex = /^(?!.*(INPUT|NULL|UTF8|AND|OR|SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|DROP|CREATE|ALTER|RENAME|TRUNCATE|DATABASE|TABLE|INDEX|GRANT|REVOKE|UNION|EXEC|SCRIPT|JAVASCRIPT|ALERT|PROMPT|CONFIRM|DOCUMENT|LOCATION|WINDOW|XMLHTTPREQUEST|EVAL|FUNCTION|PROTOTYPE|CONSTRUCTOR|CLASS|IMPORT|EXPORT|DEFAULT|SUPER|THIS|CATCH|FINALLY|TRY|DEBUGGER|ARGUMENTS|input|null|utf8|and|or|select|insert|update|delete|from|where|drop|create|alter|rename|truncate|database|table|index|grant|revoke|union|exec|script|javascript|alert|prompt|confirm|document|location|window|xmlhttprequest|eval|function|prototype|constructor|class|import|export|default|super|this|catch|finally|try|debugger|arguments))([a-zA-Z]+([ '-][a-zA-Z]+){0,2})$/;

  if (regex.test(inputToTest)) {
    return true
  } else {
    return false
  }
}

const formatDateToTimeStampEpoch = (date) => {
  //formato de date 'MM/DD/YYY'
  const agora = new Date();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const horarioFormatado = agora.toLocaleTimeString('pt-BR', { timeZone });
  const horarioAtual = horarioFormatado.slice(0, 8);

  const dataTimestamp = Math.floor(new Date(`${date} ${horarioAtual}`).getTime() / 1000);
  return dataTimestamp;
}

const projectMailer = {
  welcomeAndValidate: function sendEmailTo(email, subject, account_email, account_name, account_pass, activation_link) {
    mailer.sendMail({
      from: "tibiaprojectbr@gmail.com",
      to: email,
      subject,
      template: "main/resources/emailTemplates/welcomeAndActivationAccount",
      context: {
        account_email,
        account_name,
        account_pass,
        youtube_logo,
        instagram_logo,
        discord_logo,
        activation_link
      },
    });
  },
  changePassword: function sendEmailTo(account_email, account_name, account_pass, changePassword_link) {
    mailer.sendMail({
      from: "tibiaprojectbr@gmail.com",
      to: account_email,
      subject: 'Change password request',
      template: "main/resources/emailTemplates/passwordRecovery",
      context: {
        account_email,
        account_name,
        account_pass,
        youtube_logo,
        instagram_logo,
        discord_logo,
        changePassword_link
      },
    });
  },
  coinsPurchase: function sendEmailTo(account_email, account_name, coins) {
    mailer.sendMail({
      from: "tibiaprojectbr@gmail.com",
      to: account_email,
      subject: 'Coins Purchase',
      template: "main/resources/emailTemplates/coinsPurchaseEmail",
      context: {
        account_email,
        account_name,
        coins,
        youtube_logo,
        instagram_logo,
        discord_logo,
      },
    });
  },
  TicketResponse: function sendEmailTo(account_email, ticket_id, ticket_type, response_date, link) {
    mailer.sendMail({
      from: "tibiaprojectbr@gmail.com",
      to: account_email,
      subject: 'Ticket response',
      template: "main/resources/emailTemplates/TicketRepliedEmail",
      context: {
        account_email,
        ticket_id,
        ticket_type,
        response_date,
        link,
        youtube_logo,
        instagram_logo,
        discord_logo,
      },
    });
  },
  FounderPackPurchase: function sendEmailTo(founder_pack, account_name, account_email, link) {
    mailer.sendMail({
      from: "tibiaprojectbr@gmail.com",
      to: account_email,
      subject: 'Founder pack purchase',
      template: "main/resources/emailTemplates/foundersPackPurchase",
      context: {
        founder_pack,
        account_name,
        account_email,
        link,
        youtube_logo,
        instagram_logo,
        discord_logo,
      },
    });
  },
}

const generateToken = (duration, userData) => {
  const JWTCONFIG = {
    expiresIn: `${duration}m`,
    algorithm: 'HS256'
  }

  const generatedUserToken = jwt.sign({
    data: userData
  },
    process.env.TOKEN_GENERATE_SECRET,
    JWTCONFIG
  );

  return generatedUserToken;
}

const generateEmailPasswordChangeToken = (duration, userData) => {
  const JWTCONFIG = {
    expiresIn: `${duration}m`,
    algorithm: 'HS256'
  }

  const generatedUserToken = jwt.sign({
    data: userData
  },
    process.env.TOKEN_GENERATE_EMAIL_CHANGE_PASSWORD_SECRET,
    JWTCONFIG
  );

  return generatedUserToken;
}

const generateChangeEmailByRKToken = (duration, userData) => {
  const JWTCONFIG = {
    expiresIn: `${duration}s`,
    algorithm: 'HS256'
  }

  const generatedUserToken = jwt.sign({
    data: userData
  },
    process.env.TOKEN_GENERATE_EMAIL_CHANGE_BY_RK_SECRET,
    JWTCONFIG
  );

  return generatedUserToken;
}

const generateTokenAdmin = (duration, userData) => {
  const JWTCONFIG = {
    expiresIn: `${duration}m`,
    algorithm: 'HS256'
  }

  const generatedAdminToken = jwt.sign({
    data: userData
  },
    process.env.TOKEN_GENERATE_SECRET_ADMIN,
    JWTCONFIG
  );

  return generatedAdminToken;
}

const tokenValidation = (token) => {
  console.log('recebendo token', token)
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_GENERATE_SECRET);
    return decoded;
  } catch (err) {
    console.log(err);
    return false;
  }
}

const AdmintokenValidation = (token) => {
  console.log('recebendo token', token)
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_GENERATE_SECRET_ADMIN);
    return decoded;
  } catch (err) {
    console.log(err);
    return false;
  }
}

const convertPremiumTimeToDaysLeft = (lastDay) => {
  const todayTimestamp = Math.floor(Date.now() / 1000);
  const diffInSeconds = lastDay - todayTimestamp;
  let diffInDays = Math.floor(diffInSeconds / 86400);
  if (diffInDays <= 0) {
    diffInDays = 0;
  }

  return diffInDays;
};

const updateLastDayTimeStampEpochFromGivenDays = (days, lastDay) => {

  const lastDayMilis = lastDay ? lastDay * 1000 : Date.now();
  const lastDayNewDate = new Date(lastDayMilis);

  const daysToAdd = days;

  lastDayNewDate.setDate(lastDayNewDate.getDate() + daysToAdd);

  const newTimeStampEpoch = Math.floor(lastDayNewDate.getTime() / 1000);

  return newTimeStampEpoch;
};

const convertDate = (dateTimeStamp, param) => {

  let dateToConvert;

  if (typeof dateTimeStamp === 'string') {
    dateToConvert = new Date(dateTimeStamp);
  } else if (typeof dateTimeStamp === 'number') {
    if (dateTimeStamp.toString().length === 10) {
      dateToConvert = new Date(dateTimeStamp * 1000);
    } else {
      dateToConvert = new Date(dateTimeStamp);
    }
  } else {
    return 'Formato de data inválido';
  }

  // Obter a data no formato local
  const localDate = dateToConvert.toLocaleDateString();
  
  // Obter a hora no formato local (formato de 24 horas)
  const localTime = dateToConvert.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  if (param) {
    return localDate;
  } else {
    return `${localDate} - ${localTime}`;
  }
};

let createCharacterController = 0;
let lastPaymentIDUpdated = 0;

const setCreateCharacterController = (number) => {
  createCharacterController = Number(number);
}
const getCreateCharacterController = () => {
  return Number(createCharacterController);
}

const setlastPaymentIDUpdated = (number) => {
  lastPaymentIDUpdated = Number(number);
}
const getlastPaymentIDUpdated = () => {
  return Number(lastPaymentIDUpdated);
}

let checkIfAccExistsData = 0;
let checkIfAccExistsLastUpdated = 0;
let checkAcc = 0;

const setCheckIfAccExistsData = (ExistsData) => {
  checkIfAccExistsData = ExistsData;
}
const getCheckIfAccExistsData = () => {
  return Number(checkIfAccExistsData);
}

const setCheckIfAccExistsLastUpdated = (number) => {
  checkIfAccExistsLastUpdated = Number(number);
}
const getCheckIfAccExistsLastUpdated = () => {
  return Number(checkIfAccExistsLastUpdated);
}

const setCheckAcc = (number) => {
  checkAcc = Number(number);
}
const getCheckAcc = () => {
  return Number(checkAcc);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * @function
 * @param {string} txtName - The name of the txt file to be created.
 * @param {string} warningText - The warning text.
 * @param {string} errText - The error text if exception or error throw and error message not passed by warningText.
 */
const ErrorLogCreateFileHandler = async (txtName, warningText, errText) => {

  const text = warningText;
  console.log(text);
  const localDateTime = moment().tz("America/Sao_Paulo").format();
  const responseText = `${localDateTime} - ${text}, ${errText}\n\n`;

  const logDirectory = path.join(__dirname, '..', 'apiErrorsLogs');

  try {
    await fs.mkdir(logDirectory, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {  // Ignore the error if the directory already exists
      console.error('Erro ao criar o diretório:', error);
      return;
    }
  }

  const logFilePath = path.join(logDirectory, txtName);

  try {
    await fs.appendFile(logFilePath, responseText);
    console.log(`Entrada adicionada com sucesso ao ${logFilePath}`);
  } catch (error) {
    console.error('Erro ao escrever no arquivo:', error);
  }
};

/**
 * @function
 * @param {string} txtName - The name of the txt file to be created.
 * @param {string} warningText - The warning text.
 */
const LogCreateFileHandler = async (txtName, warningText, errText) => {

  const text = warningText;
  console.log(text);
  const localDateTime = moment().tz("America/Sao_Paulo").format();
  const responseText = `${localDateTime} - ${text}\n\n`;

  const logDirectory = path.join(__dirname, '..', 'apiCupomsLogs');

  try {
    await fs.mkdir(logDirectory, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {  // Ignore the error if the directory already exists
      console.error('Erro ao criar o diretório:', error);
      return;
    }
  }

  const logFilePath = path.join(logDirectory, txtName);

  try {
    await fs.appendFile(logFilePath, responseText);
    console.log(`Entrada adicionada com sucesso ao ${logFilePath}`);
  } catch (error) {
    console.error('Erro ao escrever no arquivo:', error);
  }
};

const calculateDiscount = (totalValue, discountValue) => {
  const discount = Number(Number(totalValue) * (Number(discountValue) / 100));
  const finalValue = Number(totalValue) - Number(discount);
  return Number(finalValue);
}

const twitchAuthController = async () => {

  const body = {
    client_id: process.env.TWITCH_CLIENT_ID,
    client_secret: process.env.TWITCH_CLIENT_SECRET,
    grant_type: 'client_credentials'
  }
  try {
    const resp = await twitchApiaUTH.post('/oauth2/token', body);
    const token = resp?.data?.access_token;
    return token;
  } catch (err) {
    console.log('err aqui', err);
    throw new Error(err);
  }
}

function formatName(name) {
  // Converte toda a string para minúsculas e divide em palavras
  const words = name.toLowerCase().split(' ');

  // Itera sobre as palavras e formata apenas as primeiras letras
  const formattedWords = words.map(word => {
    const firstLetter = word.charAt(0).toUpperCase();
    const restOfWord = word.slice(1);
    return firstLetter + restOfWord;
  });

  // Une as palavras de volta em uma única string
  const formattedName = formattedWords.join(' ');

  return formattedName;
}

const vocationsArr = [
  { vocation_id: 0, vocation_name: 'None' },
  { vocation_id: 1, vocation_name: 'Sorcerer' },
  { vocation_id: 2, vocation_name: 'Druid' },
  { vocation_id: 3, vocation_name: 'Paladin' },
  { vocation_id: 4, vocation_name: 'Knight' },
  { vocation_id: 5, vocation_name: 'Master Sorcerer' },
  { vocation_id: 6, vocation_name: 'Elder Druid' },
  { vocation_id: 7, vocation_name: 'Royal Paladin' },
  { vocation_id: 8, vocation_name: 'Elite Knight' }
]

const tokenRouteValidation = (token) => {
  console.log('recebendo token', token)
  try {
    const decoded = jwt.verify(token, process.env.ROUTE_TOKEN_SECRET);
    return decoded;
  } catch (err) {
    console.log(err);
    return false;
  }
}

/**
 * Remove payer from PayersList.
 * @param {string} nameToCheck - Name to check params.
 * @param {number} maxLength - Max length permitted (number).
 * @param {number} minLength - Minimum length permitted (number).
 * @param {string} warningText - Returning error text e.g: Invalid ${warningName}, limit is ${maxLength} characters.
 * @param {boolean} allowNumbers - boolean value to allow or deny numbers in the name.
 * @param {boolean} allowEspecial - boolean value to allow or deny especial characters in the name.
 * @returns - {void}.
 */
const testNameParams = (nameTocheck, maxLength, minLength, warningText, allowNumbers, allowEspecial) => {
  if (nameTocheck) {
    const NameValidation = allowNumbers ? /^[a-zA-Z0-9]+$/.test(nameTocheck) : allowEspecial ? /^[a-zA-Z\s].*$/ : /^[a-zA-Z\s]+$/i.test(nameTocheck);
    const invalidName = ["'", "!", "@", "`", "-", "_", "#", "$", "¨", "¨¨", "(", ")", "*", "&", '"', "."];
    const hasinvalidName = allowEspecial ? !invalidName.some((someName) => nameTocheck.toLowerCase().includes(someName)) : invalidName.some((someName) => nameTocheck.toLowerCase().includes(someName));
    const nameValidationWhiteSpace = nameTocheck.endsWith(" ") || nameTocheck.startsWith(" ") || nameTocheck.trim() == " ";
    const invalidWords = [
      "input", "null", "utf8", "and", "or", "select", "insert", "update", "delete", "from", "where",
      "drop", "create", "alter", "rename", "truncate", "database", "table", "index", "grant", "revoke",
      "union", "exec", "script", "javascript", "alert", "prompt", "confirm", "document", "location",
      "window", "xmlhttprequest", "eval", "function", "prototype", "constructor", "class", "import",
      "export", "default", "super", "this", "catch", "finally", "try", "debugger", "arguments",
      "GOD", "god", "CM", "cm", "GM", "gm",
      "fuck", "shit", "bitch", "asshole", "pussy", "cunt", "foda", "puta", "merda", "caralho", "viado", "porra"
    ];

    const invalidWordsPattern = `\\b(${invalidWords.join("|")})\\b`;
    const invalidWordsRegex = new RegExp(invalidWordsPattern, "i");
    const hasInvalidWord = invalidWordsRegex.test(nameTocheck);

    if (hasinvalidName || !NameValidation) {
      return { status: 400, message: `Invalid ${warningText}, cannot use special characters, accents or numbers in the name!` };
    }

    if (hasInvalidWord) {
      return { status: 400, message: `Invalid ${warningText}, name contains forbidden words!` };
    }

    if (nameTocheck.length < minLength) {
      return { status: 400, message: `Invalid ${warningText}, minimum is ${minLength} characters!` };
    }

    if (nameTocheck.length > maxLength) {
      return { status: 400, message: `Invalid ${warningText}, limit is ${maxLength} characters.` };
    }

    if (nameValidationWhiteSpace) {
      return { status: 400, message: `Invalid ${warningText}, cannot use blank space!` };
    }
  }
  return false;
}

module.exports = {
  checkPassword,
  hashGenerator,
  validateRegexSecurity,
  encryptPassword,
  formatDateToTimeStampEpoch,
  projectMailer,
  generateToken,
  tokenValidation,
  convertPremiumTimeToDaysLeft,
  updateLastDayTimeStampEpochFromGivenDays,
  generateTokenAdmin,
  AdmintokenValidation,
  convertDate,
  setCreateCharacterController,
  getCreateCharacterController,
  setlastPaymentIDUpdated,
  getlastPaymentIDUpdated,
  sleep,
  ErrorLogCreateFileHandler,
  LogCreateFileHandler,
  calculateDiscount,
  twitchAuthController,
  setCheckIfAccExistsData,
  getCheckIfAccExistsData,
  setCheckIfAccExistsLastUpdated,
  getCheckIfAccExistsLastUpdated,
  setCheckAcc,
  getCheckAcc,
  formatName,
  vocationsArr,
  tokenRouteValidation,
  generateEmailPasswordChangeToken,
  generateChangeEmailByRKToken,
  testNameParams
}