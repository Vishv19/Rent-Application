/**
 * Created by shikher on 30-Apr-16.
 */

var express = require('express');
var async = require('async');
var nodemailer =require('./sendmail.js')

function mailDetails(body, userName) {

  var recipient = body.recipient;
  var subject = body.subject;
  var message = body.message;

  var mailOptions = {
    from: userName + ' via <' + 'rentz.application@gmail.com' + '>',
    to: recipient,
    subject: subject,
    text: message,

  };
  return mailOptions;
}

function returnImageUrls(jsonImageList) {
    var urlList = [];
    for(var i = 0; i < jsonImageList.length; i++) {
        urlList.push(jsonImageList[i].image_url);
    }
    return urlList;
}

var routes = function (connection) {

    var landlordRouter = express.Router();

    landlordRouter.route('/addPlace').post(function (req, res) {

        var street = req.body.place.address.street;
        var city = req.body.place.address.city;
        var state = req.body.place.address.state;
        var zip = req.body.place.address.zip;

        var name = req.body.place.name;
        var rooms = req.body.place.rooms;
        var bathrooms = req.body.place.bathrooms;
        var area = req.body.place.area;
        var price = req.body.place.price;
        var phone = req.body.place.phone;
        var email = req.body.place.email;
        var propertytype = req.body.place.propertytype;
        var imageurllist = req.body.place.imageurllist;
        var description = req.body.place.description;
        var token = req.get('token');

        //create a new address row and add it to address table
        var values = {
            street_level: street,
            city_name: city,
            state: state,
            zip_code: zip
        };

        var query = connection.query("select * from Users where email_id = ?", [token], function (err, results) {

            var query2 = connection.query('INSERT INTO Address SET ?', values, function (err2, results2) {

                if (err2) {
                    return res.json(err2);
                }
                else {

                    var addressid = results2.insertId;

                    var placevalues = {
                        address_id: addressid,
                        place_name: name,
                        rooms_count: rooms,
                        bathrooms_count: bathrooms,
                        area_squnit: area,
                        price: price,
                        phone_number: phone,
                        email: email,
                        description: description,
                        page_visits_count: 0,
                        occupied: 0,
                        property_type:propertytype
                    };

                    var query3 = connection.query('INSERT INTO Place SET ?', placevalues, function (err3, results3) {
                        var placeId = results3.insertId;
                        if (err3) {
                            console.log(err3);
                            return res.json(err3);
                        }
                        else {
                            //Update the userPlace table
                            userplacevalues = {
                                user_id: results[0].user_id,
                                place_id: placeId
                            };
                            var query4 = connection.query('INSERT INTO UserPlace SET ?', userplacevalues, function (err4, results4) {

                                if (err4) {
                                    return res.json(err4);
                                }

                                //if imageurlist is not empty then check array and update entries in pictures
                                if(imageurllist.length !== 0) {
                                    async.forEachOfSeries(imageurllist, function(image, index, next) {

                                        var picvalues = {
                                            image_url: image,
                                            place_id: placeId
                                        }

                                        var query5 = connection.query('INSERT INTO Pictures SET ?', picvalues, function (imgerr, results5) {
                                            if(!imgerr) next();
                                        });

                                        }, function(looperr){
                                            if( looperr ) {
                                                // One of the iterations produced an error.
                                                console.log(looperr);
                                            } else {
                                                var mailbody = {
                                                    recipient: results[0].email_id,
                                                    subject: "New posting done from your account",
                                                    message:"Hi, A new Posting has been created from your account. We will keep you updated on it."
                                                }
                                                var mailOptions = mailDetails(mailbody, "Rentz");
                                                nodemailer.sendmail(mailOptions, function(err5, sendMailResponse) {
                                                    if(err5) return res.json(err5);
                                                    return res.json({"result": "true"});
                                                });
                                            }
                                    });
                                }
                                //if no image to upload then send an email at the end
                                else {
                                    var mailbody = {
                                        recipient: results[0].email_id,
                                        subject: "New posting done from your account",
                                        message:"Hi, A new Posting has been created from your account. We will keep you updated on it."
                                    }
                                    var mailOptions = mailDetails(mailbody, "Rentz");
                                    nodemailer.sendmail(mailOptions, function(err5, sendMailResponse) {
                                        if(err5) return res.json(err5);
                                        return res.json({"result": "true"});
                                    });
                                }
                            });
                        }
                    });
                }
            });
        });
    });


    landlordRouter.route('/getPlace/:placeId').get(function (req, res) {

        //get placeId
        var placeId = req.params.placeId;

        var query = connection.query('select * from Place where place_id = ?', [placeId], function (err, results) {

            if (err) {
                return res.json(err);
            } else {
                var addressid = results[0].address_id;

                var query2 = connection.query('select * from Address where address_id = ?', [addressid], function (err2, results2) {

                    if (err2) {
                        return res.json(err);
                    } else {

                        var visits_count = results[0].page_visits_count + 1;
                        var query3 = connection.query('update Place SET page_visits_count = ? where place_id = ?', [visits_count, placeId], function (err3, results3) {
                            if(err3) return res.json(err3);
                            else {
                                var query4 = connection.query('select * from Pictures where place_id = ?', [placeId], function (err4, results4) {
                                    if(err4) {
                                        return res.json(err4);
                                    }
                                    else {
                                        var imageurls = returnImageUrls(results4);
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
                                                "page_visits_count":visits_count,
                                                "description": results[0].description,
                                                "propertytype": results[0].property_type,
                                                "place_id": results[0].place_id,
                                                "imageurllist":imageurls
                                            }
                                        }
                                        return res.json(resObject);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });


    landlordRouter.route('/updatePlace/:placeId').put(function (req, res) {

        var placeId = req.params.placeId;
        var token = req.get('token');

        var street = req.body.place.address.street;
        var city = req.body.place.address.city;
        var state = req.body.place.address.state;
        var zip = req.body.place.address.zip;

        var name = req.body.place.name;
        var rooms = req.body.place.rooms;
        var bathrooms = req.body.place.bathrooms;
        var area = req.body.place.area;
        var price = req.body.place.price;
        var phone = req.body.place.phone;
        var email = req.body.place.email;
        var propertytype = req.body.place.propertytype;
        var imageurllist = req.body.place.imageurllist;
        var description = req.body.place.description;

        var queryuser = connection.query("select * from Users where email_id = ?", [token], function (usrerr, userresults) {
            if(usrerr) return res.json(err);
            else {
                var query = connection.query('select * from Place where place_id = ?', [placeId], function (err, results) {

                    if (err) {
                        console.log("Err " + err);
                        return res.json(err);
                    } else {
                        var addressid = results[0].address_id;

                        var query2 = connection.query('update Address SET street_level = ? ,city_name = ?,state = ? ,zip_code = ? where address_id = ?', 
                            [street, city, state, zip, addressid], function (err2, results2) {

                            if (err2) {
                                console.log("Err2 " + err2);
                                return res.json(err);
                            } else {

                                var query3 = connection.query( 'update Place SET place_name = ?, rooms_count = ?, bathrooms_count = ? ,area_squnit = ? ,price = ?,phone_number = ?,email = ?,description = ?, property_type =? where place_id = ?'
                                , [name, rooms, bathrooms, area, price, phone, email, description,propertytype, placeId], function (err3, results3) {

                                    if (err3) {
                                        console.log("Err3 " + err3);
                                        return res.json(err);
                                    }
                                    if(imageurllist.length !== 0) {
                                        var query4 = connection.query('delete from Pictures where place_id = ?', [placeId], function (err4, results4) {
                                            if(!err4) {
                                                async.forEachOfSeries(imageurllist, function(image, index, next) {

                                                var picvalues = {
                                                    image_url: image,
                                                    place_id: placeId
                                                }

                                                var query5 = connection.query('INSERT INTO Pictures SET ?', picvalues, function (imgerr, results5) {
                                                    if(!imgerr) next();
                                                });

                                                }, function(looperr){
                                                    if( looperr ) {
                                                        // One of the iterations produced an error.
                                                        console.log(looperr);
                                                    } else {
                                                        var mailbody = {
                                                            recipient: userresults[0].email_id,
                                                            subject: "Posting has been updated from your account",
                                                            message:"Hi, A Posting has been changed from your account. We will keep you updated on it."
                                                        }
                                                        var mailOptions = mailDetails(mailbody, "Rentz");
                                                        nodemailer.sendmail(mailOptions, function(err5, sendMailResponse) {
                                                            if(err5) return res.json(err5);
                                                            return res.json({"result": "true"});
                                                        });
                                                    }
                                            });
                                            }
                                        });
                                    }
                                    else {
                                        return res.json({"result": "true"});
                                    }
                                });
                            }
                        });
                    }
                });                
            }

        });

    });

    landlordRouter.route('/deletePlace/:placeId').delete(function (req, res) {

        // it will involve two scenarios
        // 1. Place has been rented
        // 2. Place has been cancelled or removed

        var placeId = req.params.placeId;

        var query = connection.query('delete from Place where place_id = ?', [placeId], function (err, results) {

            if (err) {
                return res.json(err);
            } else {
                return res.json({"result": "true"});
            }
        });
    });

    landlordRouter.route('/uploadImage/:place_id').post(function (req, res) {
        var imageurl = req.body.imageurl;
        var placeid = req.params.place_id;

        var values = {
            image_url: imageurl,
            place_id: placeid
        }

        var query = connection.query('INSERT INTO Pictures SET ?', values, function (err, results) {
            if(err) {
                console.log(err);
                return res.json(err);
            }
            return res.json({upload:"true"});
        });
    });

    landlordRouter.route('/getPlaceList/').get(function (req, res) {
        //the request will return all places associated with a particular landlord

        var landlordToken = req.get('token');

        var query = connection.query('select user_id from Users where email_id = ?', [landlordToken], function (err, results) {

            if (err) {
                return res.json(err);
            } else {

                var userId = results[0].user_id;


                //result json object which contains everything
                var resultObject = {"list": []};


                var query2 = connection.query('select place_id from UserPlace where user_id = ?', [userId], function (err2, results2) {

                    if (err2) {
                        return res.json(err2);
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

                                        var query5 = connection.query('select * from Pictures where place_id = ?', [placeId.place_id], function (err5, results5) {
                                            if (err4) {
                                                return res.json(err4);
                                            } else {
                                                var imageurls = returnImageUrls(results5);
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
                                                        "place_id": results3[0].place_id,
                                                        "imageurllist": imageurls
                                                    }
                                                }

                                                //add the json object to list
                                                console.log(resObject);
                                                resultObject.list.push(resObject);
                                                next();
                                                // console.log(resultObject.list);
                                            }
                                        });
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


    return landlordRouter;
};



module.exports = routes;