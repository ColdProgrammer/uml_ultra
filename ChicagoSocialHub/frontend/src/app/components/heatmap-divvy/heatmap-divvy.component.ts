import { Component, OnInit } from '@angular/core';
import { MapsAPILoader, AgmMap } from '@agm/core';
import { GoogleMapsAPIWrapper } from '@agm/core/services';

import { Station } from '../../station';
import { Location } from '../../location';
import { PlacesService } from '../../places.service';

// declare var google: any;

@Component({
  selector: 'app-heatmap-divvy',
  templateUrl: './heatmap-divvy.component.html',
  styleUrls: ['./heatmap-divvy.component.css']
})


export class HeatmapDivvyComponent implements OnInit {

  private map: any = null;
  private heatmap: any = null;
  markers: Station[];
  circleRadius = 3000; // km
  private latlng =[];

  public location: Location = {
    lat: 41.882607,
    lng: -87.643548,
    label: 'You are Here',
    zoom: 10
  };

  icon = {
    url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
    scaledSize: {
      width: 60,
      height: 60
    }
  };

  constructor(private placesService: PlacesService) { }

  ngOnInit() {
    this.fetchStations();
  }

  fetchStations() {
    this.placesService
      .getAllStationsLatLong()
      .subscribe((data: Station[]) => {
        // for (const a of data) {
        //   console.log(a);
        //   const b = new google.maps.LatLng(a.latitude.valueOf(), a.longitude.valueOf());
        //   console.log(b);
        //   this.heatmapData.push(b);
        // }
      });
  }

  onMapLoad(mapInstance: google.maps.Map) {
    this.map = mapInstance;
    console.log(this.map)
    let heatmapData =[];
    // here our in other method after you get the coords; but make sure map is loaded
    this.placesService
      .getAllStationsLatLong()
      .subscribe((data: Station[]) => {
        for (let a of data) {
          // console.log(a);
          let b = new google.maps.LatLng(a.latitude.valueOf(), a.longitude.valueOf());
          // console.log(b);
          heatmapData.push(b);
        }
        console.log(heatmapData);
        this.latlng = heatmapData;
      });
    const coords: google.maps.LatLng[] = heatmapData; // can also be a google.maps.MVCArray with LatLng[] inside
    console.log(heatmapData);
    this.heatmap = new google.maps.visualization.HeatmapLayer({
        map: this.map,
        data: coords
    });
}

toggle_map(){
    const coords: google.maps.LatLng[] = this.latlng; // can also be a google.maps.MVCArray with LatLng[] inside
    console.log(this.latlng);
    this.heatmap = new google.maps.visualization.HeatmapLayer({
        map: this.map,
        data: coords
    });
}
}
