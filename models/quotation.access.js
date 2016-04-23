/**
 * Created by Pacer-02 on 16/4/20.
 */
var redis = require('../database/redis.db');
var util = require('../util');
var async = require('async');
var constants = require('../util/constants.json');

function createQuotation (quotation, date, onCompleted) {
    console.log(quotation, date);
    var key = util.getkeyForQuotation();
    var redisClient = redis.initQuotationsClient();
    var timeStamp = util.getUnixTimeStamp(date);
    console.log(timeStamp);
    redisClient.multi()
        .hmset('quotation:'+key, 'content', quotation, 'entry_time', timeStamp,
        constants.count_type.wrong_count, 0, constants.count_type.right_count, 0)
        .zadd('quotations', timeStamp, key)
        .exec(function (err, replyies) {
            if (err) {
                return onCompleted(err, null);
            }
            var result = {
                key: key,
                content: quotation,
                entry_time: timeStamp
            };
            console.log(replyies);
            console.log(result);
            onCompleted(null ,result);
        });
}

function createComment (quotationKey, text, date, onCompleted) {
    var redisClient = redis.initQuotationsClient();
    var timeStamp = util.getUnixTimeStamp(date);
    var key = "quotation:"+quotationKey+":comments";
    redisClient.hget('quotation:'+quotationKey, 'content', function (err, reply) {
        if (err) {
            return onCompleted(err, null);
        }
        console.log('no quotation key?');
        console.log(reply);
        if (reply) {
            var commentKey = util.getkeyForComment();
            redisClient.multi()
                .hmset('comment:'+commentKey, 'content', text, 'time', timeStamp)
                .zadd(key, timeStamp, commentKey)
                .exec(function (err, replies) {
                    console.log(replies);
                    if (err) {
                        return onCompleted(err, null);
                    }
                    var result = {
                        key: commentKey,
                        content: text,
                        time: timeStamp
                    };
                    console.log(result.time);
                    onCompleted(null, result);
                });
        }
    });
}

function getCommentByQuotationKey(quotationKey, anchorTime, limit, onCompleted) {
    var key = 'quotation:' + quotationKey + ":comments";
    var args = [key, anchorTime - 0.001, 0, 'limit', 0, limit];
    var redisClient = redis.initQuotationsClient();
    redisClient.zrevrangebyscore(args, function (err, commentKeys) {
        if (err) {
            return onCompleted(err, null);
        } else if (commentKeys && commentKeys.length>0) {

            if (commentKeys.length>0) {
                var comments = [];
                async.forEach(commentKeys, function (commentKey, cb) {
                    redisClient.hgetall('comment:'+commentKey, function (err, comment) {
                        if (err) {
                            return cb(err, null);
                        }
                        if (comment) {
                            comment.key = commentKey;
                            comments.push(comment);
                        }
                        cb(null, comment);
                    })
                }, function (err, replies) {
                    if (err) {
                        return onCompleted(err);
                    }
                    var result = [];
                    var len = comments.length;
                    for (var i = 0; i<len;i++ ) {
                        for ( var j = 0; j<len; j++) {
                            if (commentKeys[i] === comments[j].key) {
                                result.push(comments[j]);
                                break;
                            }
                        }
                    }
                    onCompleted(null, result);
                })
            } else {
                return onCompleted(null, []);
            }
        } else {
            return onCompleted(null, []);
        }
    });
}

function getQuotationWithOneComment (anchorTime, limit, onCompleted) {
    var args = ["quotations", anchorTime - 0.001, 0,  'limit', 0, limit];
    console.log(args[1]);
    var redisClient = redis.initQuotationsClient();
    redisClient.zrevrangebyscore(args, function (err, quotationKeys) {
        if (err) {
            return onCompleted(err, null);
        }
        console.log(quotationKeys);
        if (quotationKeys && quotationKeys.length>0) {
            var quotations = [];
            async.forEach(quotationKeys, function (quotationsKey, cb) {
                redisClient.hgetall('quotation:'+quotationsKey, function (err, quotation) {
                    if (err) {
                        return cb(err, null);
                    }
                    if (quotation) {
                        quotation.key = quotationsKey;
                        getCommentByQuotationKey(quotationsKey, anchorTime, 1, function (err, comments) {
                            if (err) {
                                return cb(err, null);
                            }
                            if (comments && comments.length>0) {
                                quotation.comments = comments;
                            }
                            quotations.push(quotation);
                            cb(null, quotation);
                        });
                    } else {
                        cb(null, quotation);
                    }
                });
            }, function (err, replies) {
                if (err) {
                    return onCompleted(err, null);
                }
                var result = [];
                var len = quotations.length;
                for (var i = 0; i<len;i++ ) {
                    for ( var j = 0; j<len; j++) {
                        if (quotationKeys[i] === quotations[j].key) {
                            result.push(quotations[j]);
                            break;
                        }
                    }
                }
                onCompleted(null, result);
            });
        } else {
            onCompleted(null, []);
        }
    });
}

var addCountByCountType = function (quotation_key, count_type, onComplete) {
    var redisClient = redis.initQuotationsClient();
    redisClient.hincrby("quotation:"+quotation_key, count_type, 1, function (err, reply) {
        if (err) {
            return onComplete(err);
        }
        onComplete(null, reply);
    });
};

var getQuotationBykeys = function (quotationKeys, onCompleted) {
    var quotations = [];
    async.forEach(quotationKeys, function (quotationsKey, cb) {
        redisClient.hgetall('quotation:'+quotationsKey, function (err, quotation) {
            if (err) {
                return cb(err, null);
            }
            if (quotation) {
                quotation.key = quotationsKey;
                getCommentByQuotationKey(quotationsKey, anchorTime, 1, function (err, comments) {
                    if (err) {
                        return cb(err, null);
                    }
                    if (comments && comments.length>0) {
                        quotation.comments = comments;
                    }
                    quotations.push(quotation);
                    cb(null, quotation);
                });
            } else {
                cb(null, quotation);
            }
        });
    }, function (err, replies) {
        if (err) {
            return onCompleted(err, null);
        }
        onCompleted(null, quotations);
    });
}

exports.createQuotation = createQuotation;
exports.createComment = createComment;
exports.getCommentByQuotationKey = getCommentByQuotationKey;
exports.getQuotationWithOneComment = getQuotationWithOneComment;
exports.addCountByCountType = addCountByCountType;
exports.getQuotationBykeys = getQuotationBykeys;