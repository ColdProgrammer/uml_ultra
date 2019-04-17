import { Component } from '@angular/core';
import { PlacesService } from './places.service';
import { Station } from './station';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'ChicagoSocialHub-app';
  stations;
  constructor(private placesServ: PlacesService) {
    // placesServ.getStations_Logstash().subscribe((data: Station[]) => {
    //   this.stations = data;
    //   const stationUpdateObservable =  placesServ.getUpdates();  // 1
    //   stationUpdateObservable.subscribe((latestStatus: Station[]) => {  // 2
    //     this.stations = latestStatus;  // 3
    //   });
    // });
  }
}
