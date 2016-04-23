var quotation_access = require('../models/quotation.access.js');
var moment = require('moment');
var util = require('../util');
var constants = require('../util/constants');
var search_service = require('../models/search/search.service');

function index(req, res, next) {
    var anchorTime = constants.redis_zset_score.max;
    if (req.query.anchor_time) {
        anchorTime = util.getUnixTimeStamp(req.query.anchor_time);
    }
    quotation_access.getQuotationWithOneComment(anchorTime, constants.quotation_limit, function (err, quotations) {
        if (err) {
            return next(err);
        }
        if (req.query.anchor_time) {
            var sendData = {};
            sendData.quotations = quotations;

            res.send(200, sendData);
        } else {
            var sendData = {};
            sendData.quotations = JSON.stringify(quotations);

            res.render('quotations', sendData);
        }

    });
}

function createQuotation(req, res, next) {
    if (!req.body.quotation) {
        return next(new Error('should post data'));
    }
    var timeStamp = moment().format('x');
    //TODO: escap the input quotation
    quotation_access.createQuotation(req.body.quotation, timeStamp, function (err, quotation) {
        if (err) {
            return next(err);
        }
        var sendData = {};
        sendData.quotation = quotation;
        res.send(200, sendData);
    });
}

function createComment(req, res, next) {
    if (!req.params.quotation_key || !req.body.comment) {
        return next(new Error('some data is absence'));
    }
    var timeStamp = moment().format('x');
    //TODO: escap the input comment
    quotation_access.createComment(req.params.quotation_key, req.body.comment, timeStamp, function (err, comment) {
        if (err) {
            return next(err);
        }
        var sendData = {
            comment: comment
        }
        res.send(200, sendData);
    });
}

function getCommentsByQuotationKey(req, res, next) {
    if (!req.params.quotation_key) {
        return next(new Error('some data is absence'));
    }
    var anchorTime = util.getUnixTimeStamp(req.query.anchor_time);
    quotation_access.getCommentByQuotationKey(req.params.quotation_key, anchorTime, constants.comment_limit, function (err, comments) {
        if (err) {
            return next(err);
        }
        var sendData = {};
        sendData.comments = comments;
        res.send(200, sendData);
    });
}

function addCountByCountType(req, res, next) {
    if(!req.params.quotation_key || !req.params.count_type) {
        return next(new Error('some data is absence'));
    }
    if (!constants.count_type[req.params.count_type]) {
        return next(new Error('valid count type'));
    }
    quotation_access.addCountByCountType(req.params.quotation_key, req.params.count_type, function (err, result) {
        if (err) {
            return next(err);
        }
        res.send(200, constants.result_200);
    });
}

function quotationSearch(req, res, next) {
    if (!req.query.search_string) {
        return next(new Error('some data is absence'));
    }

    //TODO: valid check
    search_service.search(req.query.search_string, function (err, quotations) {
        if (err) {
            return next(err);
        }
        var sendData = {
            quotations: quotations
        };
        res.send(200, sendData);
    });
}


exports.index = index;
exports.createQuotation = createQuotation;
exports.createComment = createComment;
exports.getCommentsByQuotationKey = getCommentsByQuotationKey;
exports.addCountByCountType = addCountByCountType;
exports.quotationSearch = quotationSearch;
