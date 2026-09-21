/**
 * IntentPatterns (split1q) — Lane A. Soft-pass lexicon + regex. No exact-key gate.
 */
(function (global) {
  "use strict";
  var INTENTS = ["ask_want","agree","refuse","enter_door","wait","apologize","flirt","challenge","ask_memory","off_topic","unclear"];
  var PATTERNS = {
    enter_door: [/\u63a8\u9580/, /\u63a8\u958b\u9580/, /\u958b\u9580/, /\u958b\u9580\u5566/, /\u958b\u9580\u5416/, /\u958b\u9580\u558e/, /\u958b\u9580\u5440/, /\u958b\u9580\u5148/, /\u5165\u53bb/, /\u5165\u569f/, /\u9032\u4f86/, /\u9032\u53bb/, /\u9032\u5165/, /\u63a8\u5165/, /\u5165\u9580/, /\u9032\u9580/, /\u5165\u53bb\u5148/, /\u5165\u53bb\u672a/, /\u5165\u53bb\u7747/, /\u5165\u53bb\u7747\u5413/, /\u5165\u53bb\u7747\u4e0b/, /\u5165\u53bb\u5566/, /\u9032\u53bb\u770b/, /\u9032\u53bb\u770b\u770b/, /\u884c\u5165/, /\u8d70\u5165/, /\u8e0f\u5165/, /\u6211\u5165/, /\u6211\u5165\u53bb/, /\u6211\u54d2\u5165\u53bb/, /\u800c\u5bb6\u5165\u53bb/, /\u884c\u904e\u53bb\u5148/, /\u884c\u904e\u53bb/, /\u904e\u9580/, /\u6253\u958b\u9580/, /\u6253\u958b\u689d\u9580/, /\u63a8\u958b\u689d\u9580/, /\u5165\u623f/, /\u884c\u5165\u53bb/, /\u63a8\u958b/, /\u53bb\u5165\u9762/, /\u5165\u53bb\u8fa6\u516c\u5ba4/, /\u5165\u53bb\u898b/, /\u9580\u6253\u958b/, /\u5165\u53bb\u5148\u5566/, /\u5165\u53bb\u7747\u4e0b\u5148/, /\u6211\u884c\u5165/, /\benter\b/i, /\bgo in\b/i, /open( the)? door/i, /push( the)? door/i, /let me in/i, /\u6211\u5165\u53bb\u5148\u5566/, /\u5165\u53bb\u7747\u4e00\u7747/, /\u5165\u53bb\u671b\u5413/, /\u884c\u5165\u53bb\u5148/, /\u63a8\u5413\u9580/, /\u63a8\u4e00\u63a8\u9580/, /\u9580\u63a8\u958b/, /\u5165\u53bb\u5148\u81f3\u7b97/, /\u5165\u53bb\u898b\u5413/, /\u6211\u63a8\u9580/, /\u63a8\u5413\u689d\u9580/, /\u9580\u5165\u53bb/, /\u884c\u5165\u8fa6\u516c\u5ba4/, /\u5165\u53bb\u671b\u4e00\u671b/, /\u5165\u53bb\u7747\u4e0b\u5148\u5566/, /\u6211\u884c\u904e\u53bb\u9580/, /\u904e\u548b\u9580/, /\u8e0f\u5165\u53bb/, /\u5165\u53bb\u5148\u5f97/, /\u6211\u54d2\u5165/, /\u4e00\u9f4a\u5165/, /\u8ddf\u4f4f\u5165/, /\u5165\u53bb\u5148\u8b1b/, /\u9580\u55f0\u908a/, /\u5165\u53bb\u5148\u81f3\u50be/, /\u6211\u63a8\u958b/, /\u63a8\u9580\u5165/, /\u5165\u53bb\u5148\u81f3\u7b97\u5566/, /\u958b\u9580\u5148\u5566/, /\u5165\u53bb\u5148\u81f3\u8b1b/, /\u6211\u63a8\u689d\u9580/, /\u884c\u5165\u53bb\u7747\u5413/, /\u63a8\u9580\u5148/, /\u958b\u689d\u9580/, /\u6211\u53bb\u958b\u9580/, /\u53bb\u958b\u9580\u5148/],
    wait: [/\u7336\u8c6b/, /\u505c\u4e00\u79d2/, /\u505c\u4e00\u505c/, /\u505c\u4f4e/, /\u5514\u6562/, /\u518d\u63a8/, /\u7b49\u7b49/, /\u7b49\u7b49\u5148/, /\u4f01\u558e\u5ea6/, /\u7ad9\u4f4f/, /\u7b49\u9663/, /\u7b49\u9663\u5148/, /\u7b49\u4e00\u7b49/, /\u7b49\u6211\u5413/, /\u7b49\u4e00\u5413/, /\u7b49\u6211\u4e00\u9663/, /\u672a\u6e96\u5099/, /\u672a\u6e96\u5099\u597d/, /\u672a\u60f3\u597d/, /\u518d\u8af7/, /\u518d\u8af8/, /\u518d\u7747\u5413/, /\u8af7\u6e05\u695a/, /\u8af8\u6e05\u695a/, /\u8af7\u5413/, /\u8af8\u5413/, /\u8af7\u4e00\u8af7/, /\u8af8\u4e00\u8af8/, /\u6211\u8981\u8af7/, /\u6211\u8981\u8af8/, /\u6211\u518d\u8af7/, /\u672a\u5920\u81bd/, /\u672a\u5b9a/, /\u672a\u6c7a\u5b9a/, /\u6162\u5572/, /\u6162\u4f4f/, /\u7b49\u5413\u5148/, /\u9072\u5572\u5148/, /\u672a\u5f97/, /hold on/i, /\bwait\b/i, /not ready/i, /hang on/i, /\u7b49\u6211\u4e00\u9663\u5148/, /\u6211\u672a\u8af7\u597d/, /\u6211\u672a\u8af7\u6e05\u695a/, /\u505c\u4e00\u505c\u5148/, /\u4f01\u5b9a\u5148/, /\u5514\u597d\u6025/, /\u6162\u5572\u5148/, /\u6211\u518d\u7747\u6e05\u695a/, /\u7b49\u6211\u518d\u8af7/, /\u6211\u8981\u505c\u4e00\u505c/, /\u5148\u5514\u597d\u5165/, /\u672a\u5f97\u9592\u6c7a\u5b9a/, /\u7b49\u5413\u5148\u5566/, /\u518d\u4f01\u4e00\u9663/, /\u6211\u4ef2\u672a\u5b9a/, /\u7540\u6211\u8af7\u5413/, /\u7540\u6211\u505c\u5413/, /\u6211\u672a\u6e96\u5099\u597d\u5440/, /\u9072\u5572\u5165/, /\u800c\u5bb6\u672a\u5165/, /\u6211\u518d\u4f01\u4e00\u9663/, /\u672a\u5f97\u5481\u5feb/, /\u8af3\u5413/, /\u8af3\u4e00\u8af3/, /\u6211\u8981\u8af3/, /\u518d\u8af3/, /\u6211\u8981\u8af3\u5413/, /\u8af3\u6e05\u695a/, /\u7b49\u6211\u4e00\u9663\u5440/, /\u6211\u672a\u6e96\u5099\u597d\u5440/, /\u518d\u4f01\u4f4e\u5148/, /\u7b49\u6211\u5148/, /\u6211\u518d\u7ad9\u4f4f/, /\u672a\u60f3\u5165/],
    ask_want: [/\u4f60\u60f3\u6211\u9ede/, /\u4f60\u60f3\u8981/, /\u6211\u60f3\u77e5\u4f60\u60f3/, /\u6211\u61c9\u8a72\u9ede/, /\u61c9\u8a72\u505a\u54a9/, /\u800c\u5bb6\u61c9\u8a72/, /\u800c\u5bb6\u9ede\u7b97/, /\u800c\u5bb6\u9ede\u505a/, /\u800c\u5bb6\u505a\u54a9\u597d/, /\u800c\u5bb6\u9ede\u5148/, /\u9ede\u6a23\u5148/, /\u9ede\u5148\u597d/, /\u9ede\u5148\u5f97/, /\u9ede\u884c\u5148/, /\u9ede\u7b97/, /\u9ede\u7b97\u597d/, /\u9ede\u7b97\u5148/, /\u6559\u6211/, /\u6307\u5f15/, /\u6211\u505a\u4e5c/, /\u4f60\u8981\u6211/, /\u4f60\u8981\u6211\u9ede/, /\u8ddf\u4f4f\u505a\u54a9/, /\u8ddf\u4f4f\u9ede/, /\u8ddf\u4f4f\u5462/, /\u4e0b\u4e00\u6b65/, /\u4f60\u60f3\u6211\u505a\u54a9/, /\u60f3\u6211\u505a\u54a9/, /\u4f60\u8a71\u6211\u9ede/, /\u4f60\u8a71\u9ede/, /\u6211\u800c\u5bb6\u505a\u54a9/, /\u6211\u800c\u5bb6\u9ede/, /what do you want/i, /what should i/i, /what now/i, /what next/i, /\u8ddf\u4f4f\u6211\u505a\u54a9/, /\u800c\u5bb6\u6211\u61c9\u8a72\u9ede/, /\u4f60\u60f3\u6211\u9ede\u505a/, /\u9ede\u5148\u5165/, /\u9ede\u6a23\u5165\u53bb/, /\u6211\u8ddf\u4f4f\u9ede\u505a/, /\u8a71\u6211\u77e5\u9ede/, /\u4f60\u60f3\u9ede/, /\u9ede\u5148\u904e\u95dc/, /\u6211\u800c\u5bb6\u505a\u4e5c\u597d/, /\u4f60\u60f3\u6211\u800c\u5bb6\u9ede/, /\u8ddf\u4f4f\u61c9\u8a72\u9ede/, /\u8a71\u6211\u807d\u9ede\u505a/, /\u9ede\u6a23\u5148\u5f97/, /\u4f60\u60f3\u6211\u9ede\u884c/, /\u800c\u5bb6\u9ede\u5148\u597d/, /\u6211\u5514\u77e5\u9ede\u505a/, /\u9ede\u5148\u5572/, /\u4f60\u8a71\u6211\u800c\u5bb6\u9ede/, /\u6211\u8a72\u9ede\u884c/, /\u4f60\u6559\u6211\u9ede/, /\u800c\u5bb6\u8ddf\u4f4f\u9ede/],
    agree: [/^(好|係|係呀|係喎|得|得啦|嗯|繼續|好呀|得喎|ok|okay|yes|y)$/i, /好啊/, /可以/, /同意/, /跟你/, /聽你/, /我跟你/, /係咁/, /就咁/, /得㗎/, /跟住你/, /好啦/, /得嘅/, /我跟/, /聽你講/, /得㗎啦/, /跟你啦/],
    refuse: [/唔入去/, /唔入/, /唔要/, /不要/, /拒絕/, /鎖門/, /關門/, /走先/, /閃/, /唔得/, /算吧/, /算了/, /唔敢入/, /我走/, /離開/, /\bno\b/i, /唔想入去/, /唔想入/, /唔想去/, /我唔入/, /唔想推/, /唔推/, /我唔去/, /我唔想而家入/, /而家唔入/, /而家唔想入/, /而家唔去/, /唔入啦/, /唔入先/, /我唔入先/, /我唔想入去/, /^唔想$/, /唔想啦/, /我唔想推門/, /not going in/i, /我而家唔入/, /唔入去先/, /我閃先/, /我走先啦/, /唔好入/, /我唔推門/, /而家唔推/, /算啦唔入/, /我唔想而家推/, /我而家唔想入/, /算啦我走/],
    apologize: [/對唔住/, /對唔住呀/, /對唔住喎/, /唔好意思/, /唔好意思呀/, /抱歉/, /sorry/i, /道歉/, /我錯/, /原諒/, /我唔好意思/, /sorry呀/i, /對唔住先/, /我道歉/, /sorry喎/i, /唔好意思喎/, /對唔住先啦/],
    flirt: [/靚/, /好靚/, /想錫/, /想親/, /心口/, /你香/, /今晚留/, /想要你/, /可愛/, /sexy/i, /kiss/i, /抱你/, /近啲/, /坐近/, /錫我/, /望住我/, /你好靚/, /想錫你/, /挨近/],
    challenge: [/憑咩/, /唔服/, /頂嘴/, /你錯/, /無理/, /專橫/, /挑戰/, /你以為/, /challenge/i, /你憑乜/, /你管我/, /邊個話/, /你憑咩管/],
    ask_memory: [/記得/, /之前/, /頭先/, /你記/, /memory/i, /記唔記得/, /你記得我/, /記得我講/, /我頭先講/, /我頭先講過/, /記得我頭先/, /頭先講過/, /我講過咩/, /你仲記唔記得/, /記得我話/, /你記得我頭先講咩/, /你記唔記得我頭先/, /記得我想推/, /記得門口/, /你記得我頭先講咽/, /頭先嗰句/, /我頭先話/, /你有冇聽/, /你聽到我講/, /記唔記得我頭先講/, /我頭先話想/, /你仲記唔記得我講/, /你記得我講過/, /頭先我講/, /頭先我話/, /你仲記唔記得我頭先/, /記唔記得門口/, /do you remember/i, /what did i say/i, /你仲記唔記得我想/, /我頭先講過想入/, /你記唔記得我想推門/, /頭先我話想入/, /你記得我話過/, /記唔記得我頭先話/, /你聽到我頭先/, /我頭先講過推/, /記得我頭先話想/, /我頭先講過想推門/, /你記唔記得我話想入/, /頭先我想入/, /你仲記唔記得我想入/, /記得我話想推/, /你有冇聽我頭先/, /頭先嗰句想入/, /你記得我講過推門/, /記唔記得我話過想入/, /我頭先話想推門/, /你記得未/, /頭先講過門/, /你記唔記得門口/, /記得我頭先想入/, /你有冇記住/, /記住我講/, /記住頭先/, /你仲記唔記得我話想入/, /你有冇記住我講/, /你有冇記住我頭先/, /記住未/, /你記得未呀/, /頭先嗰句你聽到/, /你聽到我講門/, /你仲記唔記得我講推門/, /你記唔記得我想開門/, /我頭先話開門/, /你記得我想開門/, /記唔記得我想開門/, /有冇記住我頭先/, /你聽到未/, /頭先嗰句聽到未/, /記低/, /有冇記低/, /記低未/, /你有冇記低/, /記低我講/, /你記低未/, /有冇記低我頭先/, /頭先同你講/, /我頭先同你講/, /頭先同你講過/, /你記得我頭先同你講/, /頭先同你講開門/, /有冇記低我講/, /記低我頭先/, /你記低我講未/, /有円記低/, /有冇記低頭先/, /記低未呀/, /頭先同你講過門/, /記低我想開門/, /你有円記低/, /記低我頭先講/, /頭先同你講想入/, /聽低/, /寫低/, /聽低未/, /寫低未/, /你有冇聽低/, /你有冇寫低/, /聽低我講/, /寫低我講/, /聽低咋未/, /寫低咋未/, /記低咋未/, /你聽低未/, /你寫低未/, /頭先你聽低/, /寫低嗰句/, /你有冇寫低頭先/, /聽低我頭先/, /寫低我頭先/, /有冇聽低我講/, /有冇寫低我講/, /你聽低未呀/, /你寫低未呀/],
    off_topic: [/天氣/, /幾多度/, /落雨未/, /食咗/, /午餐/, /晚餐/, /足球/, /遊戲/, /chatgpt/i, /人工智能/, /機械人/, /你係咪機械/, /\bai\b/i, /薪水/, /落雨/, /食飯未/, /你係咪ai/i, /你係咪 AI/i, /你係咪程式/i, /你係程式/i, /今日幾多度/, /\bgpt\b/i, /幾點鐘/, /星期幾/, /股市/, /比特幣/, /你幾歲/, /而家幾點/, /今日星期/, /食咗飯未/, /落雨未呀/, /你係咪機械人/, /你係咪bot/i, /今日熱唔熱/, /而家幾多度/, /你鍾意邊隊/, /而家落雨未/, /食咗未呀/]
  };
  var SOFT_LEXICON = {
    enter_door: ["推門","開門","入去","入嚟","進去","進入","行入","開門啦","開門吖","開門喎","我入","入去先","進去看","入去啦","開門先","行入去","推開條門","入去睇下","行過去","去入面","入去睇一睇","推吓門","入去望吓","行入去先","我哋入","一齊入","推門入","門嗰邊","踏入去","開門先啦","入去先至講","我推條門","行入去睇吓","開條門","我去開門"],
    wait: ["等等","停","猶豫","停低","等陣","未準備","再諗","諗吓","等等先","諗一諗","等陣先","再諸","諸吓","等一吓","未想好","再睇吓","遲啲先","未諗好","停一停先","唔好急","慢啲先","畀我諗","再企一陣","遲啲入","未得咁快","諳吓","諳清楚","我要諳","等我一陣","再企低先","未想入","等我先"],
    refuse: ["唔入","走先","閃","關門","離開","我走","唔想入","唔推","我唔入","唔想","我唔想推門","唔入去","而家唔想入","而家唔去","唔入啦","我唔想入去","我閃先","唔好入","而家唔推","算啦我走"],
    agree: ["好","係","繼續","得","ok","yes","好啦","得㗎啦"],
    flirt: ["近啲","坐近","想要你","錫我","挨近"],
    ask_want: ["你想","點做","指引","教我","應該點","想我點","應該做咩","而家應該","點行先","跟住點","點算好","你話我點","你要我點","跟住呢","我而家點","跟住我做咩","而家我應該點","話我知點","點先入","點先啱","我唔知點做","而家跟住點"],
    apologize: ["對唔住","唔好意思","抱歉","sorry","對唔住喎","對唔住先"],
    off_topic: ["天氣","食飯","足球","chatgpt","ai","程式","幾多度","落雨","幾點鐘","星期幾","股市","熱唔熱","機械人"],
    ask_memory: ["記得","頭先","記唔記得","我講過","頭先講咩","我頭先講過","頭先嗰句","我頭先話","你有冇聽","記得我講過","頭先我話","記唔記得門口","頭先我話想入","記得我話過","聽到我頭先","頭先講過想入","記得我想推門","記住我講","記住頭先","頭先想入","記得我話想推","有冇記住","你有冇記住我講","記住未","你記得未呀","你記唔記得我想開門","我頭先話開門","有冇記住我頭先","頭先嗰句你聽到","記低","有冇記低","記低未","頭先同你講","我頭先同你講","有円記低","你有冇記低","記低我講","頭先同你講過","聽低","寫低","聽低未","寫低未","聽低咋未","寫低咋未","記低咋未","你有冇聽低","你有冇寫低","聽低我講","寫低我講"]
  };
  var KEY_SYNONYMS = {
    enter_door: ["推門","開門","入去","進去","推","入"],
    wait: ["停","猶豫","等等","停低","未準備","諗"],
    refuse: ["唔入","走","閃","關門"],
    agree: ["好","係","繼續","得"],
    flirt: ["近","坐近"],
    ask_want: ["想","點","指引","教","應該"],
    apologize: ["對唔住","抱歉","sorry"],
    ask_memory: ["記得","頭先","記住","記低","同你講","聽低","寫低"]
  };
  var ACCEPTANCE_SOFT = [
    {text:"開門啦",intent:"enter_door"},{text:"入去未",intent:"enter_door"},{text:"我行入辦公室",intent:"enter_door"},
    {text:"進去看看",intent:"enter_door"},{text:"我入去先",intent:"enter_door"},{text:"行入佢間房",intent:"enter_door"},
    {text:"等等",intent:"wait"},{text:"我未準備好",intent:"wait"},{text:"推門",intent:"enter_door"},{text:"停一停",intent:"wait"},
    {text:"我而家應該做咩",intent:"ask_want"},{text:"你係咪 AI",intent:"off_topic"},{text:"而家點算",intent:"ask_want"},
    {text:"我跟住做咩",intent:"ask_want"},{text:"我哋入去",intent:"enter_door"},{text:"我行過去先",intent:"enter_door"},
    {text:"我要諗吓",intent:"wait"},{text:"我唔想而家入",intent:"refuse"},{text:"你記唔記得我話想入",intent:"ask_memory"},
    {text:"開門吖",intent:"enter_door"},{text:"唔想",intent:"refuse"},{text:"點行先",intent:"ask_want"},{text:"今日幾多度",intent:"off_topic"},
    {text:"你記得我頭先講咩",intent:"ask_memory"},{text:"開門喎",intent:"enter_door"},{text:"等等先",intent:"wait"},
    {text:"我要諗一諗",intent:"wait"},{text:"我唔想推門",intent:"refuse"},
    {text:"入去睇吓",intent:"enter_door"},{text:"開門先",intent:"enter_door"},{text:"等陣先",intent:"wait"},
    {text:"而家做咩好",intent:"ask_want"},{text:"我唔入去啦",intent:"refuse"},{text:"對唔住喎",intent:"apologize"},
    {text:"落雨未",intent:"off_topic"},{text:"你記唔記得我頭先",intent:"ask_memory"},{text:"你記得我頭先講咽",intent:"ask_memory"},{text:"頭先嗰句",intent:"ask_memory"},{text:"你記得我頭先話想推",intent:"ask_memory"},{text:"你有冇聽我講",intent:"ask_memory"},
    {text:"推開條門",intent:"enter_door"},{text:"入去睇下",intent:"enter_door"},{text:"行過去",intent:"enter_door"},
    {text:"未想好",intent:"wait"},{text:"等一吓",intent:"wait"},{text:"你要我點",intent:"ask_want"},
    {text:"跟住呢",intent:"ask_want"},{text:"而家唔去",intent:"refuse"},
    {text:"頭先我話",intent:"ask_memory"},{text:"而家幾點",intent:"off_topic"},
    {text:"入去睇一睇",intent:"enter_door"},{text:"推吓門",intent:"enter_door"},{text:"我入去望吓",intent:"enter_door"},
    {text:"我未諗好",intent:"wait"},{text:"停一停先",intent:"wait"},{text:"唔好急",intent:"wait"},
    {text:"而家我應該點",intent:"ask_want"},{text:"話我知點",intent:"ask_want"},
    {text:"你記唔記得我想推門",intent:"ask_memory"},{text:"頭先我話想入",intent:"ask_memory"},{text:"你記得我話過",intent:"ask_memory"},
    {text:"我頭先講過想推門",intent:"ask_memory"},{text:"你記唔記得我話想入",intent:"ask_memory"},
    {text:"畀我諗吓",intent:"wait"},{text:"我閃先",intent:"refuse"},
    {text:"一齊入",intent:"enter_door"},{text:"我唔知點做",intent:"ask_want"},
    {text:"你有冇記住",intent:"ask_memory"},{text:"今日熱唔熱",intent:"off_topic"},{text:"你有冇記住我講",intent:"ask_memory"},{text:"你記得未呀",intent:"ask_memory"},{text:"你記唔記得我想開門",intent:"ask_memory"},{text:"我頭先話開門",intent:"ask_memory"},{text:"我要諳吓",intent:"wait"},{text:"頭先嗰句你聽到未",intent:"ask_memory"},{text:"記低",intent:"ask_memory"},{text:"頭先同你講",intent:"ask_memory"},{text:"有円記低",intent:"ask_memory"},{text:"你有冇記低",intent:"ask_memory"},{text:"我頭先同你講",intent:"ask_memory"},
    {text:"聽低未",intent:"ask_memory"},{text:"寫低未",intent:"ask_memory"},{text:"你有冇聽低",intent:"ask_memory"},{text:"聽低咋未",intent:"ask_memory"},{text:"寫低咋未",intent:"ask_memory"},{text:"開門先啦",intent:"enter_door"},{text:"我推條門",intent:"enter_door"},{text:"等我一陣",intent:"wait"}
  ];
  var api = {INTENTS:INTENTS,PATTERNS:PATTERNS,SOFT_LEXICON:SOFT_LEXICON,KEY_SYNONYMS:KEY_SYNONYMS,ACCEPTANCE_SOFT:ACCEPTANCE_SOFT,version:"split1q"};
  global.IntentPatterns = api;
  global.INTENT_PATTERNS = api;
})(typeof window !== "undefined" ? window : globalThis);
