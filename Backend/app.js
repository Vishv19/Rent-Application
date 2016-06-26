/**
 * Created by vishv on 30-Apr-16.
 */

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mysql = require('mysql');
var expressJWT = require('express-jwt');

var port = 3000;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");
  next();
});
app.all(expressJWT({ secret: 'Rentz mobile App'}). unless({ path: ['api//users/login']}));

//create sql connection
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'rent'
});

connection.connect(function(err){
  if(err){
    console.log('Error connecting to Db');
    return;
  }
  console.log('Connection established');
});

// connection.end(function(err) {
//   // The connection is terminated gracefully
//   // Ensures all previously enqueued queries are still
//   // before sending a COM_QUIT packet to the MySQL server.
// });

var userRouter = require('./routes/userRoutes')(connection);
var landlordRouter = require('./routes/landlordRoutes')(connection);
var tenantRouter = require('./routes/tenantRoutes')(connection);


app.use('/api/users', userRouter);
app.use('/api/landlord', landlordRouter);
app.use('/api/tenant', tenantRouter);

app.get('/', function (req, res) {
    res.json({"title":"RENT APP"});
});

app.listen(process.env.PORT || port, function () {
    console.log('Running on PORT: ' + port);
});


