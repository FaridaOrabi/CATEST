var fs = require('fs');
var fspath = require('path');

const topicPath = './alg/Topics/';

function rndUnfrm(n) {
    return ~~(Math.random() * n);
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function isArrEmpty(arr, diff)
{
    // return arr[diff] == undefined || arr[diff].length == 0;
    return !Array.isArray(arr[diff]) || !arr[diff].length;
}

function readJSON(filename)
{    
    // return require(filename);
    return JSON.parse(fs.readFileSync(filename, 'utf-8'));
}

function writeJSON(path, data)
{
    var dirname = fspath.dirname(path);
    if(!fs.existsSync(dirname))
        fs.mkdirSync(dirname);
    fs.writeFile(path, JSON.stringify(data), (error) => {/* ignore errors*/});
}

function writeTopic(topic)
{
    writeJSON(topic.topicTitle, topic);
}

class Test
{
    static init(title, selectedTopics, allTopics, allTopicSizes, subj)
    {
        var obj = {
            testTitle: title,
            topics: [],
            currentQuestion : {}, // reference to question
            currentDiff : 2,
            currentTopicIndex : 0, // first topic index
            progress: 0,
            totalNumQuestions: 0,
            percent : 0,
            param_timeWarn : 10,
            param_timeOut: 2000,
            param_threshold : 60,
            param_minDifficulty : 1,
            param_maxDifficulty : 4,
            metric_tick : 0,
            metric_correct: 0
        };

        Topic.parseQuizRequest(obj, selectedTopics, allTopics, allTopicSizes, subj);

        for(var x of obj.topics)
            obj.totalNumQuestions += x.totalNumQuestions;

        obj.currentTopic = obj.topics[0];
        return obj;
    }

    static loadAllSubjects() // a bit messy
    {
        var res = {}
        const { readdirSync, statSync } = require('fs');
        const { join } = require('path');
        const dirs = p => readdirSync(p).filter(f => statSync(join(p, f)).isDirectory());
        const jsons = p => readdirSync(p).filter(f => statSync(join(p, f)));
        for(var x of dirs('./alg/Topics/'))
        {
            res[x] = [];
            for(var y of jsons('./alg/Topics/' + x))
            {
                var a = y.split('.json')[0];
                var z = readJSON('./alg/Topics/' + x + '/' + y);
                z = z.questions.length;
                res[x].push({topic_title: a, topic_size: z});
            }
        }
        return res;
    }

    static pickQuestion(obj)
    {
        var t = obj.currentTopic;

        if(isArrEmpty(t.level, obj.currentDiff)) Topic.lowerDiff(obj);
        if(isArrEmpty(t.level, obj.currentDiff)) Topic.upperDiff(obj);
        // if(isArrEmpty(t.level, obj.currentDiff)) return false;

        var diff = obj.currentDiff;

        var pos = rndUnfrm(t.level[diff].length);
        t.pickedQuestions.push(t.level[diff][pos]);
        t.level[diff].splice(pos, 1);

        obj.currentQuestion = t.pickedQuestions[t.pickedQuestions.length - 1];
        // return t.pickedQuestions[t.pickedQuestions.length - 1];
    }

    static getCurrentQuestion(obj)
    {
        var t = obj.currentTopic;
        return t.pickedQuestions[t.pickedQuestions.length - 1];
    }

    static nextTopic(obj)
    {
        if(obj.currentTopicIndex > obj.topics.length)
            return false
        else
            obj.currentTopicIndex++;
        return true;
            
    }
    
    // static markQuestion(obj)
    // {
    //     var question = obj.currentQuestion;
    //     question.time = Question.getTimeSpent(question);
    //     if(Question.isUserAnswerCorrect(question))
    //     {
    //         obj.metric_correct++;
    //         topic.metric_correctQ++;
    //         question.metric_correctCount++;
    //         question.isCorrect = true;
    //     }
    //     else
            
    // }

    static markTest(obj)
    {
        for(var topic of obj.topics)
            for(var question of topic.pickedQuestions)
            {
                question.time = Question.getTimeSpent(question);
                if(Question.isUserAnswerCorrect(question))
                {
                    obj.metric_correct++;
                    topic.metric_correctQ++;
                    question.metric_correctCount++;
                    question.isCorrect = true;
                }
                else 
                    topic.metric_wrongQ++; // question.isCorrect is false by default
            }
    }

    static graphChart(obj)
    {
        var res  = {
            titles :[],
            correctArr:[],
            wrongArr:[]}
        
        for(var topic of obj.topics)
        {
            res.titles.push('"' + topic.title + '"');
            res.correctArr.push(topic.metric_correctQ);
            res.wrongArr.push(topic.metric_wrongQ);
        }

        res.correctArr = res.correctArr.toString();
        res.wrongArr = res.wrongArr.toString();
        res.titles = res.titles.toString();
        return res;        
    }
}

class Topic
{
    static init(topic, totalNumQuestions, subj)
    {

        var obj = {
            level: [],
            pickedQuestions: [],
            progress: 0,
            totalNumQuestions: totalNumQuestions,
            percent :0,
            successRate: 0,
            metric_correctQ: 0,
            metric_wrongQ: 0
        }
        obj = {...obj, ...Topic.loadTopic(topic, subj)}; // combine existing attributes
        obj.level = Topic.stratify(obj);
        // obj.totalNumQuestions = obj.questions.length;
        obj.percent = (obj.progress / obj.totalNumQuestions) * 100;
        return obj;
    }

    static loadTopic(topicTitle, subj)
    {
        return readJSON(topicPath + subj + '/' + topicTitle + '.json');
    }

    static parseQuizRequest(t, selectedTopics, allTopics, allTopicSizes, subj)
    {
        if(!Array.isArray(selectedTopics)) // fix single topic
            selectedTopics = [selectedTopics];

        for(var i = 0;i < selectedTopics.length; i++)
            for(var j = i; j < allTopics.length; j++)
                if(selectedTopics[i] == allTopics[j])
                {
                    t.topics.push(Topic.init(selectedTopics[i], Number(allTopicSizes[j]), subj));
                    break;
                }
    }

    static stratify(topic) {
        var level = [];
        for (var x of topic.questions) {
            if (level[x['difficulty']] == undefined)
                level[x['difficulty']] = [];
                level[x['difficulty']].push(x);
        }
        return level;
    }

    static upperDiff(obj)
    {
        var t = obj.currentTopic;
        while(isArrEmpty(t.level, ++obj.currentDiff) && obj.currentDiff < t.level.length);
     }

    static lowerDiff(obj)
    {
        var t = obj.currentTopic;
         while(isArrEmpty(t.level, --obj.currentDiff) && obj.currentDiff > 0);
    }
}

class Question
{
    static init()
    {
        var obj = {
            time: 0,
            isCorrect : false,
            metric_pickCount: 0,
            metric_timeSpent: [],
            metric_correctCount: 0
        };
    }

    static getUserAnswer(obj)
    {
        return obj.userAnswer[obj.userAnswer.length - 1];
    }

    static setUserAnswer(obj, answer)
    {
        if(obj.userAnswer === undefined) obj.userAnswer = [];
        if(!Array.isArray(answer)) answer = [answer];
        obj.userAnswer.push(answer);    
    }

    static isUserAnswerCorrect(obj)
    {
        var correctAnswer = obj.correctAns,
            answer = this.getUserAnswer(obj);
            // console.log(correctAnswer);
        for(var a of answer)
            if(correctAnswer.indexOf(a) == -1)
                return false;

        return true;
    }

    static getTimeSpent(obj)
    {
        return obj.metric_timeSpent[obj.metric_timeSpent.length - 1] || false;
    }

    static trackMetric(obj, duration)
    {
        if(obj.metric_timeSpent === undefined)
        {
            obj.metric_timeSpent = [];
            obj.metric_pickCount = 0;
        }
        obj.metric_timeSpent.push(duration / 1000); // convert to seconds
        obj.metric_pickCount++;
    }

    static avgTimeSpent(obj)
    {
        var res = 0;
        for(var x of obj.metric_timeSpent)
            res += x;
        return res / obj.metric_timeSpent.length;
    }
}

module.exports = {Test, Topic, Question, writeJSON};
