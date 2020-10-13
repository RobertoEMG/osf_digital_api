const mssql = require('mssql');
const cnx = require('../utils/dbase');
const mailer = require('../utils/email');

async function ClienteGeo(req, res) {
    const { idusers, cdg_cliente, tipo, latitud, longitud } = req.body;
    
    const request = await cnx.request();
    request
        .input("pIdUsers", idusers)
        .input("pCdgCliente", cdg_cliente)
        .input("pTipo", tipo)
        .input("pLatitud", latitud)
        .input("pLongitud", longitud)
        .output("oSuccess", mssql.Int)
        .output("oMsgError", mssql.NVarChar)
        .execute("dbo.SP_CLIENTES_GEO", (err, result) => {
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

async function ClienteTel(req, res) {
    const { idusers, cdg_cliente, tipo, telefono } = req.body;
    
    const request = await cnx.request();
    request
        .input("pIdUsers", idusers)
        .input("pCdgCliente", cdg_cliente)
        .input("pTipo", tipo)
        .input("pTelefono", telefono)
        .output("oSuccess", mssql.Int)
        .output("oMsgError", mssql.NVarChar)
        .execute("dbo.SP_CLIENTES_TEL", (err, result) => {
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

async function AddGestion(req, res) {
    const { idusers, cdg_cliente, referencia, accion, reaccion, idpregunta, valor, ispromesa,
            fecha_promesa, monto_promesa, observacion, latitud, longitud } = req.body;

    const request = await cnx.request();
    request
        .input("idusers", idusers)
        .input("cdg_cliente", cdg_cliente)
        .input("referencia", referencia)
        .input("accion", accion)
        .input("reaccion", reaccion)
        .input("idpregunta", idpregunta)
        .input("valor", valor)
        .input("ispromesa", ispromesa)
        .input("fecha_promesa", fecha_promesa)
        .input("monto_promesa", monto_promesa)
        .input("observacion", observacion)
        .input("latitud", latitud)
        .input("longitud", longitud)
        .query("INSERT INTO app_gestiones (idusers,cdg_cliente,referencia,accion,reaccion," +
               "idpregunta,valor,ispromesa,fecha_promesa,monto_promesa,observacion,latitud,longitud) " +
                "VALUES (@idusers, @cdg_cliente, @referencia, @accion, @reaccion, @idpregunta, @valor, " +
                "@ispromesa, @fecha_promesa, @monto_promesa, @observacion, @latitud, @longitud)",
            (err, result) => {
                if (!err) {
                    return res.status(200).send({
                        error: false,
                        codigo: 200,
                        mensaje: 'Gestión guardada con exito !!!'
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

async function ListGestiones(req, res) {
    const { referencia } = req.body;
    
    const request = await cnx.request();
    request
        .input("pReferencia", referencia)
        .query('EXEC dbo.SP_LIST_GESTIONES @pReferencia', (err, result) => {
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

async function ListFiadores(req, res) {
    const { referencia } = req.body;
    
    const request = await cnx.request();
    request
        .input("pReferencia", referencia)
        .query('EXEC dbo.SP_LIST_FIADORES @pReferencia', (err, result) => {
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

async function LookUser(req, res) {
    const { idusers, valor } = req.body;
    console.log(req.body);
    
    const request = await cnx.request();
    request
        .input("pIdUsers", idusers)
        .input("pValor", ((valor == 'A')?1:0))
        .query("UPDATE sys_users SET locked = @pValor WHERE idusers = @pIdUsers",
        (err, result) => {
            if (!err) {
                return res.status(200).send({
                    error: false,
                    codigo: 200,
                    mensaje: ((valor == 'A')?'Usuario Bloqueado con Exito !!!':'Usuario Desbloqueado con Exito !!!')
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

async function ChangeClave(req, res) {
    const { idusers, valor } = req.body;
    console.log(req.body);
    
    const request = await cnx.request();
    request
        .input("pIdUsers", idusers)
        .input("pValor", valor)
        .query("UPDATE a SET passwd = dbo.MD5(@pValor) FROM sys_users_pwd a " +
               "INNER JOIN sys_users b ON b.idusers = a.idusers " +
               "WHERE a.actual = 1 AND b.idusers = @pIdUsers; " +
               "UPDATE sys_users SET locked = 0, intentos = 0 WHERE idusers = @pIdUsers;",
        (err, result) => {
            if (!err) {
                return res.status(200).send({
                    error: false,
                    codigo: 200,
                    mensaje: 'Cambio de clave realizado con Exito !!!'
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

async function SendNoti(req, res) {
    const { idusers, cliente } = req.body;
    
    const request = await cnx.request();
    request.query(`SELECT nombre FROM sys_users WHERE idusers = ${idusers}`, (err, result) => {
        if (!err) {
            var dtsJson = (result.recordset);
            mailer.SendNoti(dtsJson[0].nombre, cliente);
            return res.status(200).send({
                error: false,
                codigo: 200,
                mensaje: 'Notificación enviada con exito !!!',
            });
        } else {
            console.info(err);
            return res.status(200).send({
                error: true,
                codigo: 404,
                mensaje: err,
            });
        }
    })
}

module.exports = {
    ClienteGeo,
    ClienteTel,
    AddGestion,
    ListGestiones,
    ListFiadores,
    LookUser,
    ChangeClave,
    SendNoti
}