const mssql = require('mssql');
const cnx = require('../utils/dbase');

async function TabInicio(req, res) {
    const { idusers } = req.body;
    
    const request = await cnx.request();
    request
        .input("pIdUsers", idusers)
        .output("oPrincipales", mssql.NVarChar)
        .output("oIndicadores", mssql.NVarChar)
        .execute("dbo.SP_TAB_INICIO", (err, result) => {
            if (!err) {
                const { oPrincipales, oIndicadores } = result.output;

                return res.status(200).send({
                    error: false,
                    codigo: 200,
                    mensaje: '',
                    datoscartera: JSON.parse(oPrincipales),
                    indicadores: JSON.parse(oIndicadores)
                });
            } else {
                console.info(err);
                return res.status(200).send({
                    error: true,
                    codigo: 404,
                    mensaje: err,
                    datoscartera: '',
                    indicadores: ''
                });
            }
        })
}

async function TabInicioCharts(req, res) {
    const { idusers } = req.body;
    
    const request = await cnx.request();
    request
        .input("pIdUsers", idusers)
        .query("EXEC dbo.SP_TAB_INICIO_CHARTS @pIdUsers", (err, result) => {
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

async function TabProspectos(req, res) {
    const { idusers } = req.body;
    
    const request = await cnx.request();
    request
        .input("pIdUsers", idusers)
        .query("EXEC dbo.SP_TAB_PROSPECTOS @pIdUsers", (err, result) => {
            if (!err) {
                //console.log(result);
                return res.status(200).send({
                    error: false,
                    codigo: 200,
                    mensaje: '',
                    prospectos: JSON.parse(result.recordset[0].result),
                });
            } else {
                console.info(err);
                return res.status(200).send({
                    error: true,
                    codigo: 404,
                    mensaje: err,
                    prospectos: ''
                });
            }
        })
}

async function TabSemaforo(req, res) {
    const { idusers, cdgagencia } = req.body;
    
    const request = await cnx.request();
    request
        .input("pIdUsers", idusers)
        .input("pCdgAgencia", cdgagencia)
        .query("EXEC dbo.SP_TAB_SEMAFORO @pIdUsers, @pCdgAgencia", (err, result) => {
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

async function TabGestiones(req, res) {
    const { idusers } = req.body;
    
    const request = await cnx.request();
    request
        .input("pIdUsers", idusers)
        .query('EXEC dbo.SP_TAB_GESTIONES @pIdUsers', (err, result) => {
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

async function TabEmpresarial(req, res) {
    const { idusers } = req.body;
    
    const request = await cnx.request();
    request
        .input("pIdUsers", idusers)
        .query('EXEC dbo.SP_TAB_EMPRESARIAL @pIdUsers', (err, result) => {
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

async function TabUsuarios(req, res) {
    const { idusers } = req.body;
    
    const request = await cnx.request();
    request
        .input("pIdUsers", idusers)
        .query('EXEC dbo.SP_TAB_USUARIOS @pIdUsers', (err, result) => {
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
    TabInicio,
    TabInicioCharts,
    TabProspectos,
    TabSemaforo,
    TabGestiones,
    TabEmpresarial,
    TabUsuarios
}