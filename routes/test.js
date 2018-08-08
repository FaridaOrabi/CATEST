var express = require('express');
var router = express.Router();
var fs = require('fs');

var Logic = require('../alg/staticLogic'),
    TestFactory = Logic.Test,
    TopicFactory = Logic.Topic,
    QuestionFactory = Logic.Question;

router.get('/', (req, res) => {
    var available_topics = TestFactory.loadQuiz('Java.quiz');
    res.render('test/test_home', {available_topics});
});

router.post('/setTestParams', (req, res) => {

    var t = TestFactory.init('Java Sample Exam', req.body.selectedTopics);
    // set other parameters too

    
    req.session.test = t;
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
