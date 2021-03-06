var appUrl = window.location.origin,
ajaxFunctions = {
  ready: function ready (fn) {
    if(typeof fn !== 'function'){
      return;
    }

    if(document.readyState === 'complete'){
      return fn();
    }

    document.addEventListener('DOMContentLoaded', fn, false);
  },
  ajaxRequest: function ajaxRequest (method, url, callback){
    let xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = () => {
      if(xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        callback(xmlhttp.response);
      }
    };

    xmlhttp.open(method, url, true);
    xmlhttp.send();
  }

};
