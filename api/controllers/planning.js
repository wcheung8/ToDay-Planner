var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');

var sendJSONresponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

module.exports.plan = function(req, res) {

    var stops = req.body.stops;
    console.log(stops);
    var text = '';
    for (var i = 0; i < stops.length; i++) {
        text += stops[i] + "<br>";
    }

    console.log(text);


    sendJSONresponse(res, 200, text);

};