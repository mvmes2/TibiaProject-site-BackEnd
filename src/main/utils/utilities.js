const crypto = require('crypto');

const checkPassword = (encryptedPassword, givenPassword) => {
    const hash = crypto.createHash('sha1').update(givenPassword).digest('hex');

    if(hash === encryptedPassword) {
        return true;
    }
    return false;
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
    const regex = /^(?!.*(input|null|utf8|and|or|select|insert|update|delete|from|where|drop|create|alter|rename|truncate|database|table|index|grant|revoke|union|exec|script|javascript|alert|prompt|confirm|document|location|window|xmlhttprequest|eval|function|prototype|constructor|class|import|export|default|super|this|catch|finally|try|debugger|arguments))[a-zA-Z](?!.*['-])[a-zA-Z'-]*(?!.*(--|['-].*['-]))[a-zA-Z'-]*'?[a-zA-Z'-]*$/;
    if (regex.test(inputToTest)) {
      return true
    } else {
      return false
    }
  }


module.exports = {
    checkPassword,
    hashGenerator,
    validateRegexSecurity
}