const mssql = require('mssql');
const cnx = require('../utils/dbase');

async function SoliCredEmp(req, res) {
    const { idusers, idlinea, datosjson, latitud, longitud } = req.body;
    console.log('=====>> [SoliCredEmp] :: ' + idusers + ' :: ' + idlinea);

    const request = await cnx.request();
    request
        .input("pIdUsers", idusers)
        .input("@pIdLinea", idlinea)
        .input("@pDatosJson", datosjson)
        .input("pLatitud", latitud)
        .input("pLongitud", longitud)
        .output("oSuccess", mssql.Int)
        .output("oMsgError", mssql.NVarChar)
        .execute("dbo.SP_SOLICREDEMP", async function(err, result) {
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

async function ListSoliCreditos(req, res) {
    const { idusers, idlinea } = req.body;
    
    const request = await cnx.request();
    request
        .input("pIdUsers", idusers)
        .input("pIdLinea", (idlinea == 'null')?null:idlinea)
        .query('EXEC dbo.SP_LIST_SOLICREDITO @pIdUsers, @pIdLinea', (err, result) => {
            if (!err) {
                return res.status(200).send({
                    error: false,
                    codigo: 200,
                    mensaje: '',
                    result: (result.recordset)
                });
            } else {
                console.info(err);
                return res.status(200).send({
                    error: true,
                    codigo: 404,
                    mensaje: err,
                    result: ''
                });
            }
        })
}

module.exports = {
    SoliCredEmp,
    ListSoliCreditos
}