////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////


/// This file and the source code provided can be used only for
/// the projects and assignments of this course

/// Last Edit by Srajan: 03/25/2019


////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////




import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material';

import { Station } from '../../station';
import { PlacesService } from '../../places.service';


import { Input, ViewChild, NgZone} from '@angular/core';
import { MapsAPILoader, AgmMap } from '@agm/core';
import { GoogleMapsAPIWrapper } from '@agm/core/services';
import { Place } from 'src/app/place';




interface Location {
  lat: number;
  lng: number;
  zoom: number;
  address_level_1?: string;
  address_level_2?: string;
  address_country?: string;
  address_zip?: string;
  address_state?: string;
  label: string;
}



@Component({
  selector: 'app-list-of-stations',
  templateUrl: './list-of-stations.component.html',
  styleUrls: ['./list-of-stations.component.css']
})
export class ListOfStationsComponent implements OnInit {

  selected = 'option1'; // Selecting 24 hour value by default (2-way binding)
  circleRadius = 3000; // km

  public location: Location = {
    lat: 41.882607,
    lng: -87.643548,
    label: 'You are Here',
    zoom: 13
  };

  stations: Station[];
  markers: Station[];
  placeSelected: Place;

  displayedColumns = ['id', 'stationName', 'availableBikes', 'availableDocks', 'is_renting', 'lastCommunicationTime', 'latitude',
  'longitude', 'status', 'totalDocks', 'LineChart', 'SMA'];


  icon = {
    url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
    scaledSize: {
      width: 60,
      height: 60
    }
  };



  constructor(private placesService: PlacesService, private router: Router) { }

  ngOnInit() {
    this.fetchStations();
    this.getPlaceSelected();


  }

  fetchStations() {
    this.placesService
      .getStations()
      .subscribe((data: Station[]) => {
        this.stations = data;
        this.markers = data;

      });
  }


  getPlaceSelected() {
    this.placesService
      .getPlaceSelected()
      .subscribe((data: Place) => {
        this.placeSelected = data;

      });
  }



clickedMarker(label: string, index: number) {
  console.log(`clicked the marker: ${label || index}`);
}

plotLineHour(placeName, time) {
  // This function is called when one clicks on Line Chart button
  console.log('placeName');
  console.log(placeName);
  console.log(this.stations);
  let place_selected = null;
  for (let i = 0, len = this.stations.length; i < len; i++) {
    if ( this.stations[i].stationName === placeName ) { // strict equality test
      place_selected =  this.stations[i];
      break;
      }
    }
  console.log(place_selected);
  this.placesService.plotLineHour(place_selected, time).subscribe(() => {
    this.router.navigate(['/line-chart-divvy',  { time: time}]);
    });
}

plotSMA(placeName) {
  // This function is called when one clicks on SMA Chart button
  let place_selected = null;
  for (let i = 0, len = this.stations.length; i < len; i++) {
    if ( this.stations[i].stationName === placeName ) { // strict equality test
      place_selected =  this.stations[i];
      break;
      }
    }
  console.log(place_selected);
  this.placesService.plotSMA(place_selected).subscribe(() => {
    this.router.navigate(['/sma-line-chart-divvy']);
    });
}







}



