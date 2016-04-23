var myApp = angular.module('myApp', []);
myApp.controller('getQuotationsAndComments', ['$scope', '$http', '$element', '$filter', '$location', '$anchorScroll',function ($scope, $http, $location, $anchorScroll) {

    $scope.quotations = [];
    $scope.comments = [];
    $scope.inputQuotation = "";
    $scope.inputComment = "";
    $scope.curQuotationKey = "";
    var quotationAnchorTime;
    var commentAnchorTime;
    var quotationKey = {};
    var commentKey = {};
    var isAddWrongCount = false;
    var isAddRightCount = false;
    function addQuotations (quotations, isNew) {
        if (isNew) {
            quotationKey[quotations[0].key] = true;
            $scope.quotations.unshift(quotations[0]);
        } else {
            var len = quotations.length, i=0;
            while(i<len) {
                if (!quotationKey[quotations[i].key]) {
                    quotationKey[quotations[i].key] = true;
                    $scope.quotations.push(quotations[i]);
                }
                i++;
            }
        }
    }
    function addComments (comments,isNewQuotation, isNewComment) {
        if (!$scope.curQuotationKey) {
            return;
        }
        var i = 0, len = comments.length;
        while (i < len) {
            comments[i].displayTime = moment(comments[i].time*1000).format('YYYY-MM-DD hh:mm:ss');
            i++;
        }
        if (isNewQuotation) {
            commentKey = {};
            $scope.comments = comments;
        } else {
            var len = comments.length, i=0;
            while(i<len) {
                if (!commentKey[comments[i].key]) {
                    quotationKey[comments[i].key] = true;
                    if (isNewComment){
                        $scope.comments.unshift(comments[i]);
                    } else {
                        $scope.comments.push(comments[i]);
                    }
                }
                i++;
            }
        }

    }
    function sendRequest(data, method, url, onCompleted) {
        var req = {
            method: method,
            url: url,
            data: data
        };
        $http(req).success(function (data, status, heads, config) {
            onCompleted(data, status, heads, config);
        })
    }
    $scope.init = function () {
        addQuotations(quotations, false);
        if ($scope.quotations.length>0) {
            $scope.getComments($scope.quotations[0]);
        }
    };
    $scope.submitQuotation = function () {
        //TODO: valid check
        if($scope.inputQuotation.length === 0) {
            return;
        }
        var postData = {
            quotation: $scope.inputQuotation
        };
        var url = 'http://localhost:3000/quotations/create';
        sendRequest(postData, 'POST', url, function (data, status, heads, config) {
            if (data && data.quotation) {
                addQuotations([data.quotation], true);
                $scope.inputQuotation = "";
                $scope.getComments(data.quotation);
                var commentNode = document.getElementById('content_right');
                angular.element(commentNode).css('marginTop', 0 + 'px');

            }
        });
    };
    $scope.searchQuotation = function () {
        //TODO: valid check
        return;
        if ($scope.inputQuotation.length === 0) {
            return;
        }
        var url = 'http://localhost:3000/quotations/search?search_string='+$scope.inputQuotation;
        sendRequest(null, "GET", url, function (data, status, heads, config) {
            if (data&& data.quotations) {
                $scope.quotations = [];
                quotationKey = {};
                addQuotations(quotations, false);
            }
        })
    };
    $scope.submitComment = function () {
        //TODO: valid check
        if($scope.inputComment.length === 0) {
            return;
        }
        var postData = {
            comment: $scope.inputComment
        };
        var url = 'http://localhost:3000/quotations/'+$scope.curQuotationKey+'/comment/create';
        sendRequest(postData, 'POST', url, function (data, status, heads, config) {
            if (data && data.comment) {
                addComments([data.comment], false, true);
                $scope.inputComment = "";
                $scope.commentTip = "";
            }
        });
    };
    $scope.getComments = function (quotation) {
        if (!quotation.key) {
            return;
        }
        var isNewQuotation,url;
        if ($scope.curQuotationKey != quotation.key || $scope.comments.length === 0) {
            $scope.curQuotationKey = quotation.key;
            isNewQuotation = true;
            url = 'http://localhost:3000/quotations/'+$scope.curQuotationKey+'/comments';
            sendRequest(null, "GET", url, function(data, status, heads, config) {
                if (data && data.comments) {
                    if (data.comments.length > 0){
                        $scope.commentTip = '';
                    } else {
                        $scope.commentTip = '暂无评论';
                    }
                    addComments(data.comments, isNewQuotation, false);
                }
            });
        }

    };
    $scope.moveCommentShowRegion = function ($event) {
        var node = $event.currentTarget || $event.srcElement;
        while (node.nodeName != 'LI') {
            node = node.parentNode;
        }
        var offsetTop = angular.element(node).prop('offsetTop');
        var commentNode = document.getElementById('content_right');
        angular.element(commentNode).css('marginTop', offsetTop + 'px');
    };
    $scope.getMoreQuotation = function (cb) {
        if ($scope.quotations.length > 0) {

            var anchor_time = $scope.quotations[$scope.quotations.length-1].entry_time*1000;

            var url = 'http://localhost:3000/quotations?anchor_time='+anchor_time;
            sendRequest(null, "GET", url, function (data, status, heads, config) {
                if (data&&data.quotations) {
                    addQuotations(data.quotations, false);
                    if (cb) {
                        cb();
                    }
                }
            });
        }
    };
    $scope.getMoreComments = function (cb) {
        var url;
        if (!$scope.curQuotationKey) {
            return;
        } else {

            var anchorTime;
            if ($scope.comments.length>0) {
                anchorTime = $scope.comments[$scope.comments.length-1].time*1000;
            } else {
                anchorTime = moment().format('x');
            }
            url = 'http://localhost:3000/quotations/'+$scope.curQuotationKey+'/comments?anchor_time='+anchorTime;
            sendRequest(null, "GET", url, function (data, status, heads, config) {
                if (data&&data.comments) {
                    addComments(data.comments, false, false);
                    if (cb) {
                        cb();
                    }
                }
            })
        }
    };
    $scope.addWrongCount = function (quotation) {
        if (isAddWrongCount) {
            return;
        }
        var url = "http://localhost:3000/quotations/"+$scope.curQuotationKey+"/wrong_count/count"
        sendRequest(null,'PUT',url, function (data, status, heads, config) {
            if (data && data.result) {
                isAddWrongCount = true;
                quotation.wrong_count =parseInt(quotation.wrong_count)+1;
            }
        });
    };
    $scope.addRightCount = function (quotation) {
        if (isAddRightCount) {
            return;
        }
        var url = "http://localhost:3000/quotations/"+$scope.curQuotationKey+"/right_count/count"
        sendRequest(null,'PUT',url, function (data, status, heads, config) {
            if (data && data.result) {
                isAddRightCount = true;
                quotation.right_count =parseInt(quotation.right_count)+1;
            }
        });
    };
}]);

myApp.filter('comment_reverse', function () {
    return function (comments) {
        return comments.slice().reverse();
    }
});

window.onscroll = function () {
    var windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    var pageHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
    var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
    if (Math.abs(pageHeight - scrollTop - windowHeight) < 10) {
        var angularEle =  document.querySelector("[ng-controller=getQuotationsAndComments]");
        var loadingEle = document.getElementById('quotation_loading');
        loadingEle.style.display = 'block';
        angular.element(angularEle).scope().getMoreQuotation(function () {
            loadingEle.style.display = 'none';
        });
    }
};

function onDivScroll() {
    var ele = document.getElementById('comment_show_region');
    if (ele.scrollTop === 0) {
        var loadingEle = document.getElementById('comment_loading');
        loadingEle.style.display = 'block';
        angular.element(ele).scope().getMoreComments(function () {
            loadingEle.style.display = 'none';
        });
    }
}