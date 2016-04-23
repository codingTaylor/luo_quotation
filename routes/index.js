var express = require('express');
var router = express.Router();
var quotation = require('../controllers/quotation');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/quotations', quotation.index);

router.post('/quotations/create', quotation.createQuotation);

router.post('/quotations/:quotation_key/comment/create', quotation.createComment);

router.get('/quotations/:quotation_key/comments', quotation.getCommentsByQuotationKey);

router.put('/quotations/:quotation_key/:count_type/count', quotation.addCountByCountType);

router.get('/quotations/search', quotation.quotationSearch);

module.exports = router;
