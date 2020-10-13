const tokens = require('../utils/tokens');

function isAuth (req, res, next) {
    if (!req.headers.authorization) {
        return res.status(200).send({
            error: true,
            codigo: 403,
            mensaje: 'No Authorization'
        });
    } else {
        const token = req.headers.authorization.split(" ")[1];
        tokens.decodeToken(token)
            .then(response => {
                req.token = response;
                //console.log(response);
                next();
            })
            .catch(response => {
                res.status(response.status).send(response.state);
            });
    }
}

module.exports = isAuth