import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { Station } from '../../station';
import { PlacesService } from '../../places.service';

@Component({
  selector: 'app-alert-table',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './alert-table.component.html',
  styleUrls: ['./alert-table.component.css']
})
export class AlertTableComponent implements OnInit, OnDestroy {

  stations: Station[];

  displayedColumns = ['id', 'stationName', 'availableBikes', 'availableDocks', 'is_renting', 'lastCommunicationTime', 'latitude',
  'longitude', 'status', 'totalDocks'];

  constructor(private placesService: PlacesService) { }

  ngOnInit() {
    this.fetchStations();
  }

  ngOnDestroy() {
    if (this.delay) {
      this.delay = null;
    }
  }

  fetchStations() {
    this.placesService
      .findAllStationDock()
      .subscribe(async(data: Station[]) => {
        this.stations = data;
        await this.delay(18000);
        this.fetchStations();
      });
  }

  delay(ms: number) {
    console.log('In delay');
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
}
