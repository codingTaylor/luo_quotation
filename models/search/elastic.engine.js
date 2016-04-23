/**
 * Created by Pacer-02 on 16/4/20.
 */
var constants = require('../../util/constants.json');
var urllib = require('urllib');
var elasticsearch = require('elasticsearch');

function getElasticServer() {
    var server;
    if (process.env.NODE_ENV === 'product') {
        server = constants.elastic_server.product;
    } else {
        server = constants.elastic_server.development;
    }
    return server;
}

//exports.createIndexForQuotation =  function (key, quotation, onCompleted) {
//    var server = getElasticServer();
//    var url = server + '/quotations/' + key;
//    var data = {
//        content: quotation,
//        key: key
//    };
//    urllib.request(
//        url,
//        {
//            method: 'PUT',
//            headers: {
//                Accept: 'application/json',
//                'Content-Type': 'application/json'
//            },
//            'Content-Type': 'json',
//            data: data
//        },
//        function (err, result, response) {
//            if (err) {
//                onCompleted(err, null);
//            } else {
//                onCompleted(null, null);
//            }
//        }
//    );
//};

//exports.search = function (searchString, onCompleted) {
//    var server = getElasticServer();
//    var url = server + '/quotations/_search';
//    var data = {
//        size: 50,
//        query: {
//            query_string: {
//                fields: [
//                    "content"
//                ],
//                query: querystring
//            }
//        }
//    };
//    urllib.request(
//        url,
//        {
//            method: 'POST',
//            headers: {
//                Accept: 'application/json',
//                'Content-Type': 'application/json'
//            },
//            'Content-Type': 'application/json',
//            data: data
//        },
//        function (err, result, response) {
//            if (err) {
//                return onCompleted(err, null);
//            }
//            if (result) {
//                var quotationsHits = JSON.parse(result.toString('utf-8')).hits;
//                if (quotationsHits && quotationsHits.hits && quotationsHits.hits.length>0) {
//                    var quotations = quotationsHits.hits;
//                    var result = quotations.map(function (ele) {
//                        return ele._source.key;
//                    });
//                    return onCompleted(null, result);
//                } else {
//                    return onCompleted(null, []);
//                }
//            } else {
//                return onCompleted(null, []);
//            }
//        }
//    )
//}

function getElasticSearchClient() {
    var server = getElasticServer();
    var client = new elasticsearch.Client({
            host: server,
            log: 'trace'
    });
    return client;
}
exports.createIndexForQuotation = function (key, content, onCompleted) {
    var client = getElasticSearchClient();
    client.index({
        index: 'quotations',
        type: 'luo_quotation',
        body: {
            key: key,
            content: content
        }
    }, function (err, res) {
        if (err) {
            console.trace(err);
        }
        onCompleted();
    });
};

exports.search = function (searchString, onCompleted) {
    var client = getElasticSearchClient();
    client.search({
        index:'quotations',
        type: 'luo_quotation',
        body: {
            query: {
                match: {
                    content: searchString
                }
            }
        }
    }).then(function (res) {
        var hits = res.hits.hits;
        var keys = hits.map(function (hit) {
            return hit.key;
        });
        onCompleted(keys);
    }, function (err) {
        onCompleted([]);
    });
};
