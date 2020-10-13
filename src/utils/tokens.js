const jwt = require('jwt-simple');
const moment = require('moment');
const config = require('../config');

function createToken( _IdUsers, _User ) {
    const payload = {
        idusers: "" + _IdUsers + "",
        username: _User,
        now: moment().unix(),
        exp: moment().add(1, 'days').unix()
    }
    
    return jwt.encode(payload, config.SECRET_TOKEN);
}

function decodeToken(token) {
    const decoded = new Promise((resolve, reject) => {
        try {
            const payload = jwt.decode(token, config.SECRET_TOKEN);
            
            resolve(payload);
        } catch (err) {
            reject({
                status: 200,
                state: {
                    error: true,
                    codigo: 500,
                    mensaje: 'Cierre sesión y vuelva a ingresar.'
                }
            });
        }
    });

    return decoded
}

module.exports = {
    createToken,
    decodeToken
}