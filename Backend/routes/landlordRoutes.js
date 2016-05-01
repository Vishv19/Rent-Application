/**
 * Created by shikher on 30-Apr-16.
 */

var express = require('express');


var routes = function () {

    var landlordRouter = express.Router();



    landlordRouter.route('/addPlace/:landlordId').post(function(req,res) {
        //the request will contain landlord id.
        // we use this id and verify whether the landlord is logged in.
        // then we will add the place to the place table
    });


    landlordRouter.route('/getPlace/:landlordId/:placeId').get(function(req,res) {
        //the request will contain landlord id.
        // we use this id and verify whether the landlord is logged in.
        // then we will return the details about the place.
    });


    landlordRouter.route('/updatePlace/:landlordId/:placeId').put(function(req,res) {
        //the request will contain landlord id.
        // we use this id and verify whether the landlord is logged in.
        // then we will update the place to the place table
    });

    landlordRouter.route('/deletePlace/:landlordId/:placeId').delete(function(req,res) {
        //the request will contain landlord id.
        // we use this id and verify whether the landlord is logged in.
        // then we will delete the place
        // it will involve two scenarios
        // 1. Place has been rented
        // 2. Place has been cancelled or removed

    });

    landlordRouter.route('/getPlaceList/:landlordId/:placeId').get(function(req,res) {
        //the request will return all places associated with a particular landlord
        // we use landlord id and verify whether the landlord is logged in.
        // then we will return list of all places associated with the landlord


    });


    return landlordRouter;
};


module.exports = routes;