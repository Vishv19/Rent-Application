/**
 * Created by shikher on 30-Apr-16.
 */

var express = require('express');


var routes = function () {

    var tenantRouter = express.Router();


    tenantRouter.route('/searchPlace/:tenantId').post(function(req,res) {
        //the request will contain tenant id.
        // we use this id and verify whether the tenant is valid and tenant is logged in.
        // then we will the list of places which satisfy this search criteria

    });

    tenantRouter.route('/getPlace/:tenantId/:placeId').get(function(req,res) {
        //the request will contain tenant id.
        // we use this id and verify whether the tenant is logged in.
        // then we will return the details about the place by using placeId
    });


    tenantRouter.route('/favouritePlace/:tenantId/:placeId').post(function(req,res) {
        // the request will contain tenant id.
        // we use this id and verify whether the tenant is logged in
        // then we will add the particular place to the user favourites
    });

    tenantRouter.route('/saveSearch/:tenantId').post(function(req,res) {
        // the request will contain tenant id.
        // we use this id and verify whether the tenant is logged in
        // then we will save the search
    });















    return tenantRouter;
};


module.exports = routes;