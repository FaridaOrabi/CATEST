var fs = require('fs');

const topicPath = './alg/Topics/Java/';

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

function readJSON(filename)
{    
    // return require(filename);
    return JSON.parse(fs.readFileSync(filename, 'utf-8'));
}

function writeJSON(path, data)
{
    fs.writeFile(path, JSON.stringify(data));
}

function writeTopic(topic)
{
    writeJSON(topic.topicTitle, topic);
}

class Test
{
    static init(title, selectedTopic)
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
        };

        if(!Array.isArray(selectedTopic)) // fix single topic
            selectedTopic = [selectedTopic];
        
        for(var t of selectedTopic)
            obj.topics.push(Topic.init(t));

        for(var x of obj.topics)
            obj.totalNumQuestions += x.totalNumQuestions;

        obj.currentTopic = obj.topics[0];
        return obj;
    }

    static loadQuiz(subject) //.quiz
    {
        return fs.readFileSync('./alg/Topics/' + subject, 'utf-8').split('\n');
    }

    static pickQuestion(obj)
    {
        var diff = obj.currentDiff,
            // t = obj.topics[obj.currentTopicIndex];
            t = obj.currentTopic;

        if (!t.level[diff]) return false;

        var pos = rndUnfrm(t.level[diff].length);
        t.pickedQuestions.push(t.level[diff][pos]);
        t.level[diff].splice(pos, 1);

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

    static answerLastQuestion(obj, answer)
    {
        var q = obj.currentQuestion;
        q.isCorrect = Question.checkUserAnswer(q, q.userAns);
    }
}

class Topic
{
    static init(topic)
    {

        var obj = {
            level: [],
            pickedQuestions: [],
            progress: 0,
            totalNumQuestions: 0,
            percent :0
        }
        obj = {...obj, ...Topic.loadTopic(topic)}; // combine existing attributes
        obj.level = Topic.stratify(obj);
        obj.totalNumQuestions = obj.questions.length;
        obj.percent = (obj.progress / obj.totalNumQuestions) * 100;
        return obj;
    }

    static loadTopic(topicTitle)
    {
        return readJSON(topicPath + topicTitle + '.json');
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

    static upperDiff(obj, diff)
    {
        while(!obj.level[++diff])
            if(diff > obj.level.length)
                return false;
        return diff;
     }

     static lowerDiff(obj, diff)
     {         
         while(!obj.level[--diff])
             if(diff < 0)
                 return false;
         return diff;
      }
}

class Question
{
    static init()
    {
        var obj = {
            metric_pickCount: 0,
            metric_timeSpent: [],
        };
    }

    static setUserAnswer(obj, answer)
    {
        obj.userAnswer = answer;
    }

    static checkUserAnswer(obj)
    {
        var correctAnswer = obj.correctAns,
            answer = obj.userAnswer;
        if(!Array.isArray(answer)) answer = [answer];
        for(var a of answer)
            if(correctAnswer.indexOf(a) == -1)
                return false;

        return true;
    }

    static trackMetric(obj, duration)
    {
        var q = obj.currentQuestion;

        if(q.metric_timeSpent === undefined)
        {
            q.metric_timeSpent.push(duration);
            q.metric_pickCount++;
        }
        else 
        {
            q.metric_timeSpent = [];
            q.metric_pickCount = 1;
        }
    }

    static avgTimeSpent(obj)
    {
        var res = 0;
        for(var x of obj.metric_timeSpent)
            res += x;
        return res / obj.metric_timeSpent.length;
    }
}

module.exports = {Test, Topic, Question};
