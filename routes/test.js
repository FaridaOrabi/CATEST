var express = require('express');
var router = express.Router();

var TestFactory = require('../alg/statictest').Test;

router.get('/', function(req, res) {
    res.render('test/test_home');
});

router.post('/setTestParams', (req, res) => {

    var t = TestFactory.init(5, java_qbnk);
    var diff = Number(req.body.testdiff);
    req.session.test = t;
    t.currentDiff = Number(diff);
    console.log(t);
    res.redirect('/test/go');
});

router.get('/go', (req, res) =>
{
    var t = req.session.test;
    var q = TestFactory.pickQuestion(req.session.test, t.currentDiff);
    t.progress++;
    t.percent = (t.progress / t.length) * 100;
    res.render('test/test_live', { t, q });
    
});

router.post('/next', (req, res) =>
{
    var t = req.session.test,
        c = req.body.choice;
    TestFactory.answerLastQuestion(t, c); //set user choice

    if(t.progress == t.length)
    {
        res.redirect('result');
    }
    else res.redirect('go');
});

router.get('/result', (req, res)  =>
{
    var t = req.session.test;
    var p = req.session.test.picked;
    TestFactory.markTest(t);
    res.render('test/test_result', {picked: p, t:t});
});

router.get('/gen', (req, res) =>
{
    res.render('test/test_gen');
});

module.exports = router;
