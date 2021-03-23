const { Router } = require('express');
const routers = Router();

const isAuth = require('./middlewares/authen');

const authen = require('./controllers/authen');
routers.post('/signin', authen.SignIn);
routers.post('/logout', authen.Logout);
routers.post('/syncinicial', isAuth, authen.SyncInicial);

const password = require('./controllers/password');
routers.post('/changepwd', isAuth, password.Change);
routers.post('/forgotpwd', password.Forgot);

const bottombar = require('./controllers/bottombar');
routers.post('/tabinicio', isAuth, bottombar.TabInicio);
routers.post('/tabiniciocharts', isAuth, bottombar.TabInicioCharts);
routers.post('/tabprospectos', isAuth, bottombar.TabProspectos);
routers.post('/tabsemaforo', isAuth, bottombar.TabSemaforo);
routers.post('/tabgestiones', isAuth, bottombar.TabGestiones);
routers.post('/tabempresarial', isAuth, bottombar.TabEmpresarial);
routers.post('/tabusuarios', isAuth, bottombar.TabUsuarios);
routers.post('/tabexpedientes', isAuth, bottombar.TabExpedientes);

const prospectos = require('./controllers/prospectos');
routers.post('/finalizar_prospecto', isAuth, prospectos.Finalizar);
routers.post('/prospecto', isAuth, prospectos.Prospecto);
routers.post('/eval_mati', isAuth, prospectos.EvalMati);
routers.post('/form_mati', isAuth, prospectos.FormMati);

const empresarial = require('./controllers/empresarial');
routers.post('/empresa', isAuth, empresarial.Empresa);
routers.post('/lineacred', isAuth, empresarial.LineaCred);
routers.post('/list_lineas', isAuth, empresarial.ListLineas);

const solicitudes = require('./controllers/solicitudes');
routers.post('/solicredemp', isAuth, solicitudes.SoliCredEmp);
routers.post('/list_solicreditos', isAuth, solicitudes.ListSoliCreditos);

const actividades = require('./controllers/actividades');
routers.post('/cliente_geo', isAuth, actividades.ClienteGeo);
routers.post('/cliente_tel', isAuth, actividades.ClienteTel);
routers.post('/add_gestion', isAuth, actividades.AddGestion);
routers.post('/list_gestiones', isAuth, actividades.ListGestiones);
routers.post('/list_fiadores', isAuth, actividades.ListFiadores);
routers.post('/lookuser', isAuth, actividades.LookUser);
routers.post('/changeclave', isAuth, actividades.ChangeClave);
routers.post('/send_noti', isAuth, actividades.SendNoti);

const encuestas = require('./controllers/encuestas');
routers.post('/encuesta', isAuth, encuestas.Encuesta);

const webservices = require('./controllers/webservices');
routers.post('/cs', isAuth, webservices.CS);
routers.post('/cs_params', isAuth, webservices.CS_PARAMS);
routers.post('/buro', isAuth, webservices.BURO);
routers.post('/buro_params', isAuth, webservices.BURO_PARAMS);

const lookup = require('./controllers/lookup');
routers.post('/lookup', isAuth, lookup.LookUp);
routers.post('/getdatoslookup',lookup.GetDatosLOOKUP);

const adjuntos = require('./controllers/adjuntos');
routers.post('/adjuntos', isAuth, adjuntos.Adjuntos);
routers.post('/list_adjuntos', isAuth, adjuntos.ListAdjuntos);
routers.post('/descargar_adj', isAuth, adjuntos.DescargarAdj);

const google_fcm = require('./controllers/google_fcm');
routers.post('/fcm_msgmasivo', google_fcm.MsgMasivo);

routers.use('/', (req, res) => {
    res.status(200).send({
        error: false,
        codigo: 200,
        mensaje: 'API Works'
    });
});

module.exports = routers;