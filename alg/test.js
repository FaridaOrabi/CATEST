sample_qbnk = [{"id":"FUTR","d":2},{"id":"OBXF","d":3},{"id":"ZWQJ","d":1},{"id":"NZXU","d":4},{"id":"RDTX","d":3},{"id":"UWBI","d":4},{"id":"HSVC","d":3},{"id":"LWCG","d":3},{"id":"FYYO","d":1},{"id":"OPNP","d":3},{"id":"NXDM","d":1},{"id":"CNED","d":1},{"id":"YMLO","d":4},{"id":"TQYQ","d":3},{"id":"UMWB","d":3},{"id":"UGMD","d":4},{"id":"VLLY","d":3},{"id":"UKMQ","d":4},{"id":"VTHR","d":2},{"id":"ZEVW","d":4},{"id":"KLQQ","d":2},{"id":"HJEP","d":1},{"id":"HSBX","d":3},{"id":"RWKR","d":4},{"id":"NQHQ","d":3},{"id":"RTIM","d":4},{"id":"VIYY","d":2},{"id":"IGKG","d":4},{"id":"ACTR","d":3},{"id":"SXPS","d":1},{"id":"BDEL","d":2},{"id":"MRSY","d":3},{"id":"WTER","d":1},{"id":"OHAC","d":1},{"id":"LMDM","d":1},{"id":"YMTX","d":4},{"id":"AHHI","d":1},{"id":"ZSIK","d":2},{"id":"LLYN","d":2},{"id":"VWKX","d":3},{"id":"FEUG","d":3},{"id":"TIYK","d":1},{"id":"RUBL","d":1},{"id":"LIKM","d":1},{"id":"MFFS","d":1},{"id":"JPJG","d":4},{"id":"SUSW","d":3},{"id":"IPKQ","d":3},{"id":"HGRR","d":1},{"id":"MCYF","d":2},{"id":"RAMV","d":3},{"id":"SBJS","d":1},{"id":"EDYM","d":2},{"id":"CMCL","d":1},{"id":"WYNS","d":2},{"id":"FIQH","d":1},{"id":"QKHD","d":4},{"id":"TVFN","d":2},{"id":"KBAJ","d":3},{"id":"DUSX","d":4},{"id":"ASRO","d":3},{"id":"UAXH","d":4},{"id":"KNDO","d":2},{"id":"GHFT","d":1},{"id":"TXWS","d":1},{"id":"SCAM","d":4},{"id":"XGXR","d":1},{"id":"UBIF","d":3},{"id":"EEPT","d":3},{"id":"ADII","d":1},{"id":"QXEC","d":4},{"id":"VSGZ","d":3},{"id":"YALG","d":4},{"id":"QUWR","d":1},{"id":"VWKV","d":1},{"id":"MFWL","d":2},{"id":"ELLH","d":1},{"id":"GOOZ","d":4},{"id":"JZDB","d":3},{"id":"YWKJ","d":3},{"id":"LRNY","d":4},{"id":"FTDR","d":3},{"id":"OBOJ","d":2},{"id":"COVM","d":2},{"id":"VAFT","d":3},{"id":"NCWL","d":3},{"id":"DCRF","d":2},{"id":"GWOH","d":3},{"id":"BSUS","d":3},{"id":"DTZW","d":3},{"id":"RIOW","d":3},{"id":"QRHK","d":3},{"id":"KSLM","d":1},{"id":"NFHD","d":4},{"id":"DOMH","d":1},{"id":"FAOJ","d":1},{"id":"USNF","d":2},{"id":"YUES","d":2},{"id":"NRMC","d":3},{"id":"MSQI","d":4}];

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

    constructor(l, bank) {
        this.picked = []
        this.level = this.stratify(bank);
        this.length = l,
        this.progress = 0;
        this.pickQuestion = this.pickQuestion.bind(this);
    }

    samplelog()
    {
        return '123456';
    }

    stratify(questions) {
        var level = [];
        for (var x of questions) {
            if (level[x['d']] == undefined)
                level[x['d']] = [];
            level[x['d']].push(x);
        }
        return level;
    }

    pickQuestion(diff) {
        if (!this.level[diff]) return false;

        var pos = rndUnfrm(this.level[diff].length);
        this.picked.push(this.level[diff][pos]);
        this.level[diff].splice(pos, 1);

        return this.picked[this.picked.length - 1];
    }

    upperDiff(diff)
    {
        while(!this.level[++diff])
            if(diff > this.level.length)
                return false;
        return diff;
     }

     lowerDiff(diff)
     {
         while(!this.level[--diff])
             if(diff < 0)
                 return false;
         return diff;
      }
}

// var t = new Test(5, sample_qbnk)

module.exports = {Test, sample_qbnk};