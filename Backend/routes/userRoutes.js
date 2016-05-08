/**
 * Created by shikher on 30-Apr-16.
 */

var express = require('express');


var routes = function (connection) {

    var userRouter = express.Router();

    userRouter.route('/signup').post(function (req, res) {

        //get name and email
        var name = req.body.name;
        var email = req.body.email;


        //check whether user already exists or not
        var query = connection.query('select count(*) as cnt from users where email_id = ?', [email], function (err, results) {

            if (results[0].cnt === 0) {
                //user does not exists create user
                var values = {email_id: email, user_name: name};

                var query = connection.query('INSERT INTO Users SET ?', values, function (err, results) {
                    if (err)
                        return res.json(err);
                    else
                        return res.json({"result": "true"});
                });

            } else {
                return res.json({"result": "false"});
            }
        });


    });

    userRouter.route('/login').post(function (req, res) {
        //login will take emailId and return result and json web token,
        // for clarification see the file, which I shared.
        // we should store the json web token in database.

        //get email
        var email = req.body.email;

        //check if exists
        var query = connection.query('select count(*) as cnt from users where email_id = ?', [email], function (err, results) {
            if (results[0].cnt === 0) {
                return res.json({"result": "false"});
            } else {

                //generate token, store in table.
                // This will be used for every request sent from android app.
                // also set a boolean variable which says that user is logged in.
                return res.json({
                    "result": "true",
                    "token": "some random token"
                });
            }
        });
    });

    userRouter.route('/logout').post(function (req, res) {
        //Since the user has logged out, we need to make sure
        // we disable all the future api calls.
        // set the boolean variable which says that user is logged in to false

        //get email
        var email = req.body.email;

        return res.json({"result": "true"});
    });


    return userRouter;
};


module.exports = routes;