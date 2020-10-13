const config = require('../config');
const mssql = require('mssql');
const cnx = require('../utils/dbase');
const fs = require('fs');
const ssrs = require('mssql-ssrs');

async function Empresa(req, res) {
    const { idusers, datosjsonemp, datosjsonrep, latitud, longitud } = req.body;
    console.log('=====>> [Empresa] :: ' + idusers);

    const request = await cnx.request();
    request
        .input("pIdUsers", idusers)
        .input("pDatosJsonEmp", datosjsonemp)
        .input("pDatosJsonRep", datosjsonrep)
        .input("pLatitud", latitud)
        .input("pLongitud", longitud)
        .output("oSuccess", mssql.Int)
        .output("oMsgError", mssql.NVarChar)
        .execute("dbo.SP_EMPRESA", async function(err, result) {
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

async function LineaCred(req, res) {
    const { idusers, idempresa, datosjson, latitud, longitud } = req.body;
    console.log('=====>> [LineaCred] :: ' + idusers);

    const request = await cnx.request();
    request
        .input("pIdUsers", idusers)
        .input("pIdEmpresa", idempresa)
        .input("pDatosJson", datosjson)
        .input("pLatitud", latitud)
        .input("pLongitud", longitud)
        .output("oSuccess", mssql.Int)
        .output("oMsgError", mssql.NVarChar)
        .execute("dbo.SP_LINEACRED", async function(err, result) {
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

async function ListLineas(req, res) {
    const { idusers, idcliente } = req.body;
    
    const request = await cnx.request();
    request
        .input("pIdUsers", idusers)
        .input("pIdCliente", idcliente)
        .query('EXEC dbo.SP_LIST_LINEAS @pIdUsers, @pIdCliente', (err, result) => {
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
    Empresa,
    LineaCred,
    ListLineas
}