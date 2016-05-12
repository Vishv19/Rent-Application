/**
 * Created by shikher on 30-Apr-16.
 */

var express = require('express');
var async = require('async');


var routes = function (connection) {

    var tenantRouter = express.Router();


    tenantRouter.route('/search').post(function (req, res) {

        var keywords = req.body.keywords;
        var city = req.body.location.city;
        var zip = req.body.location.zip;
        var propertyType = req.body.propertyType;
        var minPrice = req.body.priceRange.min;
        var maxPrice = req.body.priceRange.max;

        var arrayOfValues = [];
        arrayOfValues.push(zip);
        arrayOfValues.push(minPrice);
        arrayOfValues.push(maxPrice);
        arrayOfValues.push('%'+city+'%');

        var resultObject = {"list": []};

        var queryString = 'select * from Place,Address where Place.address_id = Address.address_id AND Address.zip_code = ? AND Place.price > ? AND Place.price < ? AND Address.city_name LIKE ?';
        for (k in keywords) {
            queryString = queryString + ' AND Place.description LIKE ?';
            arrayOfValues.push('%' + keywords[k] + '%');
        }
        
        // console.log(arrayOfValues);
        // console.log(queryString);

        var query = connection.query(queryString, arrayOfValues, function (err, results) {

            if (err) {
                return res.json(err);
            } else {

                for (i in results) {
                    var resObject = {
                        "place": {
                            "address": {
                                "street-level": results[i].street_level,
                                "city-name": results[i].city_name,
                                "state": results[i].state,
                                "zip-code": results[i].zip_code
                            },
                            "name": results[i].place_name,
                            "rooms": results[i].rooms_count,
                            "bathrooms": results[i].bathrooms_count,
                            "area": results[i].area_squnit,
                            "price": results[i].price,
                            "phone": results[i].phone_number,
                            "email": results[i].email,
                            "description": results[i].description,
                            "place_id": results[i].place_id
                        }
                    }
                    resultObject.list.push(resObject);
                }
                return res.json(resultObject);
            }


        });


    });

    tenantRouter.route('/getPlace/:placeId').get(function (req, res) {
        //get placeId
        var placeId = req.params.placeId;

        var query = connection.query('select * from Place where place_id = ?', [placeId], function (err, results) {

            if (err) {
                return res.json(err);
            } else {
                var addressid = results[0].address_id;

                var query = connection.query('select * from Address where address_id = ?', [addressid], function (err2, results2) {

                    if (err2) {
                        return res.json(err);
                    } else {

                        var resObject = {
                            "place": {
                                "address": {
                                    "street-level": results2[0].street_level,
                                    "city-name": results2[0].city_name,
                                    "state": results2[0].state,
                                    "zip-code": results2[0].zip_code
                                },
                                "name": results[0].place_name,
                                "rooms": results[0].rooms_count,
                                "bathrooms": results[0].bathrooms_count,
                                "area": results[0].area_squnit,
                                "price": results[0].price,
                                "phone": results[0].phone_number,
                                "email": results[0].email,
                                "description": results[0].description
                            }
                        }
                        return res.json(resObject);
                    }
                });
            }
        });
    });


    tenantRouter.route('/favouritePlace/:placeId').post(function (req, res) {

        //get token from header, hardcoded here
        var token = req.get('token');
        var placeId = req.params.placeId;   


        var query = connection.query("select user_id from Users where token = ?", [token], function (err, results) {

            if (err) {
                console.log(err);
                return res.json(err);
            } else {
                var userId = results[0].user_id;
                console.log(results);
                console.log(results[0].user_id);
                var values = {
                    user_id: userId,
                    place_id: placeId,
                };

                var query = connection.query("insert into Favourites SET ?", values, function (err2, results2) {

                    if (err2) {
                        console.log(err2);
                        return res.json(err2);
                    } else {
                        return res.json({"result": "true"});
                    }
                });
            }
        });
    });

    tenantRouter.route('/getAllfavouritePlace').get(function (req, res) {

        //get token from header, hardcoded here
        var token = req.get('token');
        var placeId = req.params.placeId;


        var query1 = connection.query("select user_id from Users where token = ?", [token], function (err, results) {

            if (err) {
                return res.json(err);
            } else {
                var userId = results[0].user_id;

                var resultObject = {"list": []};
                var query2 = connection.query("select place_id from Favourites where user_id = ?", [userId], function (err2, results2) {

                    if (err2) {
                        return res.json(err);
                    } else {
                        //loop through all the results
                        async.forEachOfSeries(results2, function(placeId, key, next) {
                            // console.log(placeId.place_id);

                            var query3 = connection.query('select * from Place where place_id = ?', [placeId.place_id], function (err3, results3) {

                                if (err3) {
                                    return res.json(err3);
                                } else {

                                    // console.log(results3);
                                    var addressid = results3[0].address_id;
                                    // console.log(addressid);

                                    var query4 = connection.query('select * from Address where address_id = ?', [addressid], function (err4, results4) {

                                        if (err4) {
                                            return res.json(err4);
                                        } else {

                                            var resObject = {
                                                "place": {
                                                    "address": {
                                                        "street-level": results4[0].street_level,
                                                        "city-name": results4[0].city_name,
                                                        "state": results4[0].state,
                                                        "zip-code": results4[0].zip_code
                                                    },
                                                    "name": results3[0].place_name,
                                                    "rooms": results3[0].rooms_count,
                                                    "bathrooms": results3[0].bathrooms_count,
                                                    "area": results3[0].area_squnit,
                                                    "price": results3[0].price,
                                                    "phone": results3[0].phone_number,
                                                    "email": results3[0].email,
                                                    "description": results3[0].description,
                                                    "place_id": results3[0].place_id
                                                }
                                            }

                                            //add the json object to list
                                            console.log(resObject);
                                            resultObject.list.push(resObject);
                                            next();
                                            // console.log(resultObject.list);
                                        }
                                    });
                                }
                            });

                        }, function(looperr){
                                // if any of the loop processing produced an error, err would equal that error
                                if( looperr ) {
                                    // One of the iterations produced an error.
                                    return res.json(looperr);
                                } else {
                                    console.log("everything is processed");
                                    return res.json(resultObject);
                                }
                        });
                    }
                });
            }
        });
    });

    tenantRouter.route('/saveSearch/:tenantId').post(function (req, res) {
        // the request will contain tenant id.
        // we use this id and verify whether the tenant is logged in
        // then we will save the search
    });

    return tenantRouter;
};


module.exports = routes;