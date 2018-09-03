window.addEventListener('load', function () {
    var companyList = document.querySelector('#companyList');
    var btn_login = document.querySelector('#do_login');
    var input_password = document.querySelector('#input_pw');
    var message = document.querySelector('#login .message');
    var page_login = document.querySelector('#login');
    var page_upload = document.querySelector('#upload');


    var token = "";
    var app = {
        token: token,
        companyList: companyList,
        input_password: input_password,
        btn_login: btn_login,
        message: message,
        page_login: page_login,
        page_upload: page_upload
    };

    input_password.addEventListener('keypress',catchEnter(app));
    btn_login.addEventListener('click', doLogin(app));
});
function catchEnter(app) {
    return function f(e) {
        if(e.which===13){
            app.btn_login.click();
        }
    }
}
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
        console.log(json);
        var result = json.result;
        var description = json.description;
        if(result==='error'){
            if(description==='invalid_password'){
                app.message.innerText = '비밀번호가 일치하지 않습니다.';
            }
            else if(description==='invalid_username'){
                app.message.innerText = '존재하지 않는 아이디입니다.';
            }
        }else{
            app.page_login.style.visibility = 'hidden';
        }
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