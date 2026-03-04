require('dotenv');
const { projectMailer, generateToken } = require("../utils/utilities");
module.exports = (app) => {
  const { CreateAccService } = app.src.main.services.CreateAccService;
  const { checkNameAndEmail } = app.src.main.repository.AccountRepository;

  const CreateAccRequest = async (req, res) => {
    if (process.env.TESTSERVER_ON == 'true') {
      return res.status(401).send({ message: 'Create account is bloked right now, check news or discord news!!' });
    }

    const data = req.body;
    console.log('o que ta vindo de data do create account depois do email?? ', data);
    const resp = await CreateAccService(data);
    res.status(resp.status).send({ message: resp.message });
  };
  const beforeAccCreateSendEmailRequest = async (req, res) => {
    if (process.env.TESTSERVER_ON == 'true') {
      return res.status(401).send({ message: 'Create account is bloked right now, check news or discord news!' });
    }

    const data = req.body;
    if (!data || data === undefined || data === null) {
      return res.status(400).send({
        message:
          "Internal error, please close the website and try again later, or open ticket!",
      });
    }
    try {
      console.log('o que ta vindo de data do create account? ', data);

      const normalizedName = data?.name?.trim();
      const accountNameValidation = /^[a-zA-Z]+(?: [a-zA-Z]+){0,2}$/i.test(normalizedName);

      const invalidAccountName = ["'", "!", "@", "`", "-", "_", "#", "$", "¨", "¨¨", "(", ")", "*", "&", '"'];
      const hasInvalidAccountName = invalidAccountName.some((someName) => data.name.toLowerCase().includes(someName));
      const accountNameValidationWhiteSpace = data.name.endsWith(" ") || data.name.startsWith(" ") || data.name.trim() == " ";
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
      const hasInvalidWord = invalidWordsRegex.test(data.name);

      if (hasInvalidAccountName || !accountNameValidation) {
        return res.status(400).send({ message: 'Invalid Name, Cannot use special characters or accents in the name!' });
      }

      if (hasInvalidWord) {
        return res.status(400).send({ message: 'Invalid Name, your name contains forbidden words!' });
      }

      if (data?.name?.length < 5) {
        return res.status(400).send({ message: 'Invalid Name, your name contains less than 5 characters, must have more than 4.' });
      }

      if (data?.name?.length > 23) {
        return res.status(400).send({ message: 'Invalid Name, your name contains more than 23 characters.' });
      }

      if (accountNameValidationWhiteSpace) {
        return res.status(400).send({ message: 'Invalid Name, cannot use blank space to create name!' });
      }

      const returnal = await checkNameAndEmail(data);
      if (returnal.status === 200) {
        const newToken = generateToken(320, data);
        const link = `${process.env.BASE_URL_IP_FRONT}/create-account/validate/${newToken}`;
        projectMailer.welcomeAndValidate(
          data.email,
          "Welcome to TibiaProject",
          data.email,
          data.name,
          '********',
          link
        );
        console.log("email enviado!");


        return res.status(returnal.status).send({ message: returnal.message });
      }
      return res.status(returnal.status).send({ message: returnal.message });
    } catch (err) {
      console.log(err);
      return res.status(500).send({
        message:
          "Internal error, please close the website and try again later, or open ticket!",
      });
    }
  };
  return {
    CreateAccRequest,
    beforeAccCreateSendEmailRequest,
  };
};
