/**
 * IntentPatterns (split1cp) — Lane A. Soft-pass lexicon + regex. No exact-key gate.
 * T2 thicken split1cp: +我踩過門檻入去／我溜入間房先／側身挨入門口; +等我抖順條氣先／你俾我企定先／我未諗清楚先; +你想我點先算呀／而家我應該點先; +頭先我話嗰句你仲記唔記得／我頭先講過嗰句你有冇印象; +出面黑唔黑呀／聽日會唔會好熱; 錯字開問啦／入去先丫
 */
(function (global) {
  "use strict";
  var INTENTS = ["ask_want","agree","refuse","enter_door","wait","apologize","flirt","challenge","ask_memory","off_topic","unclear"];
  var PATTERNS = {
    enter_door: [
      /推門/, /開門/, /入去/, /進去/, /推門啦/, /我入去/, /入去先/, /進去看看/,
      /行入/, /go inside/i, /enter/i,
      /開門先/, /推開/, /行入去/, /入去啦/, /開門啦/, /推門先/,
      /我行入去/, /打開門/, /推開佢/, /入去先啦/, /開門吧/,
      /推門入去/, /我推門/, /開門入去/, /扭開門/, /把門扭開/, /扭門入去/, /我去扭門/,
      /門把扭一下/, /扭門把入/, /手扭門把/, /手握把一轉/, /把一轉/, /轉把入/,
      /門把一扭入/, /扭把推入/, /手按把一推/, /把門輕輕推/,
      /輕輕推門入/, /輕輕扭把入/, /手按門把一扭/,
      /手輕輕扭把入/, /輕輕扭門把入/, /手握把輕輕推/, /把輕輕一扭入/, /門把輕輕一推入/,
      /手輕輕推門把入/, /把一擷輕輕入/, /門把輕輕扭推入/, /輕輕一擷門把入/, /把一掛輕輕入/, /輕輕一掛門把入/,
      /幫我開門/, /門打開/, /入屋先/, /推佢入去/, /掛門把入/, /行過去開門/, /手按把推入/, /過啲度入/,
      /我過去開門/, /去開門先/, /幫你推門/, /門界我開/, /我去開門/,
      /我去推門/, /幫你開門/, /門我四開/, /入去着下/, /過四開門/, /去推門先/, /開門喃/, /推門吕/,
      /我行過去推門/, /等我去開門/, /門我開啦/, /行前開門/, /過四推門/, /我行前開門/,
      /我去開門啦/, /我四開門/, /門由我開/, /行過去入/, /我行過去入/, /過四入去/,
      /等我推門先/, /我嘈開門/, /門我嘈開/, /行埋去入/, /我行埋去開門/, /過嘈入先/,
      /我幫你推門先/, /等我扭開門先/, /行埋去推/, /我入去着先/, /過嘈開門/,
      /我幫你扭門/, /行埋去開門先/, /門我幫你推/, /過嘈推門先/,
      /等我擴門把先/, /我擴把入去/, /行前擴門/, /門把我擴/,
      /我撚門把入去/, /撚把推門先/, /門把我撚開/, /撚門入去/,
      /我去撚門入/, /撚門把推入先/, /手撚把入去/, /門把撚一下入/,
      /我去推把入/, /推門把入去先/, /手推把入去/, /門把推一下入/,
      /我行埋去推把入/, /推把入去先啦/, /門把我推開入/, /行埋去推把先/,
      /我行前去推把入/, /手推把入去先啦/, /行前推把入去/, /門把我手推入/,
      /我行埋前去推把入/, /手一推把入去先啦/, /行埋前推把入去/, /門把我一推入/,
      /我行埋前去一推把入/, /手一擷把入去先啦/, /行埋前去一扭把入/, /門把我一擷入/,
      /我行埋前去擷把一推入/, /手擷把一推入去先啦/, /行埋前去擷把入/, /門把我擷一推入/,
      /我去撳個門把先/, /撳把推入去/, /幫我推開嗰度門/, /我撳門把入去/,
      /我跨過門檻先/, /我鑽入房先/, /行埋門口挨入去/, /我挨入房先/, /我閃入去先/, /我側身鑽入/, /門縫擠入去/, /我推開條縫入/, /手扳開條門縫/, /挨實門縫鑽入/, /開們啦/, /我入去先呀/, /我踩過門檻入去/, /我溜入間房先/, /側身挨入門口/, /我推開條門縫入先/, /開問啦/, /入去先丫/
    ],
    wait: [
      /等等/, /停一停/, /停低/, /未準備/, /我未準備好/, /hold on/i, /wait/i,
      /等陣/, /等一下/, /等一等/, /慢啲/, /唔好急/, /等我一陣/, /稍等/, /等我先/,
      /等我唾吓氣先/, /唔好催住先/, /我要唾吓氣先/, /慢啲唔好趕我/,
      /等我唾多兩秒/, /等我唾吓先/, /唔好迫住我/, /等陣唔好趕/, /慢住先唔好迫/,
      /等我唾多陣/, /俾我唾一陣先/, /唔好趕住先/, /俾我唾吓先/,
      /唔好催我住先/, /等我唾一唾先/,
      /等我喎多吓先/, /唔好迫我住先/, /等我喎一喎先/, /唔好趕我住先/,
      /等我喎多陣先/, /唔好催住我先/, /俾我喎吓先/, /等我喎一陣先/,
      /等我唾多陣先/, /唔好趕住我先/, /俾我唾吓先/, /等我唾一陣先/,
      /等我唾多吓先/, /唔好趕住我住先/, /俾我唾多吓先/, /等我唾一唾先/,
      /等我唾多吓先/, /唔好催住我住先/, /俾我唾一陣先/, /等我唾一唾先/,
      /等我喎多兩吓先/, /唔好催住我喎先/, /俾我喎多兩吓先/, /等我喎一喎先/,
      /等一等我未定/, /唔好迫得咁緊/, /俾啲時間我先/, /我未定好先/,
      /我企定先/, /我唞多陣先/, /未諗定點做好/, /你等我埋位先/, /等我定定神先/, /我仲未穩陣/, /唔好逼到我貼牆/, /等我攝多啖氣先/, /我未企穩先/, /等我抖順條氣先/, /你俾我企定先/, /我未諗清楚先/, /等我定過神先/, /我仲未企穩呀/
    ],
    ask_want: [
      /你想我點/, /而家點/, /下一步/, /跟住點/, /what now/i,
      /你想我點做好先呀/, /究竟跟住點/, /你究竟要我點先/,
      /你到底要我點做好/, /跟住究竟點先/, /你而家想我點樣/,
      /你到底想我點做好呀/, /而家究竟要我點/,
      /你究竟想我點做好先/, /而家要我點做先呀/,
      /你而家究竟想我點/, /而家究竟想我點做好/,
      /你而家到底想我點先/, /而家到底要我點做好/,
      /你而家到底想我點做好先/, /而家到底想我點做好先/,
      /你而家到底想我點做好呀先/, /而家到底想我點做好呀/,
      /你而家到底想我點樣做好呀先/, /而家到底想我點做好先呀/,
      /你而家到底想我點樣先做好呀/, /而家到底想我點樣做好呀先/,
      /你想點先啦/, /跟住我應該做乜/, /你要我做乜先/,
      /我應該點做好先/, /你要我點呀先/, /咁我而家點算好/, /你想我點算呀/, /咁而家叫我做咩/, /你話事定我話事/, /我應該點算先/, /你想我點先算呀/, /而家我應該點先/, /你話我點做好先/, /咁我跟住點算呀/
    ],
    agree: [/^(?:好|係|ok|yes|得)$/i],
    refuse: [/唔入/, /我唔入/, /唔想推門/, /我唔想/, /\bno\b/i, /唔得/, /唔想入/, /唔開門/, /我唔推/, /唔好入/],
    apologize: [/對唔住/, /sorry/i],
    flirt: [/你塊面/, /望實你面/, /近我塊面/],
    challenge: [/憑呀/],
    ask_memory: [
      /記得/, /你記得/, /你記得我頭先講呀/, /頭先講/,
      /你記唔記得我頭先講過啲乜/, /頭先嗎句我講啱嘈/, /頭先嗎句講過乜/,
      /頭先嗎句你仲記唔記/, /我頭先講嗎句重記得未/,
      /頭先嗎句你記唔記得呀/, /你重記唔記得頭先/,
      /頭先我講嗎句你仲記唔記得/, /你記唔記得我頭先講啱/,
      /頭先講嗎句你記唔記得/, /頭先嗎句你仲記唔記得呀/,
      /頭先嗎句你重記唔記得/, /你重記唔記得頭先嗎句/,
      /頭先嗎句你重記唔記得呀/, /你重記唔記得頭先嗎句呀/,
      /頭先嗎句你重記唔記得未呀/, /你重記唔記得未頭先嗎句/,
      /頭先嗰句你重記唔記得未呀/, /你重記唔記得未呀頭先嗰句/,
      /頭先嗰句你重記唔記得住未呀/, /你重記唔記得住未呀頭先嗰句/,
      /我頭先講過你仲記得嘛/, /你有冇聽過我頭先/, /你聽住我頭先講嘛/,
      /你仲知唔知我頭先講咩/, /頭先句說話你有冇印象/, /我頭先講咩你仲知/, /頭先我講嗰句你有冇留低/, /你仲有冇記得我頭先話/, /頭先句你仲喺唔喺度/, /頭先我話嗰句你仲記唔記得/, /我頭先講過嗰句你有冇印象/, /你仲記唔記得我頭先嗰句/, /頭先句說話你仲有冇印象呀/
    ],
    off_topic: [/天氣/, /今日天氣/, /chatgpt/i, /你係咪 AI/, /落雨/, /openai/i, /chatbot/i, /而家幾點/, /而家幾點鐘喃/, /而家幾點呀喂/, /出面凍到震未/, /而家幾點鐘呀喂/, /而家幾點鐘呀/, /落唔落雨呀/, /出面有冇落雨/, /出面凍唔凍呀/, /出面而家落雨未/, /出面而家凍唔凍/, /出面而家有冇落雨/, /出面而家凍到震未/, /出面而家有冇落雨呀/, /出面而家落唔落雨/, /出面而家落唔落雨呀/, /出面而家有冇落緊雨/, /出面而家落緊雨未呀/, /出面而家有冇落緊雨呀/, /出面熱唔熱呀/, /而家幾點鐘啦/, /出面熱唔熱/, /出面好暗呀/, /聽日會唔會打風/, /而家係咪通宵/, /出面係咪起霧/, /而家幾點幾呀/, /聽晚會唔會落雨/, /出面好靜呀/, /出面黑唔黑呀/, /聽日會唔會好熱/, /出面係咪落雨呀/, /而家係咪好夜呀/]
  };
  var api = {INTENTS:INTENTS,PATTERNS:PATTERNS,SOFT_LEXICON:{},KEY_SYNONYMS:{},ACCEPTANCE_SOFT:[{text:"開門啦",intent:"enter_door"},{text:"我入去先",intent:"enter_door"},{text:"進去看看",intent:"enter_door"},{text:"等等",intent:"wait"},{text:"我未準備好",intent:"wait"},{text:"你想我點？",intent:"ask_want"},{text:"今日天氣點呀",intent:"off_topic"},{text:"你記得我頭先講呀",intent:"ask_memory"},{text:"推門",intent:"enter_door"},{text:"停一停",intent:"wait"},{text:"我幫你扭門",intent:"enter_door"},{text:"行埋去開門先",intent:"enter_door"},{text:"等我唾吓先",intent:"wait"},{text:"唔好迫住我",intent:"wait"},{text:"你想我點做好先呀",intent:"ask_want"},{text:"頭先嗎句我講啱嘈",intent:"ask_memory"},{text:"而家幾點鐘喃",intent:"off_topic"},{text:"等我擴門把先",intent:"enter_door"},{text:"等我唾多兩秒",intent:"wait"},{text:"你到底要我點做好",intent:"ask_want"},{text:"頭先嗎句你仲記唔記",intent:"ask_memory"},{text:"而家幾點呀喂",intent:"off_topic"},{text:"我撚門把入去",intent:"enter_door"},{text:"撚把推門先",intent:"enter_door"},{text:"等我唾多陣",intent:"wait"},{text:"俾我唾一陣先",intent:"wait"},{text:"你到底想我點做好呀",intent:"ask_want"},{text:"頭先嗎句你記唔記得呀",intent:"ask_memory"},{text:"而家幾點鐘呀喂",intent:"off_topic"},{text:"我去撚門入",intent:"enter_door"},{text:"撚門把推入先",intent:"enter_door"},{text:"等我唾一唾先",intent:"wait"},{text:"唔好催我住先",intent:"wait"},{text:"你究竟想我點做好先",intent:"ask_want"},{text:"頭先我講嗎句你仲記唔記得",intent:"ask_memory"},{text:"落唔落雨呀",intent:"off_topic"},{text:"我去推把入",intent:"enter_door"},{text:"推門把入去先",intent:"enter_door"},{text:"等我喎多吓先",intent:"wait"},{text:"唔好迫我住先",intent:"wait"},{text:"你而家究竟想我點",intent:"ask_want"},{text:"頭先講嗎句你記唔記得",intent:"ask_memory"},{text:"出面有冇落雨",intent:"off_topic"},{text:"我行埋去推把入",intent:"enter_door"},{text:"推把入去先啦",intent:"enter_door"},{text:"等我喎多陣先",intent:"wait"},{text:"唔好催住我先",intent:"wait"},{text:"你而家到底想我點先",intent:"ask_want"},{text:"頭先嗎句你重記唔記得",intent:"ask_memory"},{text:"出面而家落雨未",intent:"off_topic"},{text:"我行前去推把入",intent:"enter_door"},{text:"手推把入去先啦",intent:"enter_door"},{text:"等我唾多陣先",intent:"wait"},{text:"唔好趕住我先",intent:"wait"},{text:"你而家到底想我點做好先",intent:"ask_want"},{text:"頭先嗎句你重記唔記得呀",intent:"ask_memory"},{text:"出面而家有冇落雨",intent:"off_topic"},{text:"我行埋前去推把入",intent:"enter_door"},{text:"手一推把入去先啦",intent:"enter_door"},{text:"等我唾多吓先",intent:"wait"},{text:"唔好趕住我住先",intent:"wait"},{text:"你而家到底想我點做好呀先",intent:"ask_want"},{text:"頭先嗎句你重記唔記得未呀",intent:"ask_memory"},{text:"出面而家有冇落雨呀",intent:"off_topic"},{text:"我行埋前去一推把入",intent:"enter_door"},{text:"手一擷把入去先啦",intent:"enter_door"},{text:"等我唾多吓先",intent:"wait"},{text:"唔好催住我住先",intent:"wait"},{text:"你而家到底想我點樣做好呀先",intent:"ask_want"},{text:"頭先嗰句你重記唔記得未呀",intent:"ask_memory"},{text:"出面而家落唔落雨呀",intent:"off_topic"},{text:"我行埋前去擷把一推入",intent:"enter_door"},{text:"手擷把一推入去先啦",intent:"enter_door"},{text:"等我喎多兩吓先",intent:"wait"},{text:"唔好催住我喎先",intent:"wait"},{text:"你而家到底想我點樣先做好呀",intent:"ask_want"},{text:"頭先嗰句你重記唔記得住未呀",intent:"ask_memory"},{text:"出面而家落緊雨未呀",intent:"off_topic"},{text:"我去撳個門把先",intent:"enter_door"},{text:"撳把推入去",intent:"enter_door"},{text:"幫我推開嗰度門",intent:"enter_door"},{text:"等一等我未定",intent:"wait"},{text:"唔好迫得咁緊",intent:"wait"},{text:"你想點先啦",intent:"ask_want"},{text:"我頭先講過你仲記得嘛",intent:"ask_memory"},{text:"出面熱唔熱呀",intent:"off_topic"},{text:"我跨過門檻先",intent:"enter_door"},{text:"我鑽入房先",intent:"enter_door"},{text:"行埋門口挨入去",intent:"enter_door"},{text:"我企定先",intent:"wait"},{text:"我唞多陣先",intent:"wait"},{text:"未諗定點做好",intent:"wait"},{text:"我應該點做好先",intent:"ask_want"},{text:"你要我點呀先",intent:"ask_want"},{text:"你仲知唔知我頭先講咩",intent:"ask_memory"},{text:"頭先句說話你有冇印象",intent:"ask_memory"},{text:"出面好暗呀",intent:"off_topic"},{text:"聽日會唔會打風",intent:"off_topic"},{text:"我閃入去先",intent:"enter_door"},{text:"門縫擠入去",intent:"enter_door"},{text:"手扳開條門縫",intent:"enter_door"},{text:"開們啦",intent:"enter_door"},{text:"等我定定神先",intent:"wait"},{text:"我仲未穩陣",intent:"wait"},{text:"等我攝多啖氣先",intent:"wait"},{text:"你想我點算呀",intent:"ask_want"},{text:"咁而家叫我做咩",intent:"ask_want"},{text:"頭先我講嗰句你有冇留低",intent:"ask_memory"},{text:"你仲有冇記得我頭先話",intent:"ask_memory"},{text:"出面係咪起霧",intent:"off_topic"},{text:"而家幾點幾呀",intent:"off_topic"},{text:"我踩過門檻入去",intent:"enter_door"},{text:"我溜入間房先",intent:"enter_door"},{text:"側身挨入門口",intent:"enter_door"},{text:"開問啦",intent:"enter_door"},{text:"入去先丫",intent:"enter_door"},{text:"等我抖順條氣先",intent:"wait"},{text:"你俾我企定先",intent:"wait"},{text:"我未諗清楚先",intent:"wait"},{text:"你想我點先算呀",intent:"ask_want"},{text:"而家我應該點先",intent:"ask_want"},{text:"頭先我話嗰句你仲記唔記得",intent:"ask_memory"},{text:"我頭先講過嗰句你有冇印象",intent:"ask_memory"},{text:"出面黑唔黑呀",intent:"off_topic"},{text:"聽日會唔會好熱",intent:"off_topic"}],version:"split1cp"};
  global.IntentPatterns = api;
  global.INTENT_PATTERNS = api;
})(typeof window !== "undefined" ? window : globalThis);
