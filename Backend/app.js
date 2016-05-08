/**
 * Created by shikher on 30-Apr-16.
 */

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mysql = require('mysql');


var port = 3000;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//create sql connection
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'rent'
});


var userRouter = require('./routes/userRoutes')(connection);
var landlordRouter = require('./routes/landlordRoutes')(connection);
var tenantRouter = require('./routes/tenantRoutes')(connection);


app.use('/api/users', userRouter);
app.use('/api/landlord', landlordRouter);
app.use('/api/tenant', tenantRouter);

app.get('/', function (req, res) {
    res.json({"title":"RENT APP"});
});

app.listen(port, function () {
    console.log('Running on PORT: ' + port);
});


