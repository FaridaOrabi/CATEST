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

class Test
{
    static init(title, ...TopicArr)
    {
        var obj = {
            testTitle: title,
            topics: [],
            currentQuestion : {}, // reference to question
            previousQuestion : {}, // reference to question
            currentDiff : 4,
            currentTopicIndex : 0 // first topic index
        };
        for(var x of TopicArr){
            x.level = Topic.stratify(x);
            x.pickedQuestions = [];
            obj.topics.push(x);
        }
        return obj;
    }

    static pickQuestion(obj)
    {
        var diff = obj.currentDiff,
            t = obj.topics[obj.currentTopicIndex];

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
        var q = currentQuestion;
        q.isCorrect = Question.checkUserAnswer(obj, q.userAns);
    }
}

class Topic
{
    static init()
    {

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
    static checkUserAnswer(obj, answer)
    {
        var correctAnswer = obj.correctAns;
        for(var a of answer)
            if(correctAnswer.indexOf(a) == -1)
                return false;

        return true;
    }
}

class Parameter
{

}

class Metric
{

}


module.exports = {Test, Topic, Question, Parameter, Metric};
