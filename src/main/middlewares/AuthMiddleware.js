const { tokenValidation } = require("../utils/utilities");
module.exports = app => {
    module.exports = async (req, res, next) => {
        const { authorization } = req.headers;
        if (!req.headers.authorization || req.headers.authorization === null || req.headers.authorization === 'null') {
            return res.status(403).send({message: 'Invalid or expired token!' });
        }
        const isValidToken = tokenValidation(authorization);
        if (isValidToken) {
            req.user = isValidToken;
           return next();
        }
        return res.status(403).send({message: 'Invalid or expired token!' });
    }
}

