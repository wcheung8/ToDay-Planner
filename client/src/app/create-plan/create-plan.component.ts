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

  stops = [];

  types = ["Any", "Attraction", "Sightseeing", "Food"]
  options = {
    types: ['establishment']
  };
  log = "";

  postUrl = "/api/login"

  constructor(private http: HttpClient) {

  }

  addStop() {
    this.stops.push({type: "Any", location: "", name: ""});
  }

  submit() {
    this.getPlan()
      .subscribe(plan => this.stops = plan);
  }

  getPlan() {
    return this.http.post<any[]>(this.postUrl, this.stops, httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  reset() {
    this.stops = [];
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

  ngOnInit() {
  }
}
