/**
 * Created by Pacer-02 on 16/4/20.
 */
var engine = require('./elastic.engine');
var search_pretreatment = require('./search.pretreatment');
var quotation_access = require('../quotation.access');

exports.search = function (searchString, onCompleted) {
    search_pretreatment.preTreatment(searchString, function (searchTerm) {
        if (searchTerm.length===0) {
            return onCompleted([]);
        }
        engine.search(searchTerm.join(' '), function (quotationKeys) {
            quotation_access.getQuotationBykeys(quotationKeys, function (err, quotations) {
                if (err) {
                    onCompleted(err, []);
                } else {
                    onCompleted(quotations);
                }
            });
        })
    })
};

exports.indexForQuotation = function (key, content, onCompleted) {
    engine.createIndexForQuotation(key, content, function () {
        onCompleted();
    });
};