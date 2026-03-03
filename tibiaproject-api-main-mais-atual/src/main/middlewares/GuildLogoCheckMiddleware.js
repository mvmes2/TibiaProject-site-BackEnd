require('dotenv');
const { tokenValidation } = require("../utils/utilities");
module.exports = app => {
    const { guildLogoCheckDB } = require('../repository/GuildsRepository');
	module.exports = async (req, res, next) => {
		if (process.env.TESTSERVER_ON == 'true') {
			return { status: 401, message: 'Change guild logo is bloked right now, check news or discord news!!' }
		}
		const data = {
            guild_name: req.headers.guildname
        };
		const token = req.headers.authorization;
		const isValidToken = tokenValidation(token)
		const validatedAccountID = isValidToken?.data?.id;
		const checkIfCanUploadImage = await guildLogoCheckDB(data, validatedAccountID);
        if (checkIfCanUploadImage.status === 200) {
            return next();
        }
        return res.status(checkIfCanUploadImage.status).send({ message: checkIfCanUploadImage.message });
        return next(); 
	}
}

