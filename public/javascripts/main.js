window.addEventListener('load', function () {
    var elem_companyList = document.querySelector('#company_list ul');
    var elem_bundleList = document.querySelector('#bundle_list .list ul');
    var elem_availBundleList = document.querySelector('#avail_bundle ul');
    var elem_usedBundleList = document.querySelector('#used_bundle ul');

    var btn_login = document.querySelector('#do_login');
    var input_password = document.querySelector('#input_pw');
    var input_companyName = document.querySelector("[name='new_company']");

    var message_login = document.querySelector('#login .message');
    var message_upload = document.querySelector('#upload .message');
    var message_addCompany = document.querySelector('#company_add .message');

    var btn_getFile = document.querySelector('#get_file');
    var btn_uploadFile = document.querySelector('#upload_file');
    var btn_addCompany = document.querySelector('#company_add button');

    var file_input = document.querySelector("#upload input[type='file']");

    var page_login = document.querySelector('#login');
    var page_upload = document.querySelector('#upload');

    var template_companyList = document.querySelector('#companyList');
    var template_bundleList = document.querySelector('#bundleList');
    var template_availBundleList = document.querySelector('#availBundleList');
    var template_usedBundleList = document.querySelector('#usedBundleList');

    var token = "";
    var app = {
        token: token,
        currentCompany: null,

        companyList: companyList,
        input_password: input_password,
        input_companyName: input_companyName,

        btn_login: btn_login,
        btn_getFile: btn_getFile,
        btn_uploadFile: btn_uploadFile,
        btn_addCompany: btn_addCompany,

        file_input: file_input,
        file_data: null,

        message_login: message_login,
        message_upload: message_upload,
        message_addCompany: message_addCompany,

        elem_companyList: elem_companyList,
        elem_bundleList: elem_bundleList,
        elem_availBundleList: elem_availBundleList,
        elem_usedBundleList: elem_usedBundleList,

        page_login: page_login,
        page_upload: page_upload,

        template_companyList: template_companyList,
        template_bundleList: template_bundleList,
        template_availBundleList: template_availBundleList,
        template_usedBundleList: template_usedBundleList
    };
    input_password.addEventListener('keypress',catchEnter(app));
    input_companyName.addEventListener('keypress',catchEnterAddCompany(app));

    btn_login.addEventListener('click', doLogin(app));
    btn_getFile.addEventListener('click',getFile(app));
    btn_uploadFile.addEventListener('click',uploadFile(app));
    btn_addCompany.addEventListener('click',addCompany(app));
    file_input.addEventListener('change',setFileUpload(app));
    elem_companyList.addEventListener('click',doCompanyAction(app));
    elem_bundleList.addEventListener('click',doBundleAction(app));
    elem_usedBundleList.addEventListener('click',doUsedBundleAction(app));
    elem_availBundleList.addEventListener('click',doAvailBundleAction(app));

    Handlebars.registerHelper("purchases", function (purchase) {
        if (purchase === 1) {
            return "checked";
        } else {
            return "";
        }
    });
    
    
});

function catchEnter(app) {
    return function f(e) {
        if(e.which===13){
            app.btn_login.click();

        }
    }
}
function catchEnterAddCompany(app) {
    return function f(e) {
        if(e.which===13){
            app.btn_addCompany.click();
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
        app.btn_uploadFile.disabled = false;
        app.btn_uploadFile.innerHTML = "업로드";
        app.message_upload.innerHTML = "업로드가 완료되었습니다.";
        getBundleList(app);
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
                app.page_login.style.display = 'none';
                app.page_upload.style.display = 'block';

                getBundleList(app);
                getCompanyList(app);

            }

        }


    }
}
function addCompany(app) {
    return function f(e) {
        var companyName = app.input_companyName.value;
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'company/add');
        xhr.setRequestHeader('Authorization', 'Bearer ' + app.token);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.addEventListener('load', addCompanyNotice(app));
        xhr.send(JSON.stringify({company: companyName}));
    }

}
function addCompanyNotice(app) {
    return function f(e) {
        var json  =  JSON.parse(this.responseText);
        result = json.result;
        if(result==="success"){
            app.message_addCompany.innerText = "추가되었습니다.";
            getCompanyList(app);
        }else if(result==="token_not_valid"){
            app.message_addCompany.innerText = "인증정보가 유효하지 않습니다. 다시 로그인해 주십시오.";
        }


    }
}
function getCompanyList(app){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'company/list');
    xhr.setRequestHeader('Authorization', 'Bearer ' + app.token);
    xhr.addEventListener('load', renderCompanylist(app));
    xhr.send();
}
function renderCompanylist(app){
    return function f(e) {
        var json  =  JSON.parse(this.responseText);
        var company = json.company;
        var result = json.result;
        if(result==="success"){
            var html = app.template_companyList.innerText;
            var bindTemplate = Handlebars.compile(html);
            var resultHTML = company.reduce(function(prev, next){
                return prev + bindTemplate(next);
            },"");
            app.elem_companyList.innerHTML = resultHTML;
        }

    }
}
function getBundleList(app){
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'bundle/list');
        xhr.setRequestHeader('Authorization', 'Bearer ' + app.token);
        xhr.addEventListener('load', renderBundleList(app));
        xhr.send();

}
function renderBundleList(app) {
    return function f(e) {
        var json  =  JSON.parse(this.responseText);
        var bundles = json.bundles;
        var result = json.result;

        if(result==="success"){
            var html = app.template_bundleList.innerText;
            var bindTemplate = Handlebars.compile(html);
            var resultHTML = bundles.reduce(function(prev, next){
                return prev + bindTemplate(next);
            },"");
            app.elem_bundleList.innerHTML = resultHTML;
        }

    }
}
function doBundleAction(app) {
    return function f(e) {
        var hash = e.target.closest('li').getAttribute('data-hash');
        var companyId = app.currentCompany;
        if(e.target.tagName==="SPAN"){
            var xhr = new XMLHttpRequest();
            xhr.open('DELETE', 'bundle/remove?hash='+hash);
            xhr.setRequestHeader('Authorization', 'Bearer ' + app.token);
            xhr.addEventListener('load', notifyDeleteBundle(app).bind(e.target.closest('li')));
            xhr.send();
        }

    }
}
function notifyDeleteBundle(app) {
    return function f(e) {
        var json = JSON.parse(e.target.responseText);
        var result = json.result;
        if(result === "success"){
            app.elem_bundleList.removeChild(this);
        }

    };
}
function doUsedBundleAction(app) {
    return function f(e) {
        if(e.target.tagName === "INPUT"){

            var bundleId = e.target.closest('li').getAttribute('data-bundleId');
            var companyId = app.currentCompany;
            var btn_switch = e.target.closest('.switch');
            if(btn_switch.classList.contains('checked')){
                var xhr = new XMLHttpRequest();
                xhr.open('PUT', 'bundle/used_list/update?purchase=0&bundleId='+bundleId +"&companyId="+companyId);
                xhr.setRequestHeader('Authorization', 'Bearer ' + app.token);
                xhr.addEventListener('load', notifyPurchase(app,0).bind(btn_switch));
                xhr.send();

            }else{
                var xhr = new XMLHttpRequest();
                xhr.open('PUT', 'bundle/used_list/update?purchase=1&bundleId='+bundleId +"&companyId="+companyId);
                xhr.setRequestHeader('Authorization', 'Bearer ' + app.token);
                xhr.addEventListener('load', notifyPurchase(app,1).bind(btn_switch));
                xhr.send();
            }
        }else if(e.target.classList.contains('minus')){
            var bundleId = e.target.closest('li').getAttribute('data-bundleId');
            var companyId = app.currentCompany;
            var xhr = new XMLHttpRequest();
            xhr.open('DELETE', 'bundle/used_list/remove?bundleId='+bundleId +"&companyId="+companyId);
            xhr.setRequestHeader('Authorization', 'Bearer ' + app.token);
            xhr.addEventListener('load', notifyDeleteUsedBundle(app).bind(e.target.closest('li')));
            xhr.send();
        }

    }
}
function notifyDeleteUsedBundle(app){
    return function f(e) {

        var json=JSON.parse(e.target.responseText);
        var result = json.result;
        if(result == "success") {
            app.elem_usedBundleList.removeChild(this);
        }

    }
}
function notifyPurchase(app,flag) {
    return function f(e) {
        var json=JSON.parse(e.target.responseText);
        var result = json.result;
        if(result == "success"){
            if(flag===1){
                this.classList.add('checked');
            }else{
                this.classList.remove('checked');
            }
        }

    };

}
function doAvailBundleAction(app) {
    return function f(e) {
        if(e.target.tagName==="SPAN"){
            var target = e.target.closest('li');
            var bundleId = target.getAttribute("data-bundleId");
            var data = JSON.stringify({companyId: app.currentCompany,bundleId: bundleId});
            var xhr = new XMLHttpRequest();
            xhr.open('POST', 'bundle/available_list/add');
            xhr.setRequestHeader('Authorization', 'Bearer ' + app.token);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.addEventListener('load', notifyAddAvailBundle(app).bind(target.closest('li')));

            xhr.send(data);

        }
    }
}
function notifyAddAvailBundle(app) {
    return function f(e) {
        var json = JSON.parse(e.target.responseText);
        var result = json.result;
        if(result==="success"){
            var newBundle = [{id:this.getAttribute("data-bundleId"),purchase: 0,file_name: this.firstChild.nodeValue}];
            var html = app.template_usedBundleList.innerText;
            var bindTemplate = Handlebars.compile(html);
            var resultHTML = newBundle.reduce(function(prev, next){
                return prev + bindTemplate(next);
            },"");
            app.elem_usedBundleList.innerHTML += resultHTML;
            app.elem_availBundleList.removeChild(this);
        }
    }
}

function deleteBundle(app) {
    return function f(e) {
        if(e.target.tagName==="SPAN"){
            var target = e.target.closest('li');
            var bundleId = target.getAttribute("data-bundleId");

        }
    }
}
function notifyDelete() {

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

    };
}
function uploadFile(app) {
    return function f(e) {
        app.btn_uploadFile.disabled = true;
        app.btn_uploadFile.innerHTML = "업로드중..";
        var data = new FormData();
        //data.append('company_id', "1");
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
function doCompanyAction(app) {
    return function f(e) {
        var tag = e.target.tagName;
        if(tag==="LI"){
            var target = e.target;
            var companyId = target.getAttribute("data-companyId");
            app.currentCompany = companyId;
            getAvailBundle(app);
            getUsedBundle(app);


        }else if(tag==="SPAN"){
            var target = e.target;
            var companyId = target.closest('li').getAttribute("data-companyId");
            var xhr = new XMLHttpRequest();
            xhr.open('DELETE', 'company/remove?id='+companyId);
            xhr.setRequestHeader('Authorization', 'Bearer ' + app.token);
            xhr.addEventListener('load', notifyDeleteCompany(app).bind(target.closest('li')));
            xhr.send();
        }
    }
}
function getAvailBundle(app){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'bundle/available_list/'+app.currentCompany);
    xhr.setRequestHeader('Authorization', 'Bearer ' + app.token);
    xhr.addEventListener('load', renderAvailBundleInfo(app));
    xhr.send();
}
function getUsedBundle(app){
    xhr = new XMLHttpRequest();
    xhr.open('GET', 'bundle/used_list/'+ app.currentCompany);
    xhr.setRequestHeader('Authorization', 'Bearer ' + app.token);
    xhr.addEventListener('load', renderUsedBundleInfo(app));
    xhr.send();
}

function renderAvailBundleInfo(app){
    return function f(e) {
        var json = JSON.parse(this.responseText);
        var bundles = json.bundles;
        var result = json.result;
        if(result ==="success"){
            var html = app.template_availBundleList.innerText;
            var bindTemplate = Handlebars.compile(html);
            var resultHTML = bundles.reduce(function(prev, next){
                return prev + bindTemplate(next);
            },"");
            app.elem_availBundleList.innerHTML = resultHTML;
        }else{
            app.elem_availBundleList.innerHTML = "";
        }

    }
}
function renderUsedBundleInfo(app){
    return function f(e) {
        var json = JSON.parse(this.responseText);
        var bundles = json.bundles;
        var result = json.result;
        if(result ==="success"){
            var html = app.template_usedBundleList.innerText;
            var bindTemplate = Handlebars.compile(html);
            var resultHTML = bundles.reduce(function(prev, next){
                return prev + bindTemplate(next);
            },"");
            app.elem_usedBundleList.innerHTML = resultHTML;
        }else{
            app.elem_usedBundleList.innerHTML = "";
        }

    }
}
function notifyDeleteCompany(app) {
    return function f(e) {
        var json = JSON.parse(e.target.responseText);
        var result = json.result;
        if(result==="success"){
            app.elem_companyList.removeChild(this);
        }
    }

}