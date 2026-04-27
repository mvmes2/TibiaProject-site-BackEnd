const { AdmintokenValidation } = require("../utils/utilities");

// Admin endpoints require:
//  1. A valid Authorization header signed with TOKEN_GENERATE_SECRET_ADMIN.
//  2. The decoded payload (`data`) must come from an account that is actually an admin.
//     We mirror the rule used at login (AdminRepository.AdminLoginRepository): `type > 3`
//     AND `web_flag === 3`. Tokens issued by the user-facing flow do not satisfy this even
//     if an attacker forwards them to /v1/Admin/*.
const isAdminPayload = (decoded) => {
    if (!decoded || typeof decoded !== 'object') return false;
    const data = decoded.data;
    if (!data || typeof data !== 'object') return false;
    const typeOk = Number(data.type) > 3;
    const flagOk = Number(data.web_flag) === 3;
    return typeOk && flagOk;
};

module.exports = app => {
    module.exports = async (req, res, next) => {
        const { authorization } = req.headers;
        if (!authorization || authorization === 'null' || authorization === 'undefined') {
            return res.status(403).send({ message: 'Invalid or expired token, you should Login!' });
        }
        const isValidToken = AdmintokenValidation(authorization);
        if (!isValidToken) {
            return res.status(403).send({ message: 'Invalid or expired token, you should Login!' });
        }
        if (!isAdminPayload(isValidToken)) {
            return res.status(403).send({ message: 'Forbidden: admin access required.' });
        }
        req.user = isValidToken;
        return next();
    }
}

