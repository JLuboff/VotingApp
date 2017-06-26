(function(){
  let profileId = document.querySelector('#profile-id') || null,
  profileUsername = document.querySelector('#profile-username') || null,
  profileRepos = document.querySelector('#profile-repos') || null,
  displayName = document.querySelector('#display-name'),
  apiUrl = appUrl + '/api/:id';

  function updateHtmlElement(data, element, userProperty){
    console.log(data[userProperty]);
    element.innerHTML = data[userProperty];
  }

  ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiUrl, (data) => {
    let userObject = JSON.parse(data);

    updateHtmlElement(userObject, displayName, 'displayName');

    if(profileId !== null) {
      updateHtmlElement(userObject, profileId, 'id');
    }

    if(profileUsername !== null){
      updateHtmlElement(userObject, profileUsername, 'username');
    }

    if(profileRepos !== null) {
      updateHtmlElement(userObject, profileRepos, 'publicRepos');
    }
  }))
})();
