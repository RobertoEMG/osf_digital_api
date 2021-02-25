const config = require('../config');
const mssql = require('mssql');
const cnx = require('../utils/dbase');
const fs = require('fs');
const ssrs = require('mssql-ssrs');
const request = require("request");

async function Finalizar(req, res) {
    const { idrespuesta } = req.body;
    
    const cxn_req = await cnx.request();
    cxn_req
        .input("pStep", "F")
        .input("pIdRespuesta", idrespuesta)
        .input("pIdUsers", null)
        .input("pIdFormulario", null)
        .input("pDatosJson", null)
        .input("pBase64Json", null)
        .input("pLatitud", null)
        .input("pLongitud", null)
        .output("oSuccess", mssql.Int)
        .output("oMsgError", mssql.NVarChar)
        .execute("dbo.SP_PROSPECTOS", (err, result) => {
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

async function Prospecto(req, res) {
    const { idrespuesta, idusers, idformulario, datosjson, latitud, longitud } = req.body;
    console.log('=====>> [Prospecto] :: ' + idrespuesta + ', ' + idusers + ', ' + idformulario);

    var dtsBase64 = '[';
    var vNoDui = '';
    var lPath = '/var/www/html/osf_digital_api/documentos/';
    var dtsJson = JSON.parse(datosjson);
    for(var i = 0; i< dtsJson.length; i++){
        let now= new Date();
        let nameFile = now.getTime();
        var vIdPregunta = dtsJson[i].idpregunta;
        var vRespuesta = dtsJson[i].respuesta;
        if(vIdPregunta == 1){ vNoDui = vRespuesta; }
        if(dtsJson[i].tipo == 'FOTO' && dtsJson[i].respuesta.length > 0){
            nameFile = (idrespuesta + '-' + vIdPregunta + '-' + nameFile + '.jpg');
            fs.writeFile(lPath + nameFile, vRespuesta, 'base64', async function(err) {
                if (err) { console.log(err); }
            });
            dtsJson[i].respuesta = (lPath + nameFile);
            dtsBase64 += '{"idpregunta":' + vIdPregunta + ', "file_base64":"' + vRespuesta + '"}';
        } else if(dtsJson[i].tipo == 'BURO' && dtsJson[i].respuesta.length > 100){
            nameFile = (idrespuesta + '-' + vIdPregunta + '-' + nameFile + '.pdf');
            fs.writeFile(lPath + nameFile, vRespuesta, 'base64', async function(err) {
                if (err) { console.log(err); }
            });
            dtsJson[i].respuesta = (lPath + nameFile);
            dtsBase64 += '{"idpregunta":' + vIdPregunta + ', "file_base64":"' + vRespuesta + '"}';
        }
    }
    dtsBase64 += ']';

    const cxn_req = await cnx.request();
    cxn_req
        .input("pStep", "A")
        .input("pIdRespuesta", (idrespuesta.length<=0)?null:idrespuesta)
        .input("pIdUsers", idusers)
        .input("pIdFormulario", idformulario)
        .input("pDatosJson", JSON.stringify(dtsJson))
        .input("pBase64Json", JSON.stringify(JSON.parse(dtsBase64.replace(/}{/g,'}, {'))))
        .input("pLatitud", latitud)
        .input("pLongitud", longitud)
        .output("oSuccess", mssql.Int)
        .output("oMsgError", mssql.NVarChar)
        .output("oIdRespuesta", mssql.Int)
        .output("oNoDUI", mssql.NVarChar)
        .output("oPathUser", mssql.NVarChar)
        .output("oPathDocs", mssql.NVarChar)
        .execute("dbo.SP_PROSPECTOS", async function(err, result) {
            if (!err) {
                const { oSuccess, oMsgError, oIdRespuesta, oNoDUI, oPathUser, oPathDocs } = result.output;
                //console.log('=====>> [SP_PROSPECTOS]'); console.log(result.output);

                try {
                    var lPathDocs = JSON.parse(oPathDocs);
                    for (var key in lPathDocs) { fs.unlinkSync(lPathDocs[key]['dir']); }
                } catch(e) { console.log(err); }


                if( oSuccess == 1 ){
                    if (idformulario != 1 || (idformulario == 1 && idrespuesta.length > 0)){
                        /*var sPath = oPathUser.split('/');
                        var lPathUser = 'C:/Expedientes/';
                        for (var i = 0; i < sPath.length; i++) {
                            lPathUser += (sPath[i] + '/');
                            if (!fs.existsSync(lPathUser)) { fs.mkdir(lPathUser, function(e){}); }
                        }
        
                        var lPathDocs = JSON.parse(oPathDocs);
                        for(var key in lPathDocs) {
                            var nPath = (lPathUser + (lPathDocs[key]['dir']).split('/')[2]);
                            //fs.createReadStream(lPathDocs[key]['dir']).pipe(fs.createWriteStream(nPath));
                            var source = fs.createReadStream(lPathDocs[key]['dir']);
                            var destin = fs.createWriteStream(nPath);
                            source.pipe(destin);
                            source.on('error', function(err) { console.info(err); });
                        }*/
    
                        /*var lPathUser = 'documentos/';
                        vNoDui = ((vNoDui.length > 0)? vNoDui: oNoDUI.replace(/-/g,''));
                        const credentials = { username: config.rs.username, password: config.rs.password };
                        await ssrs.start(config.rs.server, credentials, null, null);
                        const parameters = { pNoDUI: vNoDui };
                        const report = await ssrs.reportExecution.getReport(config.rs.reportpath, 'PDF', parameters);
                        var nameFile = (oIdRespuesta + '-18-CREDIT_SCORE_' + vNoDui + '.pdf');
                        await fs.writeFileSync(lPathUser + nameFile, report.Result, 'base64');
                        await fs.readFile(lPathUser + nameFile, async function(err, data){
                            console.log('=====>> ' + lPathUser + nameFile);
                            var vRptCsPDF = await Buffer.from(data).toString('base64');
                            const rCSBase64 = await cnx.request();
                            rCSBase64
                                .input("idrespuesta", oIdRespuesta)
                                .input("idpregunta", 18)
                                .input("file_base64", vRptCsPDF)
                                .query("INSERT INTO app_respuestas_b64 (idrespuesta,idpregunta,file_base64) " +
                                       "VALUES (@idrespuesta, @idpregunta, @file_base64)",
                                    (err, result) => { if (err) { console.log(err); } });
                        });*/
                    }
                }
                
                return res.status(200).send({
                    error: ((oSuccess == 1)? false: true),
                    codigo: 200,
                    mensaje: oMsgError,
                    idrespuesta: oIdRespuesta
                });
            } else {
                console.info(err);
                return res.status(200).send({
                    error: true,
                    codigo: 404,
                    mensaje: err,
                    idrespuesta: 0
                });
            }
        })
}


async function EvalMati(req, res) {
    const { idusers, identity, idkey, DUI_A, DUI_R, NIT_A, NIT_R, CDD, LIV_S, LIV_V } = req.body;
    let lPayLoad = {
        "cIdKey":idkey, "cFlowId":"5fd0f7e41453ec001bb93e36", "cIdentity":identity,
        "cDuiA":((DUI_A==undefined)?null:DUI_A), "cDuiR":((DUI_R==undefined)?null:DUI_R),
        "cNitA":((NIT_A==undefined)?null:NIT_A), "cNitR":((NIT_R==undefined)?null:NIT_R),
        "cCdd":((CDD==undefined)?null:CDD),
        "cLivS":((LIV_S==undefined)?null:LIV_S), "cLivV":((LIV_V==undefined)?null:LIV_V),
        "cOrigen":"Optima Digital"
    };
    request.post({
        "headers": {
            "content-type":"application/json; charset=utf-8"
        },
        "url":"http://localhost:3000/optima_api/mati_review_docs",
        "body": JSON.stringify(lPayLoad)
    }, (error, response, body) => {
        if(!error) { 
            var vBody = JSON.parse(body);
            return res.status(200).send({
                error: false,
                codigo: '00',
                mensaje: 'OK',
                data: vBody
            });
        } else {
            console.log(error);
            return res.status(200).send({
                error: true,
                codigo: 'MATI',
                mensaje: 'Hay problemas con el verificador de documentos.'
            });
        }
    });
}

async function FormMati(req, res) {
    const {
        idusers, idkey, identity, b64autoriza, tipocredito, montosol,
        fuenteing, cargopub, clicamp, latitud, longitud
    } = req.body;
    console.log('=====>> [FormMati] :: '+idusers+', '+idkey+', '+identity);

    const cxn_req = await cnx.request();
    cxn_req
    .input("pIdKey", String(idkey))
    .input("pAcction", 'F')
    .input("pFullName", null)
    .input("pPrimNom", null)           .input("pSeguNom", null)           .input("pTerNom", null)
    .input("pPrimApe", null)           .input("pSeguApe", null)           .input("pApeCasada", null)
    .input("pNoDUI", null)             .input("pDUIDepto", null)          .input("pDUIMunic", null)
    .input("pNoNIT", null)
    .input("pFechaNac", null)          .input("pGenero", null)            .input("pDireccion", null)
    .input("pTipoCredito", tipocredito).input("pMonto", montosol)         .input("pFuenteIng", fuenteing)
    .input("pCargoPub", cargopub)      .input("pCliCampa", clicamp)       .input("pIdUsers", idusers)
    .input("pLatidud", latitud)        .input("pLongitud", longitud)
    .input("pB64DuiA", null)           .input("pB64DuiR", null)
    .input("pB64NitA", null)           .input("pB64NitR", null)
    .input("pB64ComDom", null)         .input("pB64Autoriza", b64autoriza)
    .input("pB64Tuca", null)           .input("pB64Infored", null)
    .input("pB64Mati", null)
    .query('[10.3.11.18].[OPTIBANDITEST].[dbo].[spMatiSolicitudOD] '
        + '@pIdKey, @pAcction, @pFullName, @pPrimNom, @pSeguNom, @pTerNom, @pPrimApe, @pSeguApe, '
        + '@pApeCasada, @pNoDUI, @pDUIDepto, @pDUIMunic, @pNoNIT, @pFechaNac, @pGenero, @pDireccion, '
        + '@pTipoCredito, @pMonto, @pFuenteIng, @pCargoPub, @pCliCampa, '
        + '@pIdUsers, @pLatidud, @pLongitud, @pB64DuiA, @pB64DuiR, @pB64NitA, @pB64NitR, '
        + '@pB64ComDom, @pB64Autoriza, @pB64Tuca, @pB64Infored, @pB64Mati'
    , async (err, rows) => {
        if (!err) {
            return res.status(200).send({
                error: false,
                codigo: 200,
                mensaje: 'Formulario registrado con exito !!!'
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

module.exports = {
    Finalizar,
    Prospecto,
    EvalMati,
    FormMati
}