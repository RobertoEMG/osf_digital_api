const mailer = require('nodemailer');
/*
 * Debe Permitir el Acceso de apps menos seguras = SÍ
 * https://myaccount.google.com/u/2/lesssecureapps?pli=1&pageId=none
 */
/*const trans = mailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'development.apps26@gmail.com',
        pass: 'JoseMG.Devs26'
    }
});*/

const trans = mailer.createTransport({
    host: "smtpout.secureserver.net",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "roberto.montepeque@optima.com.sv",
      pass: "RobertoEMG2685"
    }
  });

async function sendMail(usuario, nombre, email, clave) {

    let info = await trans.sendMail({
        from: '"OPTIMA - Digital" <grpsistemas@optima.com.sv>',
        to: `"${nombre}" <${email}>`,
        subject: 'Cambio de contraseña',
        html: `
            <table width="100%" border="0" cellspacing="0" cellpadding="10">
                <tr>
                    <td colspan="2" valign="middle" align="justify">Estimado(a): <b>${nombre}</b></td>
                </tr><tr>
                    <td colspan="2" valign="middle" align="justify">
                        Le hacemos entrega de su usuario y contraseña generada de forma automatica.
                    </td>
                </tr><tr>
                    <td colspan="2" valign="middle" align="justify">
                        <label><b>Usuario : </b><span style="color:black; text-decoration:none; cursor:default;">${usuario}</span></label>
                        <br/>
                        <label><b>Clave : </b>${clave}</label>
                    </td>
                </tr><tr>
                    <td colspan="2" colspan="2" valign="middle" align="justify">
                        Al ingresar por primera vez <b>deberá cambiar su clave,</b> Esta clave es descartable por lo que se convertirá en antigua. Posteriormente deberá asignar una nueva clave que posea mas de 4 caracteres alfanuméricos.
                    </td>
                </tr><tr>
                    <td colspan="2" valign="middle" align="justify">Atentamente,</td>
                </tr><tr>
                    <td width="80"><img height="100" src=""></td>
                    <td valign="middle" align="justify">
                        OPTIMA - Digital<br/>
                        Optima Servicios Financieros S.A. de C.V.<br/>
                        75 Avenida Norte y 9na Calle Poniente #536, Colonia Escalón<br/>
                        San Salvador, El Salvador, C.A.
                    </td>
                </tr>
            </table>
        `
    });

}

async function SendNoti(asesor, cliente) {

    let info = await trans.sendMail({
        from: '"OPTIMA - Digital" <grpsistemas@optima.com.sv>',
        to: `"Fabrica de Creditos" <grpfabricadecreditos@optima.com.sv>;"Roberto Montepeque" <roberto.montepeque@optima.com.sv>;`,
        subject: 'Notificación de carga de documentos',
        html: `
            <table width="100%" border="0" cellspacing="0" cellpadding="10">
                <tr>
                    <td colspan="2" valign="middle" align="justify">Estimado(a):</td>
                </tr><tr>
                    <td colspan="2" valign="middle" align="justify">
                        Por este medio se le comunica que el(la) asesor(a): <b>${asesor},</b> ha cargado documento(s) adjunto(s) al expediente del cliente: <b>${cliente},</b> para que puedan ser revisados.
                    </td>
                </tr><tr>
                    <td colspan="2" colspan="2" valign="middle" align="justify">
                    <b>NOTA: </b> Antes de consultar el expediente se debe tomar en cuenta que despues de cargar el(los) documento(s) adjunto(s), el servidor toma como minimo <b>5 minutos</b> para despues visualizarlos en BW.
                    </td>
                </tr><tr>
                    <td colspan="2" valign="middle" align="justify">Atentamente,</td>
                </tr><tr>
                    <td width="80"><img height="100" src=""></td>
                    <td valign="middle" align="justify">
                        OPTIMA - Digital<br/>
                        Optima Servicios Financieros S.A. de C.V.<br/>
                        75 Avenida Norte y 9na Calle Poniente #536, Colonia Escalón<br/>
                        San Salvador, El Salvador, C.A.
                    </td>
                </tr>
            </table>
        `
    });

}

module.exports = {
    sendMail,
    SendNoti
}