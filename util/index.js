var moment = require('moment');
var uuid = require('uuid');

function getUnixTimeStamp(data) {
    var unixTimeStamp;
    if (!isNaN(data/1000)) {
        return data/1000;
    }
    var unixTimeStamp = moment(data).format('x')/1000;
    if (isNaN(unixTimeStamp)) {
        unixTimeStamp = moment().format('x')/1000;
    }
    return unixTimeStamp;
}

function getkeyForQuotation() {
    return uuid.v4();
}

function getkeyForComment() {
    return uuid.v4();
}

function formatObjectFromRedisResult(replyArr) {
    var result = {};
    if (replyArr && replyArr.length>0) {
        replyArr.forEach(function (ele, index) {
            if (index % 2 === 0) {
                result[ele] = result[index+1];
            }
        });
        return result;
    } else {
        return null;
    }
}


exports.getUnixTimeStamp = getUnixTimeStamp;
exports.getkeyForQuotation = getkeyForQuotation;
exports.getkeyForComment = getkeyForComment;
exports.formatObjectFromRedisResult = formatObjectFromRedisResult;