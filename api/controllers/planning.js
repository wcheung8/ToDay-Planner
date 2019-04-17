var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');

var sendJSONresponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};

var attraction_types = ['any', 'attraction', 'sightseeing', 'food'];

function getOptions(city) {

    var options = {}

    for (var i = 0; i < attraction_types.length; i++) {
        var payload = {cityName: city, limit: 5, category: attraction_types[i]};
        this.http.post("https://todayplanner.herokuapp.com/attraction", payload, httpOptions)
            .pipe(
                catchError(this.handleError)
            ).subscribe(attractions => {
            console.log(attractions)
            options[attraction_types[i]] = attractions;
        })
    }


    return {'any': [], 'attraction': [], 'sightseeing': [], 'food': []}

}

module.exports.plan = function (req, res) {

    var stops = req.body.stops;
    var city = req.body.city;

    var options = getOptions(city);
    var dp = new Array(stops.length);


    for (var i = 0; i < dp.length; i++) {
        dp[i] = new Array(options[stops[i].type].length);
    }

    for (var i = 0; i < stops.length; i++) {

    }

    var userPlan = [];

    sendJSONresponse(res, 200, userPlan);

};