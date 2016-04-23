var redis = require('redis');
var constants = require('../util/constants.json');

function initClient(host, port, db) {
    var options = {
        retry_max_delay: 60000
    };
    var client = redis.createClient(port, host, options);
    client.on('error', function(err) {
        console.log(err);
    });
    client.select(db);
    return client;
}

function initQuotationsClient () {
    var dbInfo;
    if (process.env.NODE_ENV === 'product') {
        dbInfo = constants.redis_database.product;
    } else{
        dbInfo = constants.redis_database.development;
    }
    var host = dbInfo.host;
    var port = dbInfo.port;
    var db = dbInfo.db;
    console.log('host', host);
    console.log('port', port);
    console.log('db', db);
    return initClient(host, port, db);
}

exports.initQuotationsClient = initQuotationsClient;