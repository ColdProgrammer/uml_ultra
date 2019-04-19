import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dasboard-display',
  templateUrl: './dasboard-display.component.html',
  styleUrls: ['./dasboard-display.component.css']
})
export class DasboardDisplayComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  // Function to plot graphs according to time range
  plotLineHour(time) {
    // This function is called when one clicks on Dropdown time range
    console.log('placeName');
    console.log(this.stations);
    let place_selected = null;
        place_selected =  this.stations[0];
    console.log(place_selected);
    this.placesService.findStationLogstash(place_selected, time).subscribe(() => {
      this.router.navigate(['/sma-line-chart-divvy',  { time: time}]);
      });
  }
}
