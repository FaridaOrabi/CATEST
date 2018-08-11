var express = require('express');
var router = express.Router();
var fs = require('fs');

var Logic = require('../alg/staticLogic'),
    TestFactory = Logic.Test,
    TopicFactory = Logic.Topic,
    QuestionFactory = Logic.Question;

router.get('/', (req, res) => {
    var available_topics = TestFactory.loadQuiz('Java.quiz'); // load titles & topicsize only
    req.session.available_topics = available_topics;
    res.render('test/test_home', {available_topics}); // array of {topic_title & topic_size}
});

router.post('/setTestParams', (req, res) => {
    var t = TestFactory.init('Java Sample Exam',
                            req.body.selectedTopics,
                            req.session.available_topics.map(x => x['topic_title']),
                            req.body.topicSize);
    // set other parameters too

    req.session.test = t;
    res.redirect('/test/go');
});

router.get('/go', (req, res) =>
{
    var t = req.session.test;
    t.currentQuestion = TestFactory.pickQuestion(t);

    t.metric_tick = Date.now();

    

    t.percent = (++t.progress / t.totalNumQuestions) * 100;
    t.currentTopic.percent = (++t.currentTopic.progress / t.currentTopic.totalNumQuestions) * 100;

    res.render('test/test_live', { t });
});

router.post('/next', (req, res) =>
{
    var t = req.session.test,
        c = req.body.choice,
        q = t.currentQuestion;
        
    QuestionFactory.setUserAnswer(q, c); // set user choice(s)
    QuestionFactory.trackMetric(q, Date.now() - t.metric_tick);

    // if(QuestionFactory.checkUserAnswer(q, c)) // isUserAnswerCorrect
    //     t.currentDiff = TestFactory.upperDiff(t, t.currentDiff) || t.currentDiff;
    // else 
    //     t.currentDiff = TestFactory.lowerDiff(t, t.currentDiff) || t.currentDiff;

    if(t.currentTopic.progress == t.currentTopic.totalNumQuestions)
        t.currentTopic = t.topics[++t.currentTopicIndex];
    
    if(t.progress == t.totalNumQuestions)
        res.redirect('result');
    else
        res.redirect('go');

});

router.get('/result', (req, res)  =>
{
    var t = req.session.test;
    TestFactory.markTest(t);

    var chart = TestFactory.graphChart(t);
    res.send(t);

    // res.render('test/test_result', { t: t, chart: chart});
});

module.exports = router;
