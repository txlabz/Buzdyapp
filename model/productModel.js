var db = require('../db');
var mysql = require('mysql');

module.exports.getbyID_model = function (id) {
    console.log('DEAL id must be', id);

    var dealid = parseInt(id);
    console.log('after parse', id);

    var queryString = "SELECT * FROM products WHERE id = ?";
    return new Promise(function (resolve, reject) {
        db.query(queryString, [dealid], function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);

                console.log('inside else model for get products by id');
            }

        });
    });
};

module.exports.getbyFilters_model = function (inputs) {
    console.log('parameters received are', inputs);

    // var dealid = parseInt(id);
    // console.log('after parse', id);
    var pagenumber = 0;
    var pagesize = 5;
    var myradius = 30;
    var user = '%user';


    var queryString = "SELECT * FROM products JOIN users on users.id = products.productable_id";
    if (inputs.fav) {
        var fav = parseInt(inputs.fav);
        if (fav > 0) {
            queryString += ' JOIN fav_merchant on users.id=fav_merchant.merchant_id WHERE fav_merchant.user_id=' + mysql.escape(inputs.userid);
        }
    }
    if (inputs.page_no) {
        pagenumber = inputs.page_no;
    }
    if (inputs.pagesize) {
        pagesize = inputs.pagesize;
    }
    if (inputs.merchant_id) {

        var id = parseInt(inputs.merchant_id);
        if (queryString.includes('WHERE')) {
            queryString += ' AND products.productable_id = ' + mysql.escape(id);

        } else
            queryString += ' WHERE products.productable_id = ' + mysql.escape(id);

    }
    if (inputs.city) {
        if (queryString.includes('WHERE')) {
            queryString += ' AND users.city = ' + mysql.escape(inputs.city);

        } else
            queryString += ' WHERE users.city = ' + mysql.escape(inputs.city);

    }
    if (inputs.country) {
        if (queryString.includes('WHERE')) {
            queryString += ' AND users.country = ' + mysql.escape(inputs.country);

        } else
            queryString += ' WHERE users.country = ' + mysql.escape(inputs.country);

    }

    if (inputs.latitude && inputs.longitude) {
        if (inputs.radius) {
            myradius = inputs.radius;
        }
        if (queryString.includes('WHERE')) {
            queryString += 'AND (3959 * acos(cos(radians(' + mysql.escape(inputs.latitude) + '))*cos(radians(latitude))*cos(radians(longitude) - radians(' + mysql.escape(inputs.longitude) + ')) + sin(radians(' + mysql.escape(inputs.latitude) + ')) * sin(radians(latitude)))) >' + mysql.escape(myradius);
        } else
            queryString += ' WHERE (3959 * acos(cos(radians(' + mysql.escape(inputs.latitude) + '))*cos(radians(latitude))*cos(radians(longitude) - radians(' + mysql.escape(inputs.longitude) + ')) + sin(radians(' + mysql.escape(inputs.latitude) + ')) * sin(radians(latitude)))) >' + mysql.escape(myradius);
    }

    if (queryString.includes('WHERE')) {
        queryString += ' AND products.productable_type LIKE' + mysql.escape(user);
    } else {
        queryString += ' WHERE products.productable_type LIKE' + mysql.escape(user);

    }
    queryString += ' LIMIT ' + pagesize + ' OFFSET ' + pagenumber;

    return new Promise(function (resolve, reject) {
        db.query(queryString, function (err, result) {
            if (err) {
                console.log('Error while getting products by filters', err);
                reject(err);
            } else {
                resolve(result);

                console.log('inside else model for get all merchants');
            }

        });
    });
};


module.exports.addProduct_model = function (inputs) {
    console.log('products array must be', inputs);
    var type = "";
    if (inputs.productable_type == 'user') {
        inputs.productable_type = 'App\\Models\\User';
    } else {
        inputs.productable_type = 'App\\Models\\Bank';
    }

    var queryString = "INSERT into products SET ?";
    return new Promise(function (resolve, reject) {
        db.query(queryString, [inputs], function (err, result) {
            if (err) {
                console.log('Error while adding product', err);
                reject(err);
            } else {

                console.log('Inside model result is', result);
                resolve(result);

                console.log('inside else model for adding product');
            }

        });
    });
};

module.exports.compare = function (input) {
    console.log('Ids received are', input);

    var values = input.split(',');
    console.log('After split', values);

    var checkquery = 'select count(distinct category_id) as number from products where id IN (' + mysql.escape(values) + ')';
    console.log('checkquery is', checkquery);
    return new Promise(function (resolve, reject) {

        db.query(checkquery, function (err, checkresult) {
            if (err || checkresult[0].number > 1) {
                // console.log('error occurred', err);
                console.log('check result is', checkresult[0].number);

                reject('categories must be same');
            } else {
                console.log('category is not greater than 1');
                var queryString = 'select * from products where id IN (' + mysql.escape(values) + ')';
                db.query(queryString, function (err, result) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }

                });


            }
        });


    });


};