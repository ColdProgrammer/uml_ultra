import { Component, OnInit } from '@angular/core';
import { Station } from '../../station';
import { Location } from '../../location';
import { PlacesService } from '../../places.service';

@Component({
  selector: 'app-heatmap-divvy',
  templateUrl: './heatmap-divvy.component.html',
  styleUrls: ['./heatmap-divvy.component.css']
})

export class HeatmapDivvyComponent implements OnInit {

  private map: any = null;
  private heatmap: any = null;
  private flag = false;
  markers: Station[];
  circleRadius = 3000; // km
  private latlng =[];

  public location: Location = {
    lat: 41.882607,
    lng: -87.643548,
    label: 'You are Here',
    zoom: 12
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
    this.init();
  }

  // This function initilizes the map and fetches the data for heatmap.
  init() {
    if (!this.flag) {
      this.fetchStations(1);
    }
  }

  // This function gets data for heatmap
  fetchStations(time): any {
    this.flag = true;
    const heatmapData = [];
    this.placesService
      .findAllStationsLatLong(time)
      .subscribe((data: Station[]) => {
        for (let a of data) {
          // console.log(a);
          let b = new google.maps.LatLng(a.latitude.valueOf(), a.longitude.valueOf());
          // console.log(b);
          heatmapData.push(b);
        }
        // console.log(heatmapData);
        this.latlng = heatmapData;
        this.toggle_map();
      });
      // console.log(this.latlng);
  }

  // This function is called to save the map instance.
  onMapLoad(mapInstance: google.maps.Map) {
    this.map = mapInstance;
  }

  // This function is called to add a heatmap layer to the map.
  toggle_map(){
      const coords: google.maps.LatLng[] = this.latlng; // can also be a google.maps.MVCArray with LatLng[] inside
      // console.log(this.latlng);
      this.heatmap = new google.maps.visualization.HeatmapLayer({
          map: this.map,
          data: coords
      });
  }

  // This function is called when we select the timerange, to get different data
  changeHeatMap(time){
    this.heatmap.setMap(null);
    this.fetchStations(time);
  }
}
