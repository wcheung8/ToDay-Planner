import {Component, OnInit, ViewChild} from '@angular/core';

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

  reset() {
    this.stops= [];
  }

  ngOnInit() {
  }
}
