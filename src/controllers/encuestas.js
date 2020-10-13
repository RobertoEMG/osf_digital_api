const config = require('../config');
const mssql = require('mssql');
const cnx = require('../utils/dbase');

async function Encuesta(req, res) {
    const { idusers, cdg_cliente, idencuesta, datosjson, latitud, longitud } = req.body;
    //console.log(req.body);
    //console.info(JSON.stringify(JSON.parse(datosjson)));

    const request = await cnx.request();
    request
        .input("pIdUsers", idusers)
        .input("pCdgCliente", cdg_cliente)
        .input("pIdEncuesta", idencuesta)
        .input("pDatosJson", JSON.stringify(JSON.parse(datosjson)))
        .input("pLatitud", latitud)
        .input("pLongitud", longitud)
        .output("oSuccess", mssql.Int)
        .output("oMsgError", mssql.NVarChar)
        .execute("dbo.SP_ENCUESTAS", async function(err, result) {
            if (!err) {
                const { oSuccess, oMsgError } = result.output;
                
                return res.status(200).send({
                    error: ((oSuccess == 1)? false: true),
                    codigo: 200,
                    mensaje: oMsgError
                });
            } else {
                console.info(err);
                return res.status(200).send({
                    error: true,
                    codigo: 404,
                    mensaje: err
                });
            }
        })
}

module.exports = {
    Encuesta
}