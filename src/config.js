module.exports = {
    SECRET_TOKEN: 'osf_api_rest',
    port: process.env.PORT || 3001,
    db: {
        user: 'sa',
        password: 'AdminSA$2019',
        server: '10.3.11.15',
        port: 1433,
        database: 'AppDigital',
        connectionTimeout: 300000,
        requestTimeout: 300000,
        pool: {
            idleTimeoutMillis: 300000,
            max: 100
        }
    },
    rs : {
        server: 'http://10.3.11.12:80/ReportServer',
        username: 'roberto.montepeque',
        password: 'Rm1234$',
        reportpath: '/Reportes/OptimaDigital/RPT_CREDIT_SCORE'
    }
}