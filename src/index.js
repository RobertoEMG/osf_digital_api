const express = require('express');
const server = express();
const morgan = require('morgan');
const config = require('./config');
const router = require('./routers');

// Settings 
server.set('json spaces', 2);

// Middlewares
server.use(morgan('dev'));                                              // PARA MONITORIAR LAS PETICIONES A LA API POR MEDIO DEL MODULO DE [ MORGAN ]
server.use(express.urlencoded({ extended: true, limit: '100mb' }));     // SIRVE PARA PODER ENTENDER LOS DATOS DE LOS FORMULARIOS
server.use(express.json({ extended: true, limit: '100mb' }));           // PARA SOPORTAR EL FORMATO JSON

// CORS
server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Allow', 'GET, POST, PUT, DELETE');
    next();
});

// Routers
server.use('/api', router); // CON ESTO INDICAMOS QUE TODAS LAS RUTAS DEBE INICIAR CON /api/...
server.use((req, res, next) => {
    res.status(404).send({
        error: true,
        codigo: 404,
        mensaje: 'URL not Found'
    });
});

// Starting the Server
server.listen(config.port, () => {
    console.log(`Server Run on port: ${config.port}`);
});