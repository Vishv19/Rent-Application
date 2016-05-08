/**
 * Created by shikher on 30-Apr-16.
 */

var express = require('express');


var routes = function (connection) {

    var tenantRouter = express.Router();


    tenantRouter.route('/search').post(function (req, res) {

        var keywords = req.body.keywords;
        var city = req.body.city;
        var zip = req.body.zip;
        var propertyType = req.body.propertyType;
        var minPrice = req.body.priceRange.min;
        var maxPrice = req.body.priceRange.max;

        var arrayOfValues = [];
        arrayOfValues.push(city);
        arrayOfValues.push(zip);
        arrayOfValues.push(minPrice);
        arrayOfValues.push(maxPrice);

        var resultObject = {"list": []};


        var queryString = 'select * from Place,Address where Address.city_name = ? AND Address.zip_code = ? AND Place.price > ? AND Place.price < ?';

        for (var keyword in keywords) {
            queryString = queryString + ' OR Place.description LIKE \'?\'';
            arrayOfValues.push(keyword);
        }


        var query = connection.query(queryString, arrayOfValues, function (err, results) {

            if (err) {
                return res.json(err);
            } else {

                for (var result in results) {

                    var resObject = {
                        "place": {
                            "address": {
                                "street-level": result.street_level,
                                "city-name": result.city_name,
                                "state": result.state,
                                "zip-code": result.zip_code
                            },
                            "name": result.place_name,
                            "rooms": result.rooms_count,
                            "bathrooms": result.bathrooms_count,
                            "area": result.area_squnit,
                            "price": result.price,
                            "phone": result.phone_number,
                            "email": result.email,
                            "description": result.description
                        }
                    }
                    resultObject.list.push(resObject);
                }

                return resultObject;
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
        var token = 1;
        var placeId = req.params.placeId;


        var query = connection.query("select user_id from Users where token = ?", [token], function (err, results) {

            if (err) {
                return res.json(err);
            } else {
                var userId = results[0].user_id;

                var query = connection.query("insert into Favourites SET ?", [userId, placeId], function (err2, results2) {

                    if (err2) {
                        return res.json(err);
                    } else {
                        return res.json({"result": "true"});
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