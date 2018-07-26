var express = require('express');
var router = express.Router();

var TestFactory = require('../alg/statictest').Test;

router.get('/', function(req, res) {
    var t = TestFactory.init(5, sample_qbnk);
    req.session.test = t;
    res.render('test/test_home');
});

router.get('/go', (req, res) =>
{
    res.render('test/test_live', {progress: 'CLEAR'});
});

router.post('/go', (req, res) =>
{
    var t = req.session.test;
    if(t.progress > t.length)
    {
        res.redirect('/test/result');
        return;
    }

    var q = TestFactory.pickQuestion(req.session.test, 2);
    res.render('test/test_live', {
        progress: t.progress++,
        length: t.length,
        id: q.id,
        diff: q.d
    });
});

router.get('/result', (req, res)  =>
{
    var t = req.session.test;
    res.render('test/test_result', {correct: 'Done'});
});

module.exports = router;
