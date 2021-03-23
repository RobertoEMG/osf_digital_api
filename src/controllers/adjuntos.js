const mssql = require('mssql');
const cnx = require('../utils/dbase');
const fs = require('fs');
const imagesToPdf = require("images-to-pdf");
const zlib = require('zlib');

async function Adjuntos(req, res) {
    const { idusers, idsolicitud, titulo, datosjson } = req.body;

    var lPath = '/var/www/html/osf_digital_api/documentos/';
    var aPathFiles = [];
    var dtsJson = JSON.parse(datosjson);
    for (var i = 0; i < dtsJson.length; i++) {
        let now = new Date();
        let nameFile = now.getTime();
        var vRespuesta = dtsJson[i].respuesta;
        if(vRespuesta.length > 0){
            nameFile = (titulo + ' - ' + nameFile + i + '.jpg');
            await fs.writeFileSync(lPath + nameFile, vRespuesta, 'base64');
            aPathFiles.push(lPath + nameFile);
        }
    }
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
                (err, result) => { if (err) { console.log(err); } else { fs.unlinkSync(vFileName); } });
        for (var ii = 0; ii < aPathFiles.length; ii++) { fs.unlinkSync(aPathFiles[ii]); }
    });

    return res.status(200).send({
        error: false,
        codigo: 200,
        mensaje: 'Adjuntos cargados con Exito !!!'
    });
}

async function ListAdjuntos(req, res) {
    const { idsolicitud } = req.body;
    
    const request = await cnx.request();
    request
    .input("pIdSolicitud", mssql.NVarChar, idsolicitud)
    .query(`
        SELECT a.WKFFILE [idadjunto], a.WKFDESCRIPCION [descrip]
          FROM [BANKWORKSPRD].[dbo].[WKFADJUNTO] a
         WHERE WKFIDSOLICITUD = @pIdSolicitud
         ORDER BY a.WKFID ASC
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

async function DescargarAdj(req, res) {
    const { idadjunto } = req.body;
    
    const request = await cnx.request();
    request
    .input("pIdAdjunto", mssql.NVarChar, idadjunto)
    .query(`
        SELECT a.[FileName], a.[Content]
          FROM [BANKWORKSPRD].[dbo].[FileData] a
         WHERE Oid = @pIdAdjunto
    `, async (err, result) => {
        if (!err) {
            zlib.unzip(result.recordset[0].Content, (err, buffer)=>{
                if (err) {
                    return res.status(200).send({
                        error: true,
                        codigo: 404,
                        mensaje: err,
                        filename: '',
                        base64: ''
                    });
                } else {
                    return res.status(200).send({
                        error: false,
                        codigo: 200,
                        mensaje: '',
                        filename: result.recordset[0].FileName,
                        base64: (buffer.toString('base64'))
                    });
                }
            });
        } else {
            console.info(err);
            return res.status(200).send({
                error: true,
                codigo: 404,
                mensaje: err,
                filename: '',
                base64: ''
            });
        }
    })
}

module.exports = {
    Adjuntos,
    ListAdjuntos,
    DescargarAdj
}