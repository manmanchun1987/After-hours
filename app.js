(function(){
  var parts = ['app_b64_0.js','app_b64_1.js','app_b64_2.js'];
  var i = 0;
  function next(){
    if(i>=parts.length){
      var s=document.createElement('script');
      s.src='./app_loader_full.js?v=1';
      document.head.appendChild(s);
      return;
    }
    var s=document.createElement('script');
    s.src='./'+parts[i]+'?v=1';
    s.onload=function(){i++;next();};
    s.onerror=function(){console.error('load fail',parts[i]);};
    document.head.appendChild(s);
  }
  next();
})();
