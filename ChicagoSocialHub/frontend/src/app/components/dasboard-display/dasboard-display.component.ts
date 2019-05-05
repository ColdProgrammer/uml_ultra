import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {Location} from '@angular/common';
import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import { delay } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { Station } from '../../station';
import { PlacesService } from '../../places.service';

@Component({
  selector: 'app-dasboard-display',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './dasboard-display.component.html',
  styleUrls: ['./dasboard-display.component.css']
})

export class DasboardDisplayComponent implements OnInit, OnDestroy {

  title = 'Line Charts';
  stations: Station[];
  private margin = {top: 20, right: 20, bottom: 30, left: 50};
  private width: number;
  private hide_30 = false;
  private time = 1;
  private hide_720 = false;
  private height: number;
  private place_selected = null;
  private x: any;
  private y: any;
  private svg: any;
  private line: d3Shape.Line<[number, number]>;
  check_sma_30 = false;
  check_sma_720 = false;

  constructor(private placesService: PlacesService, private router: Router) {
    this.width = 1200 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;
  }

  // This function is called when the page is initialized.
  ngOnInit() {
    this.fetchStations();
  }

  // This Function is called when the page is destroyed.
  ngOnDestroy() {
    if (this.delay) {
      this.delay = null;
    }
  }

  // This function fetches the data and displays the chart.
  fetchStations() {
    this.placesService
      .getStations_Logstash()
      .subscribe(async (data: Station[]) => {
        this.stations = data;
        this.place_selected =  this.stations[0];
        // console.log(data);
        this.initSvg();
        this.initAxis(this.stations);
        // console.log(this.stations);
        this.drawAxis();
        this.drawLine(this.stations);
        if (this.time == 1) {
          await this.delay(180000);
          if (this.time == 1) {
            this.placesService.findStationLogstash(this.place_selected, this.time).subscribe(() => {
              this.check_sma_30 = false;
              this.check_sma_720 = false;
              this.fetchStations();
              });
            }
        }
      });
  }

  // Function to plot graphs according to time range
  plotLineHour(time) {
    // This function is called when one clicks on Dropdown time range
    this.time = time;
    // console.log('placeName');
    // console.log(this.stations);
    this.place_selected =  this.stations[0];
    // console.log(this.place_selected);
    this.placesService.findStationLogstash(this.place_selected, time).subscribe(() => {
      this.check_sma_30 = false;
      this.check_sma_720 = false;
      this.fetchStations();
    });
  }

  // This function is called when the PieChart button is clicked.
  plotPieChart() {
    this.placesService.findPieChart().subscribe(() => {
      this.router.navigate(['/pie-chart-divvy']);
    });
  }

  // This is a timeout function which executes for a given time
  delay(ms: number) {
    // console.log('In delay');
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  // This function is called when the checkbox for SMA 30 is called
  plotSMA30() {
    if (this.check_sma_30 === false) {
      // console.log('checkbox 30 chedin');
      // Plot SMA30
      this.hide_30 = false;
      const	valueline  = d3Shape.line()
                                .x( (d: any) => this.x(d.x_axis.toString()) )
                                .y( (d: any) => this.y(d.sma_30) );
      this.svg.append('path')
              .datum(this.stations)
              .attr('class', 'line-sma-30')
              .attr('ng-hide', this.hide_30)
              .attr('d', valueline);
    } else if (this.check_sma_30 === true) {
      // console.log('checkbox 30 checkedout');
      // Remove SMA 30 plot
      const iEl = d3.select('.line-sma-30');
      iEl.remove();
      this.hide_30 = true;
    }
  }

  // This function is called when the checkbox plot sma 720 is called.
  plotSMA720() {
    if (this.check_sma_720 === false) {
      // console.log('checkbox 720 chedin');
      // Plot SMA30
      this.hide_720 = false;
      const	valueline  = d3Shape.line()
                                .x( (d: any) => this.x(d.x_axis.toString()) )
                                .y( (d: any) => this.y(d.sma_720) );
      this.svg.append('path')
              .datum(this.stations)
              .attr('class', 'line-sma-720')
              .attr('ng-hide', this.hide_720)
              .attr('d', valueline);
    } else if (this.check_sma_720 === true) {
      // console.log('checkbox 720 checkedout');
      // Remove SMA 30 plot
      const iEl = d3.select('.line-sma-720');
      iEl.remove();
      this.hide_720 = true;
    }
  }

  // This function is called when the button Alert-Table is clicked.
  goToAlertTable() {
    // When the button alert table is called
    this.placesService.findPieChart().subscribe(() => {
      this.router.navigate(['/alert-table']);
    });
  }
  /////////////////////////////////////// functions for plotting line chart/////////////////////////////////////////////////////////

  // This function initializes the svg element.
  private initSvg() {
    // console.log('inside initSVG');
    const iEl = d3.select('g');
    iEl.remove();
    this.svg = d3.select('#line-chart')
                .append('g')
                .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
  }

  // This function initializes the axis for line chart.
  private initAxis(data: Station[]) {
    // console.log('inside initAxis');
    this.x = d3Scale.scaleBand().rangeRound([0, this.width]).padding(0.1);
    this.y = d3Scale.scaleLinear().range([this.height, 0]);
    this.x.domain(data.map((d) => d.x_axis.toString())); // takes data
    // console.log(data.map((d) => d.x_axis.toString()));
    this.y.domain([0, d3Array.max(this.stations, function(d) {
      return Math.max( parseInt(d.sma_30.toString(), 10), parseInt(d.sma_720.toString(), 10), parseInt(d.availableDocks.toString(), 10));
    })]);
    // console.log(d3Array.extent(data, (d) => d.availableDocks ));
  }

  // This function draws the axis required for the chart.
  private drawAxis() {
    // console.log('inside drawAxis');
    this.svg.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', 'translate(0,' + this.height + ')')
            .call(d3Axis.axisBottom(this.x));

    this.svg.append('g')
            .attr('class', 'axis axis--y')
            .call(d3Axis.axisLeft(this.y))
            .append('text')
            .attr('class', 'axis-title')
            .attr('transform', 'rotate(-90)')
            .attr('y', 6)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')
            .text('Available Docks');
  }

  // This function draws plot line in the chart.
  private drawLine(data: Station[]) {
    // console.log('inside drawLine');
    this.line = d3Shape.line()
                      .x( (d: any) => this.x(d.x_axis.toString()) ) // sets the scale
                      .y( (d: any) => this.y(d.availableDocks) );

    this.svg.append('path')
            .datum(data)
            .attr('class', 'line')
            .attr('d', this.line);
  }

}
