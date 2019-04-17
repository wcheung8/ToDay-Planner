import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {HttpHeaders} from '@angular/common/http';
import {throwError} from "rxjs/internal/observable/throwError";
import {catchError} from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  })
};

const attraction_types = ['any',
  'food',
  'culture',
  'education',
  'nature',
  'religion',
  'shopping',
  'other'];


const postUrl = "/api/plan";
const databaseUrl = "https://todayplanner.herokuapp.com/attraction/all";
const APIkey = "";
const beam_size = 1;
const query_size = 1;

function dist(x1, y1, x2, y2) {
  var a = x1 - x2;
  var b = y1 - y2;
  return Math.sqrt(a * a + b * b);
}

function findDirections(stops, directionsService, travelMode = 'DRIVING') {

  var waypoints = []

  for (var i = 1; i < stops.length - 1; i++) {

    waypoints.push({
      location: stops[i].addr
    });
  }
  var request = {
    origin: stops[0].addr,
    destination: stops[stops.length - 1].addr,
    waypoints: waypoints,
    travelMode: travelMode
  };

  return new Promise(function (resolve, reject) {
    directionsService.route(request, function (results, status) {
      if (status === 'OK') {
        resolve(results);
      } else {
        reject(new Error('Couldnt\'t find the location '));
      }
    })
  })
}

function getAllDirections(directionsService, plans, travelMode = 'DRIVING') {
  let directionData = [];
  for (let i = 0; i < plans.length; i++) {
    directionData.push(findDirections(plans[i].route, directionsService, travelMode))
  }
  return directionData // array of promises
}

@Component({
  selector: 'app-create-plan',
  templateUrl: './create-plan.component.html',
  styleUrls: ['./create-plan.component.css']
})

export class CreatePlanComponent implements OnInit {
  city;
  lng;
  lat;
  stops = [{type: "any"}];
  types = attraction_types;
  log = "";


  constructor(private http: HttpClient) {
  }

  addStop() {
    this.stops.push({type: "any"});
  }


  async createPlan(attractions) {

    // init 'any' option
    let any = []

    for (var i in attractions) {
      Array.prototype.push.apply(any, attractions[i]);
    }
    attractions['any'] = any;


    // init start positions
    let stop = this.stops[0];

    let options = attractions[stop.type];
    console.log(options)

    //check empty
    if (!this.notDefined(stop.name)) {
      options = [stop];
      console.log(stop);
    }

    let dp = new Array(options.length);
    for (let t = 0; t < options.length; t++) {
      dp[t] = {};
      dp[t].lat = options[t].lat;
      dp[t].lng = options[t].lng;
      dp[t].id = options[t].id;
      dp[t].plans = []
      let p = {cost: 0, route: [options[t]], locations: new Set([options[t].id])};
      dp[t].plans.push(p);
    }

    // iterate through entire plan
    for (let i = 1; i < this.stops.length; i++) {

      let stop = this.stops[i];

      console.log("stop:");
      console.log(stop);
      console.log("i:" + i);

      let options = attractions[stop.type];

      // if stop is already chosen then calc best route to stop
      if (!this.notDefined(stop.name)) {
        options = [stop];
      }

      // iterate through route options
      console.log(options);
      let tmp = new Array(options.length);
      for (let t = 0; t < options.length; t++) {
        tmp[t] = {};
        tmp[t].lat = options[t].lat;
        tmp[t].lng = options[t].lng;
        tmp[t].id = options[t].id;
        tmp[t].plans = [];

        // keep track of which options have been selected
        let tracking = new Array(dp.length).fill(0);

        // repeat until beam is full
        for (let count = 0; count < beam_size; count++) {
          let best = -1;
          let bestCost = 999;

          // iterate through possible previous positions
          for (let j = 0; j < dp.length; j++) {


            // check if plans used up
            if (tracking[j] >= dp[j].plans.length)
              continue;

            let currPlan = dp[j].plans[tracking[j]];

            // check if option is in current plan
            if (currPlan.locations.has(options[t].id)) {
              tracking[j]++;
              continue
            }

            // compute cost and compare to current optimal
            let cost = dist(options[t].lat, options[t].lng, dp[j].lat, dp[j].lng);
            if (best == -1 || cost + currPlan.cost < bestCost) {
              best = j;
              bestCost = cost + currPlan.cost;
            }
          }

          // skip if no feasible plans available
          if (best == -1) {
            continue;
          }

          // choose best plan and update values (route, cost, location)
          let best_plan = dp[best].plans[tracking[best]];
          tracking[best]++;

          let new_cost = dist(options[t].lat, options[t].lng, dp[best].lat, dp[best].lng) + best_plan.cost;
          let new_route = best_plan.route.concat([options[t]]);
          let new_locations = new Set(best_plan.locations)

          new_locations.add(options[t].id);
          tmp[t].plans.push({cost: new_cost, route: new_route, locations: new_locations});

        }
      }
      dp = tmp;
    }

    console.log('dp:')
    console.log(dp)


    // iterate through possible previous positions and add to pool
    let allPlans = []
    for (let i = 0; i < dp.length; i++) {
      Array.prototype.push.apply(allPlans, dp[i].plans);
    }

    let directionsService = new google.maps.DirectionsService();
    let locations = getAllDirections(directionsService, allPlans, "DRIVING");

    let directions = await Promise.all(locations);


    // return best route based on google maps time estimate

    let best = -1;
    let bestCost = 999;


    return allPlans[0].route

  }

  async submit() {

    var payload = {cityName: this.city, limit: query_size};
    let attractions = await this.http.post(databaseUrl, payload, httpOptions)
      .pipe(
        catchError(this.handleError)
      ).toPromise()

    this.createPlan(attractions);

  }

  reset() {
    this.stops = [{type: "any"}];
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  };

  notDefined(x) {
    return typeof x === 'undefined'
  }

  getCityFromPosition(position) {

    var lat = position.coords.latitude;
    var lng = position.coords.longitude;
    return this.http.get("https://maps.googleapis.com/maps/api/geocode/json" +
      "?latlng=" + lat + "," + lng + "" +
      "&key=" + APIkey)
      .pipe(
        catchError(this.handleError)
      );
  }


  ngOnInit() {
    if (window.navigator && window.navigator.geolocation) {
      window.navigator.geolocation.getCurrentPosition(
        position => {

          this.lng = position.coords.longitude;
          this.lat = position.coords.latitude;

          this.getCityFromPosition(position).subscribe(info => {
            console.log(info)

            for (var i = 0; i < info['results'].length; i++) {

              var result = info['results'][i];

              for (var j = 0; i < result.address_components.length; j++) {

                var component = result.address_components[j];
                if (component.types.includes("locality")) {
                  this.city = component.long_name;
                  return
                }
              }
            }
          });
          ;
        },
        error => {
          switch (error.code) {
            case 1:
              console.log('Permission Denied');
              break;
            case 2:
              console.log('Position Unavailable');
              break;
            case 3:
              console.log('Timeout');
              break;
          }
        }
      );
    }
    ;
  }
}
