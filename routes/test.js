var express = require('express');
var router = express.Router();
var fs = require('fs');

var Logic = require('../alg/staticLogic'),
    TestFactory = Logic.Test,
    TopicFactory = Logic.Topic,
    QuestionFactory = Logic.Question;



router.get('/', (req, res) => {
    var s = TestFactory.loadAllSubjects();
    req.session.subjects = s;
    res.render('test/test_home', {s});
});

router.post('/setTestParams', (req, res) => {
    var subj = req.body.selectedSubject;
    var t = TestFactory.init(
                            subj + 'Sample Exam',
                            req.body.selectedTopics,
                            // req.session.available_topics.map(x => x['topic_title']),
                            req.session.subjects[subj].map(x => x['topic_title']),
                            req.body.topicSize, subj);
                            
    // set other parameters too
    t.currentDiff = req.body.testdiff;
    t.param_timeWarn = req.body.timewarn;
    t.param_timeOut = req.body.timeout;
    t.param_threshold = req.body.threshold;

    req.session.test = t;
    res.redirect('/test/go');
});

router.get('/go', (req, res) =>
{
    var t = req.session.test;
    TestFactory.pickQuestion(t);

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
    
    t.currentTopic.pickedQuestions[t.currentTopic.pickedQuestions.length - 1] = q; // reference fix

    // if(QuestionFactory.checkUserAnswer(q, c)) // isUserAnswerCorrect
    //     t.currentDiff = TestFactory.upperDiff(t, t.currentDiff) || t.currentDiff;
    // else 
    //     t.currentDiff = TestFactory.lowerDiff(t, t.currentDiff) || t.currentDiff;

    if(t.currentTopic.progress == t.currentTopic.totalNumQuestions)
    {
        t.topics[t.currentTopicIndex] = t.currentTopic; // currentTopic doesnt seems like a reference
        t.currentTopic = t.topics[++t.currentTopicIndex];
    }
    
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


    res.render('test/test_result', { t: t, chart: chart});
});

router.get('/gen_home', (req, res) =>
{
    res.render('test/test_gen_home');
});

router.post('/gen_param', (req, res) =>
{
    var f = {};
    
    f.subject = req.body.subjecttitle;
    f.topic = req.body.topictitle;
    f.questionnum = Number(req.body.questionnum);
    f.questiondone = 1;
    f.questions = [];
    
    
    
    req.session.f = f;
    
    res.redirect('/test/gen_live');
});

router.get('/gen_live', (req, res) => 
{
    var f = req.session.f;
    res.render('test/test_gen_live', {f});
});

router.post('/gen_next', (req, res) =>
{
    var f = req.session.f;
    var q = {};
    
    q.statement = req.body.statement;
    q.type = req.body.questiontype;
    q.explain = req.body.explain;
    q.discriminative = (req.body.discriminative === 'marked');
    q.difficulty = Number(req.body.difficulty);


    var correctAnswer = req.body.correctAnswer;
    if(!Array.isArray(correctAnswer)) correctAnswer = [correctAnswer];
    q.correctAns = req.body.correctAnswer;

    var choices = req.body.choice;
    if(!Array.isArray(choices)) choices = [choices];
    q.options = req.body.choice;

    // q.imgURL = req.body.imgURL;
    
    req.session.f.questions.push(q);
       
    // console.log(f);
    if(f.questiondone++ < f.questionnum)
        res.redirect('/test/gen_live');
    else 
        res.redirect('/test/gen_done');
    
});

router.get('/test_welcome', (req, res) =>
{
    res.render('test/test_welcome');
});

router.get('/gen_done', (req, res) =>
{
    var f = req.session.f;

    var topic = {};
    topic.title = f.topic;
    topic.questions = f.questions;
    Logic.writeJSON('./alg/Topics/' + f.subject + '/' + topic.title + '.json', topic);
    res.redirect('/test/test_welcome')
});



module.exports = router;
