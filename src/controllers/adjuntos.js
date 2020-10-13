const mssql = require('mssql');
const cnx = require('../utils/dbase');
const fs = require('fs');
const imagesToPdf = require("images-to-pdf");

async function Adjuntos(req, res) {
    const { idusers, idsolicitud, titulo, datosjson } = req.body;

    const request = await cnx.request();
    request
        .input("pIdUsers", idusers)
        .input("pIdSolicitud", idsolicitud)
        .output("oPathFiles", mssql.NVarChar)
        .execute("dbo.SP_GET_PATHFILES", async function(err, result) {
            if (!err) {
                const { oPathFiles } = result.output;

                var sPath = oPathFiles.split('/');
                var lPath = 'C:/Expedientes/';
                for (var i = 0; i < sPath.length; i++) {
                    lPath += (sPath[i] + '/');
                    if (!fs.existsSync(lPath)) { fs.mkdir(lPath, function(e){}); }
                }

                var aPathFiles = [];
                var dtsJson = JSON.parse(datosjson);
                for (var i = 0; i< dtsJson.length; i++) {
                    let now= new Date();
                    let nameFile = now.getTime();
                    var vRespuesta = dtsJson[i].respuesta;
                    nameFile = (titulo + ' - ' + nameFile + i + '.jpg');
                    await fs.writeFileSync(lPath + nameFile, vRespuesta, 'base64');
                    aPathFiles.push(lPath + nameFile);
                }
                //console.log(aPathFiles);
                var vFileName = (lPath + titulo + '.pdf');
                await new Promise((resolve) => { setTimeout(resolve, 1000); });
                await imagesToPdf(aPathFiles, vFileName);
                await fs.readFile(vFileName, async function(err, data){
                    var vRptPDF = await Buffer.from(data).toString('base64');
                    const rBase64 = await cnx.request();
                    rBase64
                        .input("idsolicitud", idsolicitud)
                        .input("titulo", titulo)
                        .input("file_base64", vRptPDF)
                        .query("INSERT INTO app_adjuntos_b64 (idsolicitud,titulo,file_base64) " +
                               "VALUES (@idsolicitud, @titulo, @file_base64)",
                            (err, result) => { if (err) { console.log(err); } });
                });

                return res.status(200).send({
                    error: false,
                    codigo: 200,
                    mensaje: 'Adjuntos cargados con Exito !!!'
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
    Adjuntos
}