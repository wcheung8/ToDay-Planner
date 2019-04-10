import {Component, OnInit, ViewChild} from '@angular/core';
import {GooglePlaceDirective} from "ngx-google-places-autocomplete";
import {Address} from "ngx-google-places-autocomplete/objects/address";

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

  constructor() {

  }

  addStop() {
    this.stops.push({type: "Any", location: "", name:""});
  }

  submit() {

  }

  ngOnInit() {
  }
}
