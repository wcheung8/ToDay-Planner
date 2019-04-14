import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {HttpHeaders} from '@angular/common/http';
import {throwError} from "rxjs/internal/observable/throwError";
import {catchError, retry} from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Component({
  selector: 'app-create-plan',
  templateUrl: './create-plan.component.html',
  styleUrls: ['./create-plan.component.css']
})

export class CreatePlanComponent implements OnInit {
  city;
  stops = [];

  types = ["Any", "Attraction", "Sightseeing", "Food"]
  options = {
    types: ['establishment']
  };
  log = "";

  postUrl = "/api/plan"

  constructor(private http: HttpClient) {

  }

  addStop() {
    this.stops.push({type: "Any"});
  }

  submit() {
    this.getPlan()
      .subscribe(plan => this.stops = plan);
  }

  getPlan() {
    return this.http.post<any[]>(this.postUrl, {stops: this.stops}, httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  reset() {
    this.stops = [];
    this.city = undefined;
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

  checkDefined(x) {
    return typeof x === 'undefined'
  }

  getCityFromPosition(position) {

    var lat = position.coords.latitude;
    var lng = position.coords.longitude;
    return this.http.get("https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lng + "&key=AIzaSyDO2_utkAF8Lop0EWQkHlK85ix81YAxtv4")
      .pipe(
        catchError(this.handleError)
      );
  }

  ngOnInit() {
    if (window.navigator && window.navigator.geolocation) {
      window.navigator.geolocation.getCurrentPosition(
        position => {
          this.getCityFromPosition(position).subscribe(info => {

            for (var i = 0; i < info.results.length; i++) {

              var result = info.results[i];

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
