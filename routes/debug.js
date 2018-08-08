var express = require('express');
var router = express.Router();

var fs = require('fs');

// var TestFactory = require('../alg/statictest').Test;
var Logic = require('../alg/staticLogic'),
    TestFactory = Logic.Test,
    TopicFactory = Logic.Topic,
    QuestionFactory = Logic.Question;



    function readJSON(filename)
    {
        return JSON.parse(fs.readFileSync(filename, 'utf-8'));
        // return require(filename);
    }
    
    function writeJSON(path, data)
    {
        fs.writeFile(path, JSON.stringify(data));
    }
    
    function writeTopic(topic)
    {
        writeJSON(topic.topicTitle, topic);
    }

router.get('/', (req, res) => {
   
    res.send(readJSON(topicPath + topics[0])['questions'][0]);
});

module.exports = router;
