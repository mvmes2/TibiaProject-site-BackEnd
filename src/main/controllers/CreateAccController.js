const { projectMailer, generateToken } = require("../utils/utilities");
module.exports = (app) => {
  const { CreateAccService } = app.src.main.services.CreateAccService;
  const { checkNameAndEmail } = app.src.main.repository.AccountRepository;

  const CreateAccRequest = async (req, res) => {
    const data = req.body;
    const resp = await CreateAccService(data);
    res.status(resp.status).send({ message: resp.message });
  };
  const beforeAccCreateSendEmailRequest = async (req, resp) => {
    data = req.body;
    if (!data || data === undefined || data === null) {
      return resp.status(500).send({
        message:
          "Internal error, please close the website and try again later, or open ticket!",
      });
    }
    try {
      const { password2, ...dataWithoutPass2 } = data;
      const returnal = await checkNameAndEmail(dataWithoutPass2);
      if (returnal.status === 200) {
        const newToken = generateToken(120, data);
        console.log("cade data?", data);
        // const link = `http://localhost:3000/create-account/validate/${data.name}`;
        const link = `http://143.0.20.85:3000/create-account/validate/${newToken}`;
        projectMailer.welcomeAndValidate(
          data.email,
          "Welcome to TibiaProject",
          data.email,
          data.name,
          data.password2,
          link
        );
        console.log("email enviado!");
        

        return resp.status(returnal.status).send({ message: returnal.message });
      }
      return resp.status(returnal.status).send({ message: returnal.message });
    } catch (err) {
      console.log(err);
      return returnal.status(500).send({
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
