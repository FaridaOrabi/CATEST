var express = require('express');
var router = express.Router();

var TestFactory = require('../alg/statictest').Test;

function readJSON(filename)
{
    // console.log('Reading a file....');
    // return JSON.parse(fs.readFileSync(filename, 'utf-8'));
    return require(filename);
}

router.get('/', function(req, res) {
    res.render('test/test_home');
});

router.post('/setTestParams', (req, res) => {
    var l = Number(req.body.testlength);
    var java_qbnk = readJSON('../alg/java_quiz.json');

    console.log(java_qbnk);

    var t = TestFactory.init(l, java_qbnk);
    var diff = Number(req.body.testdiff);
    req.session.test = t;
    t.currentDiff = Number(diff);

    res.redirect('/test/go');
});

router.get('/go', (req, res) =>
{
    var t = req.session.test;
    var q = TestFactory.pickQuestion(req.session.test, t.currentDiff);

    t.Tick = Date.now();
    t.progress++;
    t.percent = (t.progress / t.length) * 100;
    res.render('test/test_live', { t, q });
});

router.post('/next', (req, res) =>
{
    var t = req.session.test,
        c = req.body.choice;
    TestFactory.answerLastQuestion(t, c); // set user choice
    var q = TestFactory.getLastQuestion(t);
    q.time = (Date.now() - t.Tick) / 1000; // log thinking time

    if(q.isCorrect)
        t.currentDiff = TestFactory.upperDiff(t, t.currentDiff) || t.currentDiff;
    else 
        t.currentDiff = TestFactory.lowerDiff(t, t.currentDiff) || t.currentDiff;

    if(t.progress == t.length)
        res.redirect('result');
    else
        res.redirect('go');

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
