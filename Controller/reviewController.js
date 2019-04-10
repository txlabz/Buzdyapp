var review_model = require('../model/reviewModel');
var jwt = require('jsonwebtoken');
var config = require('../config');
var authHelper = require('../authHelper');
var language = require('../language');
var notify = require('../fcmhelper');
var devicesModel = require('../Model/userdeviceModel');
var notificationsModel = require('../Model/notificationsModel');

var lan = 0;

module.exports.add = function (req, response) {

    // if (req.language != 'undefined') {
    //     lan = request.language;
    // }
    req.body.user_id = req.info;
    review_model.add(req.body).then(
        function (result) {
            devicesModel.getDevicebyID(request.info).then(
                function (devicesresult) {
                    console.log('recieved Result in usercontroller for follow is ', devicesresult);
                    // notify.sendsingleAndroid(message);
                    var notification={
                        user_id:request.info,
                        title:'New Review',
                        message:'Some one just posted a review for you!'
                    }
                    notificationsModel.addNotification(notification).then(
                        function(notifyResult){
                            console.log('notify result is', notifyResult);

                        },
                        function(notifyerr){
                            console.log('notify error is', notifyerr);
                        }
                    );
                },
                function (err) {
                    console.log('Error is ', err);

                }
            ).catch(function (err) {
                console.log('error occurred, insde catch after calling devices', err);
            });
            return response.json(
                {
                    status: 1,
                    message: language.languages[0].success,
                }
            );

        },
        function (err) {
            console.log(err);
            return response.json({
                status: 0,
                message: 'Error adding a review'
            });
        }
    );

};