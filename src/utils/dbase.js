const mssql = require('mssql');
const config = require('../config');
const cxn = new mssql.connect(config.db, err => {
    if (err) {
        console.log(err);
        return;
    } else {
        console.log(`Database Connected (${config.db.database})`);
    }
});

module.exports = cxn;