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

async function TabGestionesV2(req, res) {
    const { idusers } = req.body;
    
    const request = await cnx.request();
    request
        .input("pIdUsers", idusers)
        .query('EXEC dbo.SP_TAB_GESTIONES_TEST @pIdUsers', (err, result) => {
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

async function TabExpedientes(req, res) {
    const { idusers, search } = req.body;
    
    const request = await cnx.request();
    request
    .input("pIdUsers", mssql.NVarChar, idusers)
    .input("pSearch", mssql.NVarChar, search)
    .query(`
        SELECT TOP(500) ISNULL(a.WKFPERSONA,a.WKFEMPRESA) [idcliente]
             , ISNULL(b.CIFNOMBRECLIE,c.CINOMBCOMER) [cliente]
             , a.WKFIDSOLICITUD [idsolicitud], a.WKFNUMSOLICIT [codsolicitud]
             , a.WKFNUMCREDITO [referencia]
             , CONVERT(VARCHAR(10),CAST(a.WKFFCHSOLICIT AS DATE),103) [fecha_sol]
             , a.WKFMNTSOLICITADO [monto]
             , (SELECT COUNT(*) FROM [BANKWORKSPRD].[dbo].[WKFADJUNTO] WHERE WKFIDSOLICITUD = a.WKFIDSOLICITUD) [no_docs]
          FROM [BANKWORKSPRD].[dbo].[WKFSOLICITUD] a
          LEFT JOIN [BANKWORKSPRD].[dbo].[CIFPERSONA] b ON b.CIFCODPERSONA = a.WKFPERSONA
          LEFT JOIN [BANKWORKSPRD].[dbo].[CIFEMPRESA] c ON c.CIFCODEMPRESA = a.WKFEMPRESA
         WHERE ISNULL(a.WKFPERSONA,a.WKFEMPRESA) IS NOT NULL
           AND ISNULL(b.CIFNOMBRECLIE,c.CINOMBCOMER) LIKE CONCAT('%',REPLACE('${search}',' ','%'),'%')
         ORDER BY 2, a.WKFFCHSOLICIT ASC
    `, (err, result) => {
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
    TabGestionesV2,
    TabEmpresarial,
    TabUsuarios,
    TabExpedientes
}