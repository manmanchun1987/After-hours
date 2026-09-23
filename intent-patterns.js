/**
 * IntentPatterns (split1af) — Lane A. Soft-pass lexicon + regex. No exact-key gate.
 * T2 thicken: memory 口語（有冇記低我講／覆述俾我聽／講返頭先喪句／聽低咋未／記低咋未呀／你記唔記得頭先）
 * enter／wait／ask_want 加口語同義＋錯字柔軟過關
 */
(function (global) {
  "use strict";
  var INTENTS = ["ask_want","agree","refuse","enter_door","wait","apologize","flirt","challenge","ask_memory","off_topic","unclear"];
  var PATTERNS = {
    enter_door: [
      /推門/, /開門/, /入去/, /進去/, /推門啦/, /我入去/, /入去先/, /進去看看/,
      /行入/, /推門啦/, /go inside/i, /enter/i,
      /開門先/, /推開/, /行入去/, /入去睇下/, /入去睇吓/, /入去啦/, /推開扇門/,
      /開門啦/, /推門先/, /入去看看/,
      /我行入去/, /打開門/, /推開佢/, /入去先啦/, /開門吧/, /入去吓/,
      /我入去先啦/, /推開道門/, /行入去先/, /開門咯/, /入去咯/
    ],
    wait: [
      /等等/, /停一停/, /停低/, /未準備/, /我未準備好/, /諸吓/, /諳吓/,
      /hold on/i, /wait/i,
      /等陣/, /等一下/, /等一等/, /慢啲/, /唔好急/, /等我一陣/, /稍等/, /等我先/,
      /等陣先/, /等我一陣先/, /唔急/, /先停一停/, /等陣啦/, /停一停先/, /等陣吧/
    ],
    ask_want: [
      /你想我點/, /我而家應該做咩/, /應該做咩/, /你想我點樣/, /what now/i,
      /而家點/, /我該點/, /下一步/, /點算/, /你要我做咩/, /而家應該點/, /我而家點/,
      /你想點/, /我做咩好/, /而家做咩/, /點先得/, /而家做乜/, /我跟住做咩/, /你叫我做咩/
    ],
    agree: [/^(?:好|係|ok|yes|得)$/i],
    refuse: [/唔入/, /我唔入/, /唔想推門/, /我唔想/, /\bno\b/i, /唔得/, /我唔去/, /唔想入/, /我唔想入去/, /唔開門/, /我企喎度/],
    apologize: [/對唔住/, /對唔住呀/, /sorry/i],
    flirt: [/靚/, /好靚/],
    challenge: [/憑咩/, /你憑咩/],
    ask_memory: [
      /記得/, /你記得/, /你記得我頭先講咩/, /頭先講咩/, /頭先講/,
      /講返出嚕/, /講返/, /記住咋未/, /記住未/, /有冇記住/, /有冇記得/,
      /有冇記低/, /記低未/, /記低咋未/, /記低哉未/, /聽低未/, /寫低未/,
      /抄低未/, /抄低/, /複述吓/, /複述一次/, /重講一次/, /聽到未呀/,
      /有冇記住/, /講過未/, /我頭先話/, /你記唔記得/, /記唔記得我想開門/,
      /講過有未/, /講過冇/, /頭先講過/, /聽低咯未/, /寫低咯未/,
      /抄低咯未/, /複述返/, /講返一遍/, /你有冇聽低/, /有冇聽低/,
      /你有冇寫低/, /記唔記得我頭先/, /頭先咁講/,
      /有冇抄低/, /頭先喪句/, /你聽清楚未/, /聽清楚未/, /講多次/,
      /重複一次/, /你聽到我講咩/, /記唔記我頭先講/, /頭先喪句講咩/,
      /你有冇聽清楚/, /複述多次/, /講多次俾我聽/,
      /聽住未/, /有冇聽住/, /你有冇聽住/, /記著未/, /有冇記著/, /你記著未/,
      /記着未/, /有冇記着/, /你記着未/,
      /覆述吓/, /覆述一次/, /你聽到未/, /聽到未/, /頭先我講/, /講過畏你聽未/,
      /聽清楚咁未/, /寫低咁未/, /記低咁未/, /你記唔記/, /有冇聽住我講/,
      /聽住未呀/, /有冇記着我講/, /你有冇記着我講/, /覆述一遍/,
      /你聽到我頭先未/, /聽到我頭先未/, /記低咑未/, /記低咑未呀/,
      /頭先喪啲你記得未/, /講返一次未/, /聽低咑未/, /聽低咑未呀/,
      /記唔記得我講過/, /你有冇聽低我講/, /有冇覆述/, /你覆述未/,
      /記住未呀/, /有冇聽低咑/, /講返俾我聽未/, /你記低未呀/,
      /頭先喪句記未/, /覆述返一次未/, /聽到我講未呀/, /記著咑未/,
      /記着咑未/, /有冇記住呀/, /你記住未呀/,
      /有冇記低我講/, /你有冇記住我頭先/, /覆述俾我聽/, /講返頭先喪句/,
      /聽低咋未/, /記低咋未呀/, /你記唔記得頭先/, /有冇聽低我頭先講/,
      /頭先喪句你記得未/, /講返俾我聽吓/,
      /記低晒未/, /記低晒未呀/, /聽晒未呀/, /有冇聽晒/,
      /你有冇聽返/, /有冇聽返/, /聽返頭先未/, /聽返頭先/,
      /覆述過未/, /有冇覆述過/, /講返頭先嗰句/, /頭先嗰句/,
      /你有冇抄低我講/, /有冇抄低我講/, /記晒未呀/, /有冇記晒/
    ],
    off_topic: [/天氣/, /今日天氣/, /chatgpt/i, /你係咪 AI/, /你係咪程式/, /落雨/, /幾多度/, /openai/i, /chatbot/i, /而家幾點/, /幾點鐘/, /食咋飯未/]
  };
  var SOFT_LEXICON = {
    enter_door: ["開門", "入去", "推門", "進去", "入去先", "開門先", "推開", "入去睇下", "打開門", "開門吧", "入去咯"],
    wait: ["等等", "停低", "未準備", "諳吓", "等陣", "慢啲", "稍等", "等陣先", "唔急"],
    refuse: ["唔入", "唔想推", "唔得", "唔想入", "唔開門"],
    agree: ["好", "得", "ok"],
    flirt: ["靚"],
    ask_want: ["你想", "應該做", "而家點", "下一步", "點算", "做咩好", "而家做咩"],
    apologize: ["sorry", "對唔住"],
    off_topic: ["天氣", "chatgpt", "AI", "落雨", "幾點"],
    ask_memory: ["記得", "講返", "記低", "聽低", "寫低", "抄低", "複述", "頭先講", "講過未", "記住", "講過有未", "複述返", "記唔記得", "聽清楚", "頭先喪句", "講多次", "聽住", "記著", "記着", "覆述", "你聽到未", "記低咑", "覆述一遍", "講返一次", "記住未呀", "聽低咑", "講返俾我聽", "記著咑", "記低咋", "聽低咋", "覆述俾我聽", "記低晒", "聽晒未", "聽返頭先", "覆述過未", "頭先嗰句", "記晒未"]
  };
  var KEY_SYNONYMS = {
    enter_door: ["開門", "入去", "推門", "推開", "打開門"],
    wait: ["等等", "停", "等陣", "唔急"],
    refuse: ["唔入", "唔開門"],
    agree: ["好"],
    flirt: ["靚"],
    ask_want: ["想", "應該", "而家點", "做咩"],
    apologize: ["sorry"],
    ask_memory: ["記得", "講返", "記低", "頭先", "記唔記得", "聽清楚", "複述", "聽住", "記著", "記着", "覆述", "記低咑", "覆述一遍", "記住未呀", "聽低咑", "記著咑", "記低咋", "聽低咋", "記低晒", "聽晒", "聽返", "覆述過", "頭先嗰句", "記晒"]
  };
  var ACCEPTANCE_SOFT = [
    {text:"開門啦",intent:"enter_door"},
    {text:"我入去先",intent:"enter_door"},
    {text:"進去看看",intent:"enter_door"},
    {text:"開門先",intent:"enter_door"},
    {text:"入去睇下",intent:"enter_door"},
    {text:"打開門",intent:"enter_door"},
    {text:"開門吧",intent:"enter_door"},
    {text:"等等",intent:"wait"},
    {text:"我未準備好",intent:"wait"},
    {text:"等陣",intent:"wait"},
    {text:"等陣先",intent:"wait"},
    {text:"你想我點？",intent:"ask_want"},
    {text:"而家點",intent:"ask_want"},
    {text:"我做咩好",intent:"ask_want"},
    {text:"今日天氣點呀",intent:"off_topic"},
    {text:"講返出嚕",intent:"ask_memory"},
    {text:"你記得我頭先講咩",intent:"ask_memory"},
    {text:"記低未",intent:"ask_memory"},
    {text:"講過未",intent:"ask_memory"},
    {text:"我頭先話開門",intent:"ask_memory"},
    {text:"講過有未",intent:"ask_memory"},
    {text:"聽低咯未",intent:"ask_memory"},
    {text:"複述返",intent:"ask_memory"},
    {text:"你聽清楚未",intent:"ask_memory"},
    {text:"頭先喪句",intent:"ask_memory"},
    {text:"聽住未",intent:"ask_memory"},
    {text:"記著未",intent:"ask_memory"},
    {text:"記着未",intent:"ask_memory"},
    {text:"覆述吓",intent:"ask_memory"},
    {text:"你聽到未",intent:"ask_memory"},
    {text:"頭先我講",intent:"ask_memory"},
    {text:"聽住未呀",intent:"ask_memory"},
    {text:"記低咑未",intent:"ask_memory"},
    {text:"覆述一遍",intent:"ask_memory"},
    {text:"你聽到我頭先未",intent:"ask_memory"},
    {text:"講返一次未",intent:"ask_memory"},
    {text:"聽低咑未呀",intent:"ask_memory"},
    {text:"記住未呀",intent:"ask_memory"},
    {text:"有冇聽低咑",intent:"ask_memory"},
    {text:"講返俾我聽未",intent:"ask_memory"},
    {text:"你記低未呀",intent:"ask_memory"},
    {text:"頭先喪句記未",intent:"ask_memory"},
    {text:"覆述返一次未",intent:"ask_memory"},
    {text:"聽到我講未呀",intent:"ask_memory"},
    {text:"記著咑未",intent:"ask_memory"},
    {text:"有冇記低我講",intent:"ask_memory"},
    {text:"覆述俾我聽",intent:"ask_memory"},
    {text:"講返頭先喪句",intent:"ask_memory"},
    {text:"聽低咋未",intent:"ask_memory"},
    {text:"記低咋未呀",intent:"ask_memory"},
    {text:"你記唔記得頭先",intent:"ask_memory"},
    {text:"記低晒未",intent:"ask_memory"},
    {text:"聽晒未呀",intent:"ask_memory"},
    {text:"你有冇聽返",intent:"ask_memory"},
    {text:"覆述過未",intent:"ask_memory"},
    {text:"講返頭先嗰句",intent:"ask_memory"},
    {text:"你有冇抄低我講",intent:"ask_memory"},
    {text:"聽返頭先未",intent:"ask_memory"},
    {text:"記晒未呀",intent:"ask_memory"}
  ];
  var api = {INTENTS:INTENTS,PATTERNS:PATTERNS,SOFT_LEXICON:SOFT_LEXICON,KEY_SYNONYMS:KEY_SYNONYMS,ACCEPTANCE_SOFT:ACCEPTANCE_SOFT,version:"split1af"};
  global.IntentPatterns = api;
  global.INTENT_PATTERNS = api;
})(typeof window !== "undefined" ? window : globalThis);
