(function (){
  let addButton = document.querySelector('.btn-add'),
  deleteButton = document.querySelector('.btn-delete'),
  clickNbr = document.querySelector('#click-nbr'),
  apiUrl = 'http://localhost:3000/api/clicks';

  function ready(fn){
    if(typeof fn !== 'function'){
      return;
    }

    if(document.readyState === 'complete'){
      return fn();
    }

    document.addEventListener('DOMContentLoaded', fn, false);
  }

  function ajaxRequest (method, url, callback) {
    let xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = () => {
      if(xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        callback(xmlhttp.response);
      }
    };

    xmlhttp.open(method, url, true);
    xmlhttp.send();
  }

  function updateClickCount (data) {
    let clicksObject = JSON.parse(data);
    clickNbr.innerHTML = clicksObject.clicks;
  }

  ready(ajaxRequest('GET', apiUrl, updateClickCount))

  addButton.addEventListener('click', () => {
    ajaxRequest('POST', apiUrl, () => {
      ajaxRequest('GET', apiUrl, updateClickCount);
    });
  }, false);

  deleteButton.addEventListener('click', () => {
    ajaxRequest('DELETE', apiUrl, ()=> {
      ajaxRequest('GET', apiUrl, updateClickCount);
    });
  }, false);
})();
