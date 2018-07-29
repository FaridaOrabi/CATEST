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

class Test {

    static init(l, questions)
    {
        var obj = {};
        obj.picked = [];
        obj.level = Test.stratify(questions);
        obj.length = l;
        obj.progress = 0;
        return obj;
    }

    static stratify(questions) {
        var level = [];
        for (var x of questions) {
            if (level[x['difficulty']] == undefined)
                level[x['difficulty']] = [];
                level[x['difficulty']].push(x);
        }
        return level;
    }

    static pickQuestion(obj, diff) {
        if (!obj.level[diff]) return false;

        var pos = rndUnfrm(obj.level[diff].length);
        obj.picked.push(obj.level[diff][pos]);
        obj.level[diff].splice(pos, 1);

        return obj.picked[obj.picked.length - 1];
    }

    static getLastQuestion(obj)
    {
        return obj.picked[obj.picked.length - 1];
    }

    static answerLastQuestion(obj, answer)
    {
        var currentQuestion = obj.picked[obj.picked.length - 1];
        currentQuestion.userAnswer = answer;
        currentQuestion.isCorrect = currentQuestion.userAnswer == currentQuestion.answer;
    }

    static markTest(obj)
    {
        obj.score = obj.picked.filter(x => x.isCorrect).length;
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

module.exports = {Test};
