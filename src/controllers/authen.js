const mssql = require('mssql');
const tokens = require('../utils/tokens');
const cnx = require('../utils/dbase');

async function SignIn(req, res) {
    console.info(req.body);
    const { user, pass, latitud, longitud, token_fb } = req.body;
    
    const request = await cnx.request();
    request
        .input("pUser", user)
        .input("pPass", pass)
        .input("pLatitud", latitud)
        .input("pLongitud", longitud)
        .input("pTokenFB", token_fb)
        .output("oSuccess", mssql.Int)
        .output("oMsgError", mssql.NVarChar)
        .output("oIdUsers", mssql.Int)
        .output("oNomUser", mssql.NVarChar)
        .output("oGenero", mssql.NVarChar)
        .output("oPerfil", mssql.NVarChar)
        .output("oDateWork", mssql.NVarChar)
        .output("oChangePwd", mssql.NVarChar)
        .output("oVersion", mssql.NVarChar)
        .output("oInterfasApp", mssql.NVarChar)
        .execute("dbo.SP_USER_LOGIN", (err, result) => {
            if (!err) {
                const { oSuccess, oMsgError, oIdUsers, oNomUser, oGenero, oPerfil, oDateWork,
                        oChangePwd, oVersion, oInterfasApp } = result.output;
                const token = tokens.createToken(oIdUsers, user);
                console.info('=====>> User : ' + ((oNomUser == null)? user: oNomUser));

                if (oSuccess == 1){
                    request
                        .input("token", token)
                        .input("idusers", oIdUsers)
                        .query("UPDATE sys_users SET token = @token WHERE idusers = @idusers", (err, result) => {
                            if (err) { console.log(err); }
                        });
                }
                return res.status(200).send({
                    error: ((oSuccess == 1)? false: true),
                    codigo: 200,
                    mensaje: oMsgError,
                    idusers: ((oIdUsers == null)? 0: oIdUsers),
                    nomuser: ((oNomUser == null)? '': oNomUser),
                    genero: ((oGenero == null)? '': oGenero),
                    profile: ((oPerfil == null)? '': oPerfil),
                    datework: ((oDateWork == null)? '': oDateWork),
                    change: ((oChangePwd == null)? '': oChangePwd),
                    token: ((oSuccess == 1)? token: ''),
                    version: ((oVersion == null)? '': oVersion),
                    interfas: ((oInterfasApp == null)? '': oInterfasApp)
                });
            } else {
                console.info(err);
                return res.status(200).send({
                    error: true,
                    codigo: 404,
                    mensaje: err,
                    idusers: '',
                    nomuser: '',
                    genero: '',
                    profile: '',
                    datework: '',
                    change: '',
                    token: '',
                    version: '',
                    interfas: 'EJE'
                });
            }
        })
}

function Logout(req, res) {
    const { idusers } = req.body;
    
    return res.status(200).send({
        error: false,
        codigo: 200,
        mensaje: 'Log Off'
    });
}

async function SyncInicial(req, res) {
    const { idusers } = req.body;
    
    const request = await cnx.request();
    request
        .input("pIdUsers", idusers)
        .output("oFavoritesBar", mssql.NVarChar)
        .output("oPrincipales", mssql.NVarChar)
        .output("oIndicadores", mssql.NVarChar)
        .output("oFormularios", mssql.NVarChar)
        .execute("dbo.SP_SYNC_INICIAL", (err, result) => {
            if (!err) {
                const { oFavoritesBar, oPrincipales, oIndicadores, oFormularios } = result.output;

                request.query('EXEC dbo.SP_CMB_OPTIONS', (err, result) => {
                        if (!err) {
                            return res.status(200).send({
                                error: false,
                                codigo: 200,
                                mensaje: '',
                                favoritesbar: JSON.parse(oFavoritesBar),
                                principales: JSON.parse(oPrincipales),
                                indicadores: JSON.parse(oIndicadores),
                                formularios: JSON.parse(oFormularios),
                                cmboptions: result.recordset
                            });
                        } else {
                            console.info(err);
                            return res.status(200).send({
                                error: true,
                                codigo: 404,
                                mensaje: err,
                                favoritesbar: '',
                                principales: '',
                                indicadores: '',
                                formularios: '',
                                cmboptions: ''
                            });
                        }
                    })
            } else {
                console.info(err);
                return res.status(200).send({
                    error: true,
                    codigo: 404,
                    mensaje: err,
                    principales: '',
                    indicadores: '',
                    formularios: '',
                    cmboptions: ''
                });
            }
        })
}

module.exports = {
    SignIn,
    Logout,
    SyncInicial
}