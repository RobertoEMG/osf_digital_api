const config = require('../config');
const mssql = require('mssql');
const cnx = require('../utils/dbase');
const fs = require('fs');
const ssrs = require('mssql-ssrs');

async function Finalizar(req, res) {
    const { idrespuesta } = req.body;
    
    const request = await cnx.request();
    request
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
    //console.log(datosjson);

    var dtsBase64 = '[';
    var vNoDui = '';
    var dtsJson = JSON.parse(datosjson);
    for(var i = 0; i< dtsJson.length; i++){
        let now= new Date();
        let nameFile = now.getTime();
        var vIdPregunta = dtsJson[i].idpregunta;
        var vRespuesta = dtsJson[i].respuesta;
        if(vIdPregunta == 1){ vNoDui = vRespuesta; }
        if(dtsJson[i].tipo == 'FOTO' && dtsJson[i].respuesta.length > 0){
            nameFile = (idrespuesta + '-' + vIdPregunta + '-' + nameFile + '.jpg');
            fs.writeFile('documentos/' + nameFile, vRespuesta, 'base64', async function(err) {
                if (err) { console.log(err); }
            });
            dtsJson[i].respuesta = ('documentos/' + nameFile);
            dtsBase64 += '{"idpregunta":' + vIdPregunta + ', "file_base64":"' + vRespuesta + '"}';
        } else if(dtsJson[i].tipo == 'BURO' && dtsJson[i].respuesta.length > 100){
            nameFile = (idrespuesta + '-' + vIdPregunta + '-' + nameFile + '.pdf');
            fs.writeFile('documentos/' + nameFile, vRespuesta, 'base64', async function(err) {
                if (err) { console.log(err); }
            });
            dtsJson[i].respuesta = ('documentos/' + nameFile);
            dtsBase64 += '{"idpregunta":' + vIdPregunta + ', "file_base64":"' + vRespuesta + '"}';
        }
    }
    dtsBase64 += ']';
    //console.info(JSON.stringify(dtsJson));
    //console.info(JSON.parse(dtsBase64.replace(/}{/g,'}, {')));

    const request = await cnx.request();
    request
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
                    for(var key in lPathDocs) {
                        fs.unlinkSync(lPathDocs[key]['dir']);
                    }
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

module.exports = {
    Finalizar,
    Prospecto
}