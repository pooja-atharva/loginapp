var express= require('express');
var app = express();
var mysql = require('mysql');
var bodyParser = require('body-parser');
var session = require('express-session');
app.use(function (req,res,next) {
  res.set('Cache-Control','no-cache,private,must-revalidate,no-store');
  next();
})

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
}));

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

var conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'loginapp'
});

conn.connect(function (err) {
  if (err) throw err;
  console.log("Connected...")
})
app.set('view engine', 'ejs');

app.get('/', function(req,res){
  res.render('signup');
});

app.post('/signup',function (req,res) {
  var name = req.body.name;
  var email = req.body.email;
  var password = req.body.password;
  var sql = `insert into users(user_name, user_email, user_password) values('${name}','${email}','${password}' )`;
  conn.query(sql, function (err, result) {
    if (err) throw err;
    res.send("user signup sucessfully.")
  })
})

app.get('/login', function(req,res){
  res.render('login');
});

app.post('/login', function (req,res) {
  var email = req.body.email;
  var password = req.body.password;
  if(email && password){
    var sql = `select * from users where user_email = '${email}' && user_password = '${password}'`;
    conn.query(sql, function (err, results) {
      if(results.length>0){
        req.session.loggedin=true;
        req.session.email=email;
        res.redirect('/welcome');
      }else{
        res.send("Incurrect email or password.")
      }

    })
  }else{
    res.send("Please enter email or password")
  }
});

app.get('/welcome', function (req,res) {
  if(req.session.loggedin){
    res.render('welcome', {user: `${req.session.email}`});
  }else{
    res.send("Please Login.")
  }
})

app.get('/logout', function (req,res) {
  req.session.destroy((err)=>{
    res.redirect('/login');
  })
})

var server = app.listen(3000, function () {
  console.log("open localhost:3000");
})
