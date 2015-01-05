/*
 * @author : Swapnil Gandhi
 * version : v 0.01
 */

var http = require('http'),
    httpProxy = require('http-proxy'),
    proxy = httpProxy.createProxyServer({}),
    url = require('url');

var express=require("express");
var app=express();
var app_command_line=express();
var request=require("request");
var bodyParser=require('body-parser');
var cookieParser = require('cookie-parser');
var sleep = require('sleep');

var base64_decode = require('base64').decode;

app.use(cookieParser());
app.use(bodyParser());

var user_authenticated=0;

function switch_ports(req,res,pathname){

 switch(pathname)
    {
            case '/login/':
            case '/login':
            console.log("[INFO] Login request send to PORT 4950");
            proxy.web(req, res, { target: 'http://localhost:4950' });
            break;

            case '/artifactory/':
	    case '/artifactory':
            console.log("[INFO] Artifactory request send to PORT 4950");
            proxy.web(req, res, { target: 'http://localhost:4950' });
            break;

            default:
            console.log("[INFO] Redirecting request to PORT 8081 from switch");
            proxy.web(req, res, { target: 'http://localhost:8081' }); //ARTIFACTORY SHOULD BE ADDED HERE
            break;
    }

}

function print_message(req,res,message){

res.end(message);

}

var get_cookies = function(request) {
  var cookies = {};
  request.headers && request.headers.cookie.split(';').forEach(function(cookie) {
    var parts = cookie.match(/(.*?)=(.*)$/)
    cookies[ parts[1].trim() ] = (parts[2] || '').trim();
  });
  return cookies;
};

http.createServer(function(req, res) {
    var hostname = req.headers.host.split(":")[0];
    var pathname = url.parse(req.url).pathname;
    var auth = req.headers.authorization;
    req.headers.authorization="";

    if(auth!=undefined) //COMMAND LINE LOGIN GATEWAY
    {
	console.log("[CHECK] Found AUTH Header");
	var auth_head=base64_decode(auth.split(' ')[1]);
        var user=auth_head.split(":")[0];
        var pass=auth_head.split(":")[1];
	console.log("[INFO] Auth Header Read");

	
    var url1 = 'https://pubmatic.okta.com/api/v1/sessions?additionalFields=cookieTokenUrl';
    var headers = {
        'Accept':'application/json',
        'Content-Type' : 'application/json',
        'Authorization':'SSWS 00sQMLRFRPxwhc9JnCcezNMmAy2jps7ULfV6PudoQO'
    };
    console.log("[INFO] Preparing for making Call to OKTA through Command Line");
    var message="Invalid Username/Password";
    var json = { username: user, password: pass };

   request.post({ url: url1, json: json, headers: headers }, function (error, response, body) {
   console.log("[INFO] Calling OKTA to Authenticate USER through Command Line");
	
 	if(response.statusCode==200) {
            console.log("[INFO] USER Authenticated");
	    user_authenticated=1;
	    switch_ports(req,res,pathname);
        } else {
            console.log("[INFO] User NOT Authenticated");
            console.log("Invalid Username/Password");
	    user_authenticated=0;
	    message="Invalid Username/Password";
            print_message(req,res,message);    
        }

        if(error) {
           console.log("ERROR: " + error);
	   message="We're facing an issue right now. This will be resolved shortly!";
           print_message(req,res,message);
        }
     });     


    }

    // COMMAND LINE GATEWAY ENDS

    if(auth==undefined)
    {
    console.log("[INFO] Auth Header NOT FOUND");
    if(pathname!="/login") {
    if(req.headers.cookie!=undefined)
    {
    console.log("[INFO] Looking for Cookie");
    var cookie=get_cookies(req)['authToken'];
    if(cookie!='HUamvpIz73op')
      {
        console.log("[INFO] Auth Cookie does NOT match default value");
        console.log("[INFO] Calling Login Page");
        pathname='/redirect-to-login';
      } else {console.log("[INFO] Auth Cookie Found");}
    
    } else {
       console.log("[INFO] NO Cookies Present");
       console.log("[INFO] Passing request to Login Page Select Case");
       pathname='/redirect-to-login';
      }
    }
    
    //console.log(pathname);
    console.log("[INFO] Passing parameter to Router");

    //ROUTER
    switch(pathname)
    {
            case '/login/':
            case '/login':
            console.log("[INFO] Login request send to PORT 4050 for rendering");
            proxy.web(req, res, { target: 'http://localhost:4050' });
            break;

	    case '/redirect-to-login':
            console.log("[INFO] Redirect request send to PORT 2050");
            proxy.web(req, res, { target: 'http://localhost:2050' });
            break;

            default: //ARTIFACTORY SHOULD BE ADDED HERE
            console.log("[INFO] Redirecting request to PORT 3050");
            //proxy.web(req, res, { target: 'http://localhost:3050' });
            proxy.web(req, res, { target: 'http://localhost:8081' });
    }

   } //IF LOOP FOR BROWSER ENDS
}).listen(80);


app_command_line.get("/artifactory[/]?",function(req,res) {
  if(user_authenticated==1) {
  console.log("[INFO] Get call received on Artifactory Path for Command line");
  res.end("Congratulations!,You have reached End of Internet :D");
  }
});

app_command_line.get("/login[/]?",function(req,res) {
  if(user_authenticated==1) {
  console.log("[INFO] Get call recevied on Login Path for command line");
  res.end("Hi! You've successfully authenticated yourself, but we don't provide Shell Access ");
  }
});
app_command_line.listen(4950);


