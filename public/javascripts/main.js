window.addEventListener('load', function () {
    var companyList = document.querySelector('#companyList');
    var btn_login = document.querySelector('#do_login');

    var token = "";
    var app = {
        token: token,
        companyList: companyList
    };

    btn_login.addEventListener('click', doLogin(app));
});
function doLogin(app) {
    return function f(e) {
        var id = document.querySelector('#input_id').value;
        var pw = document.querySelector('#input_pw').value;
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://localhost/token/login');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.addEventListener('load', getToken(app));
        xhr.send(JSON.stringify({email: id, password: pw}));
    };

}
function getToken(app) {
    return function f(e) {
        var json  =  JSON.parse(this.responseText);
        var result = json.result;
        var description = json.description;
        if(json.token!==undefined){
            var token = json.token;
            app.token = token;
        }

    }
}

function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    console.log('token:' + googleUser.getAuthResponse().id_token);
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
    console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
}
function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
    });
}
function validate() {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://localhost/token');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
        console.log('Signed in as: ' + xhr.responseText);
    };
    xhr.send('idtoken=' + id_token);
}