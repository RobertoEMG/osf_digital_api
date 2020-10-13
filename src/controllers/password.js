const mssql = require('mssql');
const cnx = require('../utils/dbase');
const mailer = require('../utils/email');

async function Change(req, res) {
    const { idusers, passa, passn } = req.body;
    
    const request = await cnx.request();
    request
        .input("pIdUsers", idusers)
        .input("pPass", passa)
        .input("pPassN", passn)
        .output("oSuccess", mssql.Int)
        .output("oMsgError", mssql.NVarChar)
        .execute("dbo.SP_CHANGE_PWD", (err, result) => {
            if (!err) {
                const { oSuccess, oMsgError } = result.output;

                return res.status(200).send({
                    error: ((oSuccess == 1)? false: true),
                    codigo: 200,
                    mensaje: oMsgError,
                });
            } else {
                console.info(err);
                return res.status(200).send({
                    error: true,
                    codigo: 404,
                    mensaje: err,
                });
            }
        })
}

async function Forgot(req, res) {
    const { user } = req.body;
    
    const request = await cnx.request();
    request
        .input("pUser", user)
        .output("oSuccess", mssql.Int)
        .output("oMsgError", mssql.NVarChar)
        .output("oEmail", mssql.NVarChar)
        .output("oNombre", mssql.NVarChar)
        .output("oNewPwd", mssql.NVarChar)
        .execute("dbo.SP_FORGOT_PWD", (err, result) => {
            if (!err) {
                const { oSuccess, oMsgError, oEmail, oNombre, oNewPwd } = result.output;

                if (oSuccess == 1) mailer.sendMail(user, oNombre, oEmail, oNewPwd);
                return res.status(200).send({
                    error: ((oSuccess == 1)? false: true),
                    codigo: 200,
                    mensaje: ((oSuccess == 1)? 'Se ha enviado por correo una nueva contraseña': oMsgError),
                });
            } else {
                console.info(err);
                return res.status(200).send({
                    error: true,
                    codigo: 404,
                    mensaje: err,
                });
            }
        })
}

module.exports = {
    Change,
    Forgot
}