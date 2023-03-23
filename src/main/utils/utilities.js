const jsSHA = require('jssha');
const jwt = require('jsonwebtoken');
const mailer = require('../modules/mailer');
const { addMinutes, format } = require('date-fns');
const instagram_logo = 'https://res.cloudinary.com/dqncp7bg6/image/upload/v1678229806/instagram_nrqx0k.png';
const youtube_logo = 'https://res.cloudinary.com/dqncp7bg6/image/upload/c_pad,b_auto:predominant,fl_preserve_transparency/v1678229812/youtube_buxwrq.jpg';
const discord_logo = 'https://res.cloudinary.com/dqncp7bg6/image/upload/v1678229803/discord_rh9nrm.png';



const encryptPassword = (password) => {
  const sha1 = new jsSHA("SHA-1", "TEXT");
  sha1.update(password);
  return sha1.getHash("HEX");
}

const checkPassword = (givenPassword, encryptedPassword) => {
  let passwordHash = null;
    try {
       passwordHash = encryptPassword(givenPassword);
    } catch(err){
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
    const regex = /^(?!.*(INPUT|NULL|UTF8|AND|OR|SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|DROP|CREATE|ALTER|RENAME|TRUNCATE|DATABASE|TABLE|INDEX|GRANT|REVOKE|UNION|EXEC|SCRIPT|JAVASCRIPT|ALERT|PROMPT|CONFIRM|DOCUMENT|LOCATION|WINDOW|XMLHTTPREQUEST|EVAL|FUNCTION|PROTOTYPE|CONSTRUCTOR|CLASS|IMPORT|EXPORT|DEFAULT|SUPER|THIS|CATCH|FINALLY|TRY|DEBUGGER|ARGUMENTS|input|null|utf8|and|or|select|insert|update|delete|from|where|drop|create|alter|rename|truncate|database|table|index|grant|revoke|union|exec|script|javascript|alert|prompt|confirm|document|location|window|xmlhttprequest|eval|function|prototype|constructor|class|import|export|default|super|this|catch|finally|try|debugger|arguments))([a-zA-Z]+([ '-][a-zA-Z]+){0,2})$/ ;

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
}

const generateToken = (duration, userData) =>{
  const JWTCONFIG = {
    expiresIn: `${duration}m`,
    algorithm: 'HS256'
  }

  const generatedUserToken = jwt.sign({ 
    data: userData},
    process.env.TOKEN_GENERATE_SECRET,
    JWTCONFIG
    );

    return generatedUserToken;
}

const tokenValidation = (token) => {
  console.log('recebendo token', token)
 try {
  const decoded = jwt.verify(token, process.env.TOKEN_GENERATE_SECRET);
  return decoded;
 } catch(err) {
  console.log(err);
  return false;
 }
}

function generateExpirationDateMinutsFromNowIsoFormat(minuts) {
  const currentDate = new Date();
  const expirationDate = addMinutes(currentDate, minuts);
  const timeZoneOffset = -currentDate.getTimezoneOffset() / 60;
  const timeZoneOffsetFormatted = timeZoneOffset >= 0 ? `+${timeZoneOffset.toString().padStart(2, '0')}:00` : `-${(-timeZoneOffset).toString().padStart(2, '0')}:00`;
  return format(expirationDate, `yyyy-MM-dd'T'HH:mm:ss.SSS${timeZoneOffsetFormatted}`);
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
    generateExpirationDateMinutsFromNowIsoFormat
}