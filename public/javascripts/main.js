/**
 * Created by chou6 on 2018-08-09.
 */
window.addEventListener('load',function () {
    //auth
    var token = {key: ""};

    //views
    var root = document.querySelector('#app-root');
    var app_login = document.querySelector('#app-login');
    var app_upload = document.querySelector('#app-upload');

    //buttons
    var btn_login = document.querySelector('#btn_login');
    var btn_upload = document.querySelector('#btn_upload');
    var btn_upload_click = document.querySelector('#btn_upload_btn');

    var app = {
        root: root,
        app_login: app_login,
        app_upload: app_upload,

        btn_login: btn_login,
        btn_upload: btn_upload_click,
        btn_upload_click: btn_upload_click,

        token: token
    };

    app.root.appendChild(app.app_login);
    btn_login.addEventListener('click',doLogin(app));
});

function doLogin(app){
        login(app).then(loadPage).catch(function (data) {
            console.log(data)
        });
}
function login(app) {
    return new Promise((resolve, reject) => {
        var oReq = new XMLHttpRequest();
        var username = document.querySelector('input[name="email"]');
        var password = document.querySelector('input[name="password"]');
        var data = JSON.stringify({"email": username.value, "password": password.value});
        oReq.addEventListener("load", function () {
            if(this.status >= 200 && this.status <300){
                console.log(this.responseText);
                app.token.key = JSON.parse(this.responseText).token;
                resolve([app, app.app_upload]);
            }else{
                reject(new Error(this.responseText));
            }

        });
        oReq.open("POST", "/token/login");
        oReq.setRequestHeader('Content-Type', 'application/json');
        oReq.send(data);
    });
}
function getData(app){

}
function loadPage(data) {
    var app = data[0];
    var page = data[1];
    return new Promise(function (resolve, reject) {
        while (app.root.firstChild) {
            app.root.removeChild(app.root.firstChild);
        }
        app.root.appendChild(page);
        resolve("success");
    });
}