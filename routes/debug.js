var express = require('express');
var router = express.Router();

// var TestFactory = require('../alg/statictest').Test;
var Logic = require('../alg/staticLogic'),
    TestFactory = Logic.Test,
    TopicFactory = Logic.Topic,
    QuestionFactory = Logic.Question,
    ParameterFactory = Logic.Parameter,
    MetricFactory = Logic.Metric;


function readJSON(filename)
{
    // console.log('Reading a file....');
    // return JSON.parse(fs.readFileSync(filename, 'utf-8'));
    return require(filename);
}

router.get('/', (req, res) => {
    var topic1 = require('../alg/Topics/1. Data Types, Variables and Arrays/1. Integer and Floating Data Types/1. Integer and Floating Data Types');
    var topic2 = require('../alg/Topics/1. Data Types, Variables and Arrays/2. Character and Boolean Data Types/2. Character and Boolean Data Types');
    var topic3 = require('../alg/Topics/1. Data Types, Variables and Arrays/6. Literals & Variables/6. Literals & Variables');

    var t = TestFactory.init('[Java] Data Types', topic1, topic2, topic3);
    t.param = {};
    t.param.timeWarn = 5;
    t.param.timeOut = 2000;

    req.session.t = t;

    t.currentQuestion = TestFactory.pickQuestion(t);

    console.log(t.currentQuestion);

    res.render('test/test_debug', t);
});

module.exports = router;
