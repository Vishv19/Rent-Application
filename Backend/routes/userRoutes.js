/**
 * Created by shikher on 30-Apr-16.
 */

var express = require('express');


var routes = function () {

    var userRouter = express.Router();


    userRouter.route('/signup').post(function (req, res) {
        //should update the respective tables
        // corresponding to landlord and user info
        // since we are signing in with google credentials,
        // we need to check for each request to server whether the
        //user is signed in and get userid. SO each request should contain google id
    });

    userRouter.route('/login').post(function (req, res) {
        //should verify the login credentials, whether the user is able to
        //successfully login by google credentials
    });

    userRouter.router('/logout').post(function (req, res) {
        //Since the user has logged out, we need to make sure
        // we disable all the future api calls. We need to store a variable
        // for each user in the database which specifies whether the user is logged in or not.
    });


    return userRouter;
};


module.exports = routes;