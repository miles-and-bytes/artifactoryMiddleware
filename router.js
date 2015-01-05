/*
 * @author : Swapnil Gandhi
 * version : v0.01
 */ 
var http = require('http'),
    httpProxy = require('http-proxy'),
    proxy = httpProxy.createProxyServer({}),
    url = require('url');

var express=require("express");
var app=express();
var app_command=express();
var app_redirect=express();
var request=require("request");
var bodyParser=require('body-parser');
var cookieParser = require('cookie-parser');
var sleep = require('sleep');

var base64_decode = require('base64').decode;

app.use(cookieParser());
app.use(bodyParser());

var loginForm='<body style="background-color:#202020;color:white">' +
    '<head><link href="//fonts.googleapis.com/css?family=Open+Sans:400,300,600,700,800|Lato:700" rel="stylesheet" type="text/css">' +
    '</head><body><center><div>' +
    '   <br/>' +
    '   <span style="font-size:12px"><span style="color:red;display:[DISP]">Invalid Username/Password</span></span>' +
    '   <br/><form method="post">' +
    '      <input style="display:block;height:30px;text-align:center;margin:4px;border:1px;width:200px;" type="text" name="user" value="" placeholder="Username">' +
    '      <input style="display:block;height:30px;text-align:center;margin:4px;border:1px;width:200px" type="password" name="password" value="" placeholder="Password">' +
    '      <button style="display:block;height:30px;text-align:center;margin:4px;border:1px;padding:3px;width:200px" type="button primary" name="commit">Sign In</button>' +
    '   </form>' +
    '</div></center></body>';

app.get("/login[/]?",function(req,res) {
var x=req.cookies;
if(x.authToken=="HUamvpIz73op") {
res.redirect('/artifactory/webapp/login.html');
}else {
res.send(loginForm.replace("[DISP]","none"));
}
});

app.post("/login[/]?",function(req,res) {
    var url = 'https://pubmatic.okta.com/api/v1/sessions?additionalFields=cookieTokenUrl';
    var headers = {
        'Accept':'application/json',
        'Content-Type' : 'application/json',
        'Authorization':'SSWS 00sQMLRFRPxwhc9JnCcezNMmAy2jps7ULfV6PudoQO'
    };
    console.log("[INFO] Preparing for making Call to OKTA");
    var json = { username: req.body.user, password: req.body.password };
    
    request.post({ url: url, json: json, headers: headers }, function (error, response, body) {
    console.log("[INFO] Calling OKTA to Authenticate USER");
        if(response.statusCode==200) {
            console.log("[INFO] USER Authenticated");
            var response = "<script>window.location='../artifactory/webapp/login.html'</script>";
            res.cookie('authToken', 'HUamvpIz73op', { maxAge: 21600000, httpOnly: false});
            console.log("[INFO] Auth Cookie Dropped");
            res.send(response);
        } else {
            console.log("[INFO] User NOT Authenticated");
            res.send(loginForm.replace("[DISP]","inline"));
        }

        if(error) {
           console.log("ERROR: " + error);
           var response = '<body style="background-color:#303030; color:white"><center><div><h1>Kickstart Login</h1><br/><font color="red">Invalid Login</font><form method="post"><p><input style="height:30px;line-height:30px;font-size:22px;border:1px;border-color:#202020;margin:0px;text-align:center" type="text" name="user" value="" placeholder="Username"></p><p><input style="height:30px;line-height:30px;font-size:22px;border:1px;border-color:#202020;border-style:top none none none ;margin:0px;text-align:center" type="password" name="password" value="" placeholder="Password"></p><p class="submit"><input type="submit" name="commit" value="Login"></p></form></div></center></body>';
           res.send(response);
        }
     });

});
app.listen(4050);

//REDIRECT-TO-LOGIN PAGE ROUTER

app_redirect.get("*",function(req,res) {
res.redirect('/login');
});
app_redirect.listen(2050);


//THID WILL BE REMOVED

/*app_command.get("*",function(req,res) {
var response = 'Check!';
res.send(response);
});*/
app_command.listen(3050);
