const jsSHA = require('jssha');

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


module.exports = {
    checkPassword,
    hashGenerator,
    validateRegexSecurity,
    encryptPassword,
    formatDateToTimeStampEpoch
}