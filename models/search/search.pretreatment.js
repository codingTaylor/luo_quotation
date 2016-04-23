/**
 * Created by Pacer-02 on 16/4/20.
 */
var constatns = require('../../util/constants.json');
var async = require('async');
exports.preTreatment = function (searchString, onCompleted) {
    tokenize(searchString, function (searchTerm) {
        onCompleted(searchTerm);
    });
};
function tokenize (searchString, onCompleted) {
    var searchs = searchString.split(' ');
    var search_text_min_len = constatns.search_config.search_min_len;
    var realSearchs = [];
    async.forEach(searchs, function (search,cb) {
        validCheck(search, function (pureSearch) {
            if (pureSearch.length>0) {
                realSearchs.push(pureSearch);
            }
            cb();
        })
    }, function () {
        onCompleted(realSearchs);
    });
}
function validCheck(searchString, onCompleted) {
    var validCharacters = constatns.search_config.valid_character_reg;
    var purSearchs = [];
    for (var key in validCharacters) {
        if (validCharacters.hasOwnProperty(key)){
            var reg = new RegExp(validCharacters[key], 'g');
            var pureSearchs = searchString.match(reg);
        }
    }
    onCompleted(pureSearchs.join(''));
}