const mssql = require('mssql');
const cnx = require('../utils/dbase');
const request = require('request');

function sendMessaje( _key, _token, _title, _messaje, _idpush, _force_logout, _return ) {
    const payload = {
        to : _token,
        notification : {
            title : _title,
            body  : _messaje,
        },
        data : {
            click_action : "FLUTTER_NOTIFICATION_CLICK",
            title        : _title,
            body         : _messaje,
            force_logout : _force_logout,
            id_push      : _idpush
        }
    }
    request.post({
        "url": "https://fcm.googleapis.com/fcm/send",
        "headers": {
            "Authorization": "key= " + _key,
            "content-type": "application/json; charset=UTF-8"
        },
        "body": JSON.stringify(payload)
    }, (error, response, body) => {
        _return( error, (JSON.parse(body)) );
    });
}

async function MsgMasivo(req, res) {

    const request = await cnx.request();
    request.query("SELECT * FROM sys_users_token WHERE actual = 1", (err, result) => {
        if (!err) {
            var dtsJson = (result.recordset);
            for(var i = 0; i< dtsJson.length; i++){
                sendMessaje(
                    "AAAA1jyuLq4:APA91bEEAIZ9ULOF1pYxWYmV1jWzkafSFkB1jtL0l1_ANqw13F40x3YC3V9Vfm6QtN25_bf37wh8JHyMMljHGb86TK27Ge6feF57Kx6Xex_MmShh4XrwwMVDF-yV_S4Zc__19Av4Jr40",
                    dtsJson[i].token,
                    "-- AVISO IMPORTANTE --",
                    //"Version 1.0.8",
                    "Estimados por este medio les comunico que este dia se publicara una nueva version de la App, para que se actualice el dia de mañana.",
                    //"La actualización ya está lista en el Google Play para su descarga, cuaquier duda nos pueden llamar...",
                    //"PENDIENTES de la actualización aun se encuentra en PROCESO DE PUBLICACION por parte de Google.",
                    //"Estimados en este momento estamos presentando problemas con el servidor, y puede ser que la App funciones de forma irregular, ya estamos trabajando en resolverlo lo antes posible...",
                    //"Ya esta resuelto el problema, la App deberia funcionar de forma normal y correcta... cualquier cosa estaremos pendiente...",
                    15,
                    "false",
                    function (error, body) {
                        /*return res.status(200).send({
                            error: ((error)?true:false),
                            codigo: 200,
                            mensaje: body
                        });*/
                    }
                );
            }
            return res.status(200).send({
                error: false,
                codigo: 200,
                mensaje: 'OK - [' + dtsJson.length + ']'
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

};

module.exports = {
    MsgMasivo
}