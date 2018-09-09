window.addEventListener('load', function () {
    var companyList = document.querySelector('#companyList');
    var btn_login = document.querySelector('#do_login');
    var input_password = document.querySelector('#input_pw');
    var message_login = document.querySelector('#login .message');
    var message_upload = document.querySelector('#upload .message');
    var btn_getFile = document.querySelector('#get_file');
    var btn_uploadFile = document.querySelector('#upload_file');
    var file_input = document.querySelector("#upload input[type='file']");
    var page_login = document.querySelector('#login');
    var page_upload = document.querySelector('#upload');


    var token = "";
    var app = {
        token: token,
        companyList: companyList,
        input_password: input_password,
        btn_login: btn_login,
        btn_getFile: btn_getFile,
        btn_uploadFile: btn_uploadFile,
        file_input: file_input,
        file_data: null,
        message_login: message_login,
        message_upload: message_upload,
        page_login: page_login,
        page_upload: page_upload,


    };

    input_password.addEventListener('keypress',catchEnter(app));
    btn_login.addEventListener('click', doLogin(app));
    btn_getFile.addEventListener('click',getFile(app));
    btn_uploadFile.addEventListener('click',uploadFile(app));
    file_input.addEventListener('change',setFileUpload(app));
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
        xhr.open('POST', 'token/login');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.addEventListener('load', getToken(app));
        xhr.send(JSON.stringify({email: id, password: pw}));
    };

}
function uploadNotify(app){
    return function f(e) {
        var json  =  JSON.parse(this.responseText);
        app.message_upload.innerHTML = "업로드가 완료되었습니다.";
    }
}
function getToken(app) {
    return function f(e) {
        var json  =  JSON.parse(this.responseText);
        var result = json.result;
        var description = json.description;
        if(result==='error'){
            if(description==='invalid_password'){
                app.message_login.innerText = '비밀번호가 일치하지 않습니다.';
            }
            else if(description==='invalid_username'){
                app.message_login.innerText = '존재하지 않는 아이디입니다.';
            }
        }else{
            if(json.token!==undefined){
                var token = json.token;
                app.token = token;
            }
            app.page_login.style.display = 'none';
            app.page_upload.style.display = 'block';
        }


    }
}
function getCompanyList(){

}
function getFile(app) {
    return function f(e) {
        app.file_input.click();
    };

}
function setFileUpload(app) {
    return function f(e) {
        app.file_data = document.querySelector("#upload input[type='file']").files[0];
        app.message_upload.innerHTML='파일명 : ' + app.file_data.name;
        console.log(app.file_data);
    };
}
function uploadFile(app) {
    return function f(e) {
        console.log('upload');
        var data = new FormData();
        data.append('company_id', "1");
        data.append('bundle', app.file_data);
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'bundle/upload');
        xhr.setRequestHeader('Authorization', 'Bearer ' + app.token);
        xhr.addEventListener('load', uploadNotify(app));
        xhr.send(data);

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
