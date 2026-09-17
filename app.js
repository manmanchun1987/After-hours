(function(){
  var u = "https://cdn.jsdelivr.net/gh/manmanchun1987/After-hours@e541353eb6d18ab6a871fca70b22e51d285379db/app.js";
  fetch(u).then(function(r){ return r.text(); }).then(function(t){
    var s = document.createElement("script");
    s.textContent = t;
    document.head.appendChild(s);
  }).catch(function(err){
    console.error(err);
    var s = document.createElement("script");
    s.src = "https://raw.githubusercontent.com/manmanchun1987/After-hours/e541353eb6d18ab6a871fca70b22e51d285379db/app.js";
    document.head.appendChild(s);
  });
})();
