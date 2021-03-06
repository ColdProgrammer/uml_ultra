////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////


/// This file and the source code provided can be used only for
/// the projects and assignments of this course

/// Last Edit by Dr. Atef Bader: 1/30/2019


////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////



import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Place } from '../../place';
import { PlacesService } from '../../places.service';


const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};



@Component({
  selector: 'app-list-of-places',
  templateUrl: './list-of-places.component.html',
  styleUrls: ['./list-of-places.component.css']
})


export class ListOfPlacesComponent implements OnInit {

  uri = 'http://localhost:4000';

  places: Place[] = [];

  displayedColumns = ['name', 'display_phone', 'address1', 'is_closed', 'rating', 'review_count', 'Divvy'];

  constructor(private placesService: PlacesService, private router: Router, private http: HttpClient) { }

  // This function is called when the function initalizes.
  ngOnInit() {
    this.fetchPlaces();
  }

  // This function fetches the data for place selected.
  fetchPlaces() {
    this.placesService
      .getPlaces()
      .subscribe((data: Place[]) => {
        this.places = data;
      });
  }

  // This function is called when divvy nearby button is clicked.
  findStations(placeName) {
    let place_selected = null;
    for (let i = 0, len = this.places.length; i < len; i++) {
      if ( this.places[i].name === placeName ) { // strict equality test
          place_selected =  this.places[i];
          break;
      }
    }
    this.placesService.findStations(place_selected).subscribe(() => {
      this.router.navigate(['/list_of_stations']);
    });
  }
}
