(function (){
  let addButton = document.querySelector('.btn-add'),
  deleteButton = document.querySelector('.btn-delete'),
  clickNbr = document.querySelector('#click-nbr'),
  apiUrl = 'http://127.0.0.1:8080/api/:id/clicks';

  function updateClickCount (data) {
    let clicksObject = JSON.parse(data);
    clickNbr.innerHTML = clicksObject.clicks;
  }

  ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiUrl, updateClickCount))

  addButton.addEventListener('click', () => {
    ajaxFunctions.ajaxRequest('POST', apiUrl, () => {
      ajaxFunctions.ajaxRequest('GET', apiUrl, updateClickCount);
    });
  }, false);

  deleteButton.addEventListener('click', () => {
    ajaxFunctions.ajaxRequest('DELETE', apiUrl, ()=> {
      ajaxFunctions.ajaxRequest('GET', apiUrl, updateClickCount);
    });
  }, false);
})();
