const mssql      = require('mssql');
const cnx        = require('../utils/dbase');
const soap       = require('soap');
const convert    = require('xml-js');
const fs         = require('fs');
const convertapi = require('convertapi')('I45izUidtEa0YdoM');
const request    = require("request");

async function CS(req, res) {
    const { idusers, idrespuesta } = req.body;

    const rCS1 = await cnx.request();
    const rCS2 = await cnx.request();
    const rCS3 = await cnx.request();
    const rCS4 = await cnx.request();

    rCS1
        .input("idwebservice", 1)
        .query("SELECT [url] [oUrl], usuario [oUser], clave [oPass]" +
               "  FROM sys_webservices WHERE idwebservice = @idwebservice", (err, result) => {
            if (!err) {
                const oUrl = result.recordset[0]['oUrl'];
                const oUser = result.recordset[0]['oUser'];
                const oPass = result.recordset[0]['oPass'];
                
                rCS2
                    .input("pIdRespuesta", idrespuesta)
                    .output("oNoDUI", mssql.NVarChar)
                    .output("oNoNIT", mssql.NVarChar)
                    .execute("dbo.SP_DATOS_CS", (err, result) => {
                        if (!err) {
                            const { oNoDUI, oNoNIT } = result.output;
                            var args = {"inputDocumento": {"usuario":oUser, "clave":oPass, "dui":oNoDUI, "nit":oNoNIT}};

                            soap.createClient(oUrl, function(err, client) {
                                if (err == null) {
                                    client.getInformacionCrediticiaDocumento(args, function(err, result) {
                                        var resultJson = convert.xml2json(result.InformacionCandidato, {compact: true, spaces: 4});
                                        resultJson = JSON.parse(resultJson);
                                        var vCodigo = (resultJson.salida.codigoRetorno._text);
                                        var vMensaje = (resultJson.salida.mensajeRetorno._text);
    
                                        if (vCodigo == '00') {
                                            rCS3
                                                .input("pIdusers", idusers)
                                                .input("pIdRespuesta", idrespuesta)
                                                .input("pDUI", oNoDUI)
                                                .input("pNIT", oNoNIT)
                                                .input("pResultJson", JSON.stringify(resultJson))
                                                .input("pCodigo", vCodigo)
                                                .input("pMensaje", vMensaje)
    
                                                .input("Avg_Monto_EFX_12m", resultJson.salida.InformacionCrediticia.Avg_Monto_EFX_12m._text)
                                                .input("Max_Porc_DeuTotal_efx_12m", resultJson.salida.InformacionCrediticia.Max_Porc_DeuTotal_efx_12m._text)
                                                .input("Cont_DMora_30M_EFX_6m", resultJson.salida.InformacionCrediticia.Cont_DMora_30M_EFX_6m._text)
                                                .input("Max_DMora_EFX_Pound_12m", resultJson.salida.InformacionCrediticia.Max_DMora_EFX_Pound_12m._text)
                                                .input("Max_Porc_DeuIMFS_EFX_3m", resultJson.salida.InformacionCrediticia.Max_Porc_DeuIMFS_EFX_3m._text)
                                                .input("NumAcreedIMFS_Nuevos_EFX_12m", resultJson.salida.InformacionCrediticia.NumAcreedIMFS_Nuevos_EFX_12m._text)
                                                .input("Cant_AcreedIMFS_EFX_60m_12m", resultJson.salida.InformacionCrediticia.Cant_AcreedIMFS_EFX_60m_12m._text)
                                                .input("Max_Porc_DeuIMFS_EFX_12m", resultJson.salida.InformacionCrediticia.Max_Porc_DeuIMFS_EFX_12m._text)
                                                .input("Num_AcreedCOM_Nuevos_EFX_12m", resultJson.salida.InformacionCrediticia.Num_AcreedCOM_Nuevos_EFX_12m._text)
                                                .input("Max_MontoTDC_EFX_12m", resultJson.salida.InformacionCrediticia.Max_MontoTDC_EFX_12m._text)
                                                .input("Cant_Acreed_BanCatE_EFX_12m", resultJson.salida.InformacionCrediticia.Cant_Acreed_BanCatE_EFX_12m._text)
                                                .input("Max_SaldoCatE_Ban_EFX_12m", resultJson.salida.InformacionCrediticia.Max_SaldoCatE_Ban_EFX_12m._text)
                                                .input("Count_Consultas_EFX_12m", resultJson.salida.InformacionCrediticia.Count_Consultas_EFX_12m._text)
                                                .input("Count_Consultas_EFX_6m", resultJson.salida.InformacionCrediticia.Count_Consultas_EFX_6m._text)
                                                .input("Count_Consultas_BAN_EFX_12m", resultJson.salida.InformacionCrediticia.Count_Consultas_BAN_EFX_12m._text)
    
                                                .output("oSuccess", mssql.Int)
                                                .output("oMsgError", mssql.NVarChar)
                                                .output("oCS", mssql.Int)
                                                .execute("dbo.SP_CALC_CREDITSCORE", (err, result) => {
                                                    if (!err) {
                                                        const { oSuccess, oMsgError, oCS } = result.output;
                                        
                                                        return res.status(200).send({
                                                            error: ((oSuccess == 1)? false: true),
                                                            codigo: 200,
                                                            mensaje: oMsgError,
                                                            cs: oCS
                                                        });
                                                    } else {
                                                        console.info(err);
                                                        return res.status(200).send({
                                                            error: true,
                                                            codigo: 404,
                                                            mensaje: err,
                                                            cs: 0
                                                        });
                                                    }
                                                });
                                        } else {
                                            rCS4
                                                .input("idwebservice", 1)
                                                .input("idusers", idusers)
                                                .input("idrespuesta", idrespuesta)
                                                .input("cdg_retorno", vCodigo)
                                                .input("msj_retorno", vMensaje)
                                                .query("INSERT INTO sys_log_ws (idwebservice,idusers,idrespuesta,cdg_retorno,msj_retorno) " +
                                                       "VALUES (@idwebservice, @idusers, @idrespuesta, @cdg_retorno, @msj_retorno)",
                                                    (err, result) => {
                                                        if (err) { console.log(err); }
                                                });
                                                
                                                return res.status(200).send({
                                                    error: true,
                                                    codigo: vCodigo,
                                                    mensaje: vMensaje
                                                });
                                        }
                                    });
                                } else {
                                    console.log(err);
                                    return res.status(200).send({
                                        error: true,
                                        codigo: 'CS',
                                        mensaje: 'Hay problemas con EQUIFAX'
                                    });
                                }
                            });
                        } else { console.log(err); }
                    });
            } else {
                console.info(err);
                return res.status(200).send({
                    error: true,
                    codigo: 404,
                    mensaje: err
                });
            }
        });
}

async function CS_PARAMS(req, res) {
    const { idusers, dui, nit } = req.body;
    const rCS1 = await cnx.request();
    const rCS2 = await cnx.request();
    const rCS3 = await cnx.request();

    rCS1
        .input("idwebservice", 1)
        .query("SELECT [url] [oUrl], usuario [oUser], clave [oPass]" +
               "  FROM sys_webservices WHERE idwebservice = @idwebservice", (err, result) => {
            if (!err) {
                const oUrl = result.recordset[0]['oUrl'];
                const oUser = result.recordset[0]['oUser'];
                const oPass = result.recordset[0]['oPass'];
                var args = {"inputDocumento": {"usuario":oUser, "clave":oPass, "dui":dui, "nit":nit}};
                
                soap.createClient(oUrl, function(err, client) {
                    client.getInformacionCrediticiaDocumento(args, function(err, result) {
                        var resultJson = convert.xml2json(result.InformacionCandidato, {compact: true, spaces: 4});
                        resultJson = JSON.parse(resultJson);
                        var vCodigo = (resultJson.salida.codigoRetorno._text);
                        var vMensaje = (resultJson.salida.mensajeRetorno._text);

                        if (vCodigo == '00') {
                            rCS2
                                .input("pIdusers", idusers)
                                .input("pIdRespuesta", null)
                                .input("pDUI", dui)
                                .input("pNIT", nit)
                                .input("pResultJson", JSON.stringify(resultJson))
                                .input("pCodigo", vCodigo)
                                .input("pMensaje", vMensaje)

                                .input("Avg_Monto_EFX_12m", resultJson.salida.InformacionCrediticia.Avg_Monto_EFX_12m._text)
                                .input("Max_Porc_DeuTotal_efx_12m", resultJson.salida.InformacionCrediticia.Max_Porc_DeuTotal_efx_12m._text)
                                .input("Cont_DMora_30M_EFX_6m", resultJson.salida.InformacionCrediticia.Cont_DMora_30M_EFX_6m._text)
                                .input("Max_DMora_EFX_Pound_12m", resultJson.salida.InformacionCrediticia.Max_DMora_EFX_Pound_12m._text)
                                .input("Max_Porc_DeuIMFS_EFX_3m", resultJson.salida.InformacionCrediticia.Max_Porc_DeuIMFS_EFX_3m._text)
                                .input("NumAcreedIMFS_Nuevos_EFX_12m", resultJson.salida.InformacionCrediticia.NumAcreedIMFS_Nuevos_EFX_12m._text)
                                .input("Cant_AcreedIMFS_EFX_60m_12m", resultJson.salida.InformacionCrediticia.Cant_AcreedIMFS_EFX_60m_12m._text)
                                .input("Max_Porc_DeuIMFS_EFX_12m", resultJson.salida.InformacionCrediticia.Max_Porc_DeuIMFS_EFX_12m._text)
                                .input("Num_AcreedCOM_Nuevos_EFX_12m", resultJson.salida.InformacionCrediticia.Num_AcreedCOM_Nuevos_EFX_12m._text)
                                .input("Max_MontoTDC_EFX_12m", resultJson.salida.InformacionCrediticia.Max_MontoTDC_EFX_12m._text)
                                .input("Cant_Acreed_BanCatE_EFX_12m", resultJson.salida.InformacionCrediticia.Cant_Acreed_BanCatE_EFX_12m._text)
                                .input("Max_SaldoCatE_Ban_EFX_12m", resultJson.salida.InformacionCrediticia.Max_SaldoCatE_Ban_EFX_12m._text)
                                .input("Count_Consultas_EFX_12m", resultJson.salida.InformacionCrediticia.Count_Consultas_EFX_12m._text)
                                .input("Count_Consultas_EFX_6m", resultJson.salida.InformacionCrediticia.Count_Consultas_EFX_6m._text)
                                .input("Count_Consultas_BAN_EFX_12m", resultJson.salida.InformacionCrediticia.Count_Consultas_BAN_EFX_12m._text)

                                .output("oSuccess", mssql.Int)
                                .output("oMsgError", mssql.NVarChar)
                                .output("oCS", mssql.Int)
                                .execute("dbo.SP_CALC_CREDITSCORE", (err, result) => {
                                    if (!err) {
                                        const { oSuccess, oMsgError, oCS } = result.output;
                        
                                        return res.status(200).send({
                                            error: ((oSuccess == 1)? false: true),
                                            codigo: 200,
                                            mensaje: oMsgError,
                                            cs: oCS
                                        });
                                    } else {
                                        console.info(err);
                                        return res.status(200).send({
                                            error: true,
                                            codigo: 404,
                                            mensaje: err,
                                            cs: 0
                                        });
                                    }
                                });
                        } else {
                            rCS3
                                .input("idwebservice", 1)
                                .input("idusers", idusers)
                                .input("cdg_retorno", vCodigo)
                                .input("msj_retorno", vMensaje)
                                .query("INSERT INTO sys_log_ws (idwebservice,idusers,cdg_retorno,msj_retorno) " +
                                        "VALUES (@idwebservice, @idusers, @cdg_retorno, @msj_retorno)",
                                    (err, result) => {
                                        if (err) { console.log(err); }
                                });
                                
                            return res.status(200).send({
                                error: true,
                                codigo: vCodigo,
                                mensaje: vMensaje
                            });
                        }
                    });
                });
            } else {
                console.info(err);
                return res.status(200).send({
                    error: true,
                    codigo: 404,
                    mensaje: err
                });
            }
        });
}

async function BURO(req, res) {
    const { idusers, idrespuesta, tipoburo } = req.body;

    const rBUROS1 = await cnx.request();
    const rBUROS2 = await cnx.request();
    const rBUROS3 = await cnx.request();
    const rBUROS4 = await cnx.request();
    const rBUROS5 = await cnx.request();
    const rBUROS6 = await cnx.request();

    rBUROS1
        .input("idwebservice", ((tipoburo == 'E')?2:((tipoburo == 'I')?3:4)))
        .query("SELECT [url] [oUrl], usuario [oUser], clave [oPass]" +
               "  FROM sys_webservices WHERE idwebservice = @idwebservice", (err, result) => {
            if (!err) {
                const oUrl = result.recordset[0]['oUrl'];
                const oUser = result.recordset[0]['oUser'];
                const oPass = result.recordset[0]['oPass'];
                
                rBUROS2
                    .input("pIdRespuesta", idrespuesta)
                    .input("pTipo", tipoburo)
                    .output("oNoDUI", mssql.NVarChar)
                    .output("oNoNIT", mssql.NVarChar)
                    .output("oFechaNac", mssql.NVarChar)
                    .output("oPriNombre", mssql.NVarChar)
                    .output("oSegNombre", mssql.NVarChar)
                    .output("oPriApellido", mssql.NVarChar)
                    .output("oSegApellido", mssql.NVarChar)
                    .output("oApeCasada", mssql.NVarChar)
                    .execute("dbo.SP_DATOS_BUROS", (err, result) => {
                        if (!err) {
                            const { oNoDUI, oNoNIT, oFechaNac, oPriNombre, oSegNombre, oPriApellido, oSegApellido, oApeCasada } = result.output;
                            var argsE = {"input": {
                                "usuario":oUser, "clave":oPass, "dui":oNoDUI, "nit":oNoNIT,
                                "fechaNacimiento":oFechaNac, "primerNombre":oPriNombre, "segundoNombre":oSegNombre,
                                "primerApellido":oPriApellido, "segundoApellido":oSegApellido, "apellidoCasada":oApeCasada
                            }};
                            var soapHeader  = {"Authentication":{"User": oUser,"Password": oPass,"motivoconsulta": "1"}};
                            var argsI = {"dui":oNoDUI, "nit":oNoNIT};
                            var argsT = {"cTipo":"PRD", "cNoDUI":oNoDUI, "cNoNIT":oNoNIT, "cOrigen":"Optima Digital", "cIdUser":idusers};

                            if (tipoburo == 'E') {
                                soap.createClient(oUrl, function(err, client) {
                                    if (err == null) {
                                        client.getInformacionCrediticia(argsE, function(err, result) {
                                            var resultJson = convert.xml2json(result.InformacionCandidato, {compact: true, spaces: 4});
                                            resultJson = JSON.parse(resultJson);
                                            var vCodigo = (resultJson.salida.codigoRetorno._text);
                                            var vMensaje = (resultJson.salida.mensajeRetorno._text);
                                
                                            if (vCodigo == '00') {
                                                var vRptPDF = (resultJson.salida.reportePdf._text);
                                                rBUROS3
                                                   .input("idwebservice", 2)
                                                   .input("idusers", idusers)
                                                   .input("idrespuesta", idrespuesta)
                                                   .input("resultjson", vRptPDF)
                                                   .input("cdg_retorno", vCodigo)
                                                   .input("msj_retorno", vMensaje)
                                                   .query("INSERT INTO sys_log_ws (idwebservice,idusers,idrespuesta,resultjson,cdg_retorno,msj_retorno) " +
                                                          "VALUES (@idwebservice, @idusers, @idrespuesta, @resultjson, @cdg_retorno, @msj_retorno)",
                                                       (err, result) => {
                                                           if (err) { console.log(err); }
                                                   });
                                
                                                return res.status(200).send({
                                                    error: false,
                                                    codigo: vCodigo,
                                                    mensaje: vMensaje,
                                                    rptbase64: vRptPDF
                                                });
                                            } else {
                                                rBUROS4
                                                   .input("idwebservice", 2)
                                                   .input("idusers", idusers)
                                                   .input("idrespuesta", idrespuesta)
                                                   .input("resultjson", JSON.stringify(argsE))
                                                   .input("cdg_retorno", vCodigo)
                                                   .input("msj_retorno", vMensaje)
                                                   .query("INSERT INTO sys_log_ws (idwebservice,idusers,idrespuesta,resultjson,cdg_retorno,msj_retorno) " +
                                                          "VALUES (@idwebservice, @idusers, @idrespuesta, @resultjson, @cdg_retorno, @msj_retorno)",
                                                       (err, result) => {
                                                           if (err) { console.log(err); }
                                                   });
                                                   
                                               return res.status(200).send({
                                                   error: true,
                                                   codigo: vCodigo,
                                                   mensaje: vMensaje,
                                                   rptbase64: 0
                                               });
                                           }
                                        });
                                    } else {
                                        return res.status(200).send({
                                            error: true,
                                            codigo: 'BURO',
                                            mensaje: 'Hay problemas con EQUIFAX'
                                        });
                                    }
                                });
                            } else if (tipoburo == 'I') {
                                soap.createClient(oUrl, function(err, client) {
                                    if (err == null) {
                                        client.addSoapHeader(soapHeader,"Authentication","ns","https://www.infored.com.sv/wsCreditRating/");
                                        client.ImgRepPrincipal(argsI, function(err, result) {
                                            if(result.body == undefined){
                                                var resultJson = result;
                                                var vCodigo = ('00');
                                                var vMensaje = ('OK');

                                                var vRptTIFF = (resultJson.ImgRepPrincipalResult);
                                                rBUROS5
                                                .input("idwebservice", 3)
                                                .input("idusers", idusers)
                                                .input("idrespuesta", idrespuesta)
                                                .input("resultjson", vRptTIFF)
                                                .input("cdg_retorno", vCodigo)
                                                .input("msj_retorno", vMensaje)
                                                .query("INSERT INTO sys_log_ws (idwebservice,idusers,idrespuesta,resultjson,cdg_retorno,msj_retorno) " +
                                                        "VALUES (@idwebservice, @idusers, @idrespuesta, @resultjson, @cdg_retorno, @msj_retorno)",
                                                    (err, result) => { if (err) { console.log(err); } });
                                                
                                                let now = new Date();
                                                let nameFile = now.getTime();
                                                let fullPath = '/var/www/html/osf_digital_api/buros/';
                                                fs.writeFile(fullPath + nameFile + '.tiff', vRptTIFF, 'base64', async function(err) {
                                                    convertapi.convert('pdf', {File: (fullPath + nameFile + '.tiff')}, 'tiff').then(async function(result) {
                                                        await result.saveFiles(fullPath);
                                                        fs.readFile(fullPath + nameFile + '.pdf', async function(err, data){
                                                            var vRptPDF = await Buffer.from(data).toString('base64');
                                                            fs.unlinkSync(fullPath + nameFile + '.tiff');
                                                            return res.status(200).send({
                                                                error: false,
                                                                codigo: vCodigo,
                                                                mensaje: vMensaje,
                                                                rptbase64: vRptPDF
                                                            });
                                                        });
                                                    });
                                                });
                                            } else {
                                                var resultJson = convert.xml2json(result.body.replace(/soap:/g,''), {compact: true, spaces: 4});
                                                resultJson = JSON.parse(resultJson);
                                                var vCodigo = (result.statusCode);
                                                var vMensaje = (resultJson.Envelope.Body.Fault.faultstring._text);

                                                rBUROS6
                                                .input("idwebservice", 3)
                                                .input("idusers", idusers)
                                                .input("idrespuesta", idrespuesta)
                                                .input("cdg_retorno", vCodigo)
                                                .input("msj_retorno", vMensaje)
                                                .query("INSERT INTO sys_log_ws (idwebservice,idusers,idrespuesta,cdg_retorno,msj_retorno) " +
                                                        "VALUES (@idwebservice, @idusers, @idrespuesta, @cdg_retorno, @msj_retorno)",
                                                    (err, result) => {
                                                        if (err) { console.log(err); }
                                                });
                                                
                                                return res.status(200).send({
                                                    error: true,
                                                    codigo: vCodigo,
                                                    mensaje: vMensaje,
                                                    rptbase64: 0
                                                });
                                            }
                                        });
                                    } else {
                                        console.log(err);
                                        return res.status(200).send({
                                            error: true,
                                            codigo: 'BURO',
                                            mensaje: 'Hay problemas con INFORED'
                                        });
                                    }
                                });
                            } else {
                                request.post({
                                    "headers": {
                                        "content-type":"application/json; charset=utf-8"
                                    },
                                    "url":oUrl,
                                    "body": JSON.stringify(argsT)
                                }, (error, response, body) => {
                                    if(!error) { 
                                        var vBody = JSON.parse(body);
                                        return res.status(200).send({
                                            error: false,
                                            codigo: '00',
                                            mensaje: 'OK',
                                            rptbase64: vBody.data.rptbase64
                                        });
                                    } else {
                                        console.log(error);
                                        return res.status(200).send({
                                            error: true,
                                            codigo: 'BURO',
                                            mensaje: 'Hay problemas con TRANSUNION'
                                        });
                                    }
                                });
                            }
                        } else { console.log(err); }
                    });
            } else {
                console.info(err);
                return res.status(200).send({
                    error: true,
                    codigo: 404,
                    mensaje: err
                });
            }
        });
}

async function BURO_PARAMS(req, res) {
    const { idusers, tipoburo, dui, nit, fechanac, prinombre, segnombre, priapellido, segapellido, apecasada } = req.body;

    const rBUROS1 = await cnx.request();
    const rBUROS2 = await cnx.request();
    const rBUROS3 = await cnx.request();
    const rBUROS4 = await cnx.request();
    const rBUROS5 = await cnx.request();

    rBUROS1
        .input("idwebservice", ((tipoburo == 'E')?2:((tipoburo == 'I')?3:4)))
        .query("SELECT [url] [oUrl], usuario [oUser], clave [oPass]" +
               "  FROM sys_webservices WHERE idwebservice = @idwebservice", (err, result) => {
            if (!err) {
                const oUrl = result.recordset[0]['oUrl'];
                const oUser = result.recordset[0]['oUser'];
                const oPass = result.recordset[0]['oPass'];
                
                var argsE = {"input": {
                    "usuario":oUser, "clave":oPass, "dui":dui, "nit":nit,
                    "fechaNacimiento":fechanac, "primerNombre":prinombre, "segundoNombre":segnombre,
                    "primerApellido":priapellido, "segundoApellido":segapellido, "apellidoCasada":apecasada
                }};
                var soapHeader  = {"Authentication":{"User": oUser,"Password": oPass,"motivoconsulta": "1"}};
                var vDUI = (dui.substr(0, 8) + '-' + dui.substr(8, 1));
                var vNIT = (nit.substr(0, 4) + '-' + nit.substr(4, 6) + '-' + nit.substr(10, 3) + '-' + nit.substr(13, 1));
                var argsI = {"dui":vDUI, "nit":vNIT};
                var argsT = {"cTipo":"PRD", "cNoDUI":vDUI, "cNoNIT":vNIT, "cOrigen":"Optima Digital", "cIdUser":idusers};

                if (tipoburo == 'E') {
                    soap.createClient(oUrl, function(err, client) {
                        client.getInformacionCrediticia(argsE, function(err, result) {
                            var resultJson = convert.xml2json(result.InformacionCandidato, {compact: true, spaces: 4});
                            resultJson = JSON.parse(resultJson);
                            var vCodigo = (resultJson.salida.codigoRetorno._text);
                            var vMensaje = (resultJson.salida.mensajeRetorno._text);
                
                            if (vCodigo == '00') {
                                var vRptPDF = (resultJson.salida.reportePdf._text);
                                rBUROS2
                                   .input("idwebservice", 2)
                                   .input("idusers", idusers)
                                   .input("resultjson", vRptPDF)
                                   .input("cdg_retorno", vCodigo)
                                   .input("msj_retorno", vMensaje)
                                   .query("INSERT INTO sys_log_ws (idwebservice,idusers,resultjson,cdg_retorno,msj_retorno) " +
                                          "VALUES (@idwebservice, @idusers, @resultjson, @cdg_retorno, @msj_retorno)",
                                       (err, result) => {
                                           if (err) { console.log(err); }
                                   });
                
                                return res.status(200).send({
                                    error: false,
                                    codigo: vCodigo,
                                    mensaje: vMensaje,
                                    rptbase64: vRptPDF
                                });
                            } else {
                                rBUROS3
                                   .input("idwebservice", 2)
                                   .input("idusers", idusers)
                                   .input("resultjson", JSON.stringify(argsE))
                                   .input("cdg_retorno", vCodigo)
                                   .input("msj_retorno", vMensaje)
                                   .query("INSERT INTO sys_log_ws (idwebservice,idusers,resultjson,cdg_retorno,msj_retorno) " +
                                          "VALUES (@idwebservice, @idusers, @resultjson, @cdg_retorno, @msj_retorno)",
                                       (err, result) => {
                                           if (err) { console.log(err); }
                                   });
                                   
                               return res.status(200).send({
                                   error: true,
                                   codigo: vCodigo,
                                   mensaje: vMensaje,
                                   rptbase64: 0
                               });
                           }
                        });
                    });
                } else if (tipoburo == 'I') {
                    soap.createClient(oUrl, function(err, client) {
                        if (err == null) {
                            client.addSoapHeader(soapHeader,"Authentication","ns","https://www.infored.com.sv/wsCreditRating/");
                            client.ImgRepPrincipal(argsI, function(err, result) {
                                if(result.body == undefined){
                                    var resultJson = result;
                                    var vCodigo = ('00');
                                    var vMensaje = ('OK');

                                    var vRptTIFF = (resultJson.ImgRepPrincipalResult);
                                    rBUROS4
                                    .input("idwebservice", 3)
                                    .input("idusers", idusers)
                                    .input("resultjson", vRptTIFF)
                                    .input("cdg_retorno", vCodigo)
                                    .input("msj_retorno", vMensaje)
                                    .query("INSERT INTO sys_log_ws (idwebservice,idusers,resultjson,cdg_retorno,msj_retorno) " +
                                            "VALUES (@idwebservice, @idusers, @resultjson, @cdg_retorno, @msj_retorno)",
                                        (err, result) => { if (err) { console.log(err); } });
                                    
                                    let now = new Date();
                                    let nameFile = now.getTime();
                                    let fullPath = '/var/www/html/osf_digital_api/buros/';
                                    fs.writeFile(fullPath + nameFile + '.tiff', vRptTIFF, 'base64', async function(err) {
                                        convertapi.convert('pdf', {File: (fullPath + nameFile + '.tiff')}, 'tiff').then(async function(result) {
                                            await result.saveFiles(fullPath);
                                            fs.readFile(fullPath + nameFile + '.pdf', async function(err, data){
                                                var vRptPDF = await Buffer.from(data).toString('base64');
                                                fs.unlinkSync(fullPath + nameFile + '.tiff');
                                                return res.status(200).send({
                                                    error: false,
                                                    codigo: vCodigo,
                                                    mensaje: vMensaje,
                                                    rptbase64: vRptPDF
                                                });
                                            });
                                        });
                                    });
                                } else {
                                    var resultJson = convert.xml2json(result.body.replace(/soap:/g,''), {compact: true, spaces: 4});
                                    resultJson = JSON.parse(resultJson);
                                    var vCodigo = (result.statusCode);
                                    var vMensaje = (resultJson.Envelope.Body.Fault.faultstring._text);

                                    rBUROS5
                                    .input("idwebservice", 3)
                                    .input("idusers", idusers)
                                    .input("cdg_retorno", vCodigo)
                                    .input("msj_retorno", vMensaje)
                                    .query("INSERT INTO sys_log_ws (idwebservice,idusers,cdg_retorno,msj_retorno) " +
                                            "VALUES (@idwebservice, @idusers, @cdg_retorno, @msj_retorno)",
                                        (err, result) => {
                                            if (err) { console.log(err); }
                                    });
                                    
                                    return res.status(200).send({
                                        error: true,
                                        codigo: vCodigo,
                                        mensaje: vMensaje,
                                        rptbase64: 0
                                    });
                                }
                            });
                        } else {
                            console.log(err);
                            return res.status(200).send({
                                error: true,
                                codigo: 'BURO',
                                mensaje: 'Hay problemas con INFORED'
                            });
                        }
                    });
                } else {
                    request.post({
                        "headers": {
                            "content-type":"application/json; charset=utf-8"
                        },
                        "url":oUrl,
                        "body": JSON.stringify(argsT)
                    }, (error, response, body) => {
                        if(!error) { 
                            var vBody = JSON.parse(body);
                            return res.status(200).send({
                                error: false,
                                codigo: '00',
                                mensaje: 'OK',
                                rptbase64: vBody.data.rptbase64
                            });

                        } else {
                            console.log(error);
                            return res.status(200).send({
                                error: true,
                                codigo: 'BURO',
                                mensaje: 'Hay problemas con TRANSUNION'
                            });
                        }
                    });
                }
            } else {
                console.info(err);
                return res.status(200).send({
                    error: true,
                    codigo: 404,
                    mensaje: err
                });
            }
        });
}

module.exports = {
    CS,
    CS_PARAMS,
    BURO,
    BURO_PARAMS
}