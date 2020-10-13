const mssql = require('mssql');
const cnx = require('../utils/dbase');

async function LookUp(req, res) {
    const { idusers, idpregunta, step, search } = req.body;
    
    const request = await cnx.request();
    request
        .input("pIdUsers", idusers)
        .input("pIdPregunta", (idpregunta == 'null')?null:idpregunta)
        .input("pStep", step)
        .input("pSearch", search)
        .query('EXEC dbo.SP_DATOS_LOOKUP @pIdUsers, @pIdPregunta, @pStep, @pSearch', (err, result) => {
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
    LookUp
}