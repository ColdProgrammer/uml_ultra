import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import {NgModule, VERSION,Inject, ViewChild, ElementRef } from '@angular/core'
import {BrowserModule, DOCUMENT} from '@angular/platform-browser'
import { ActivatedRoute, Router } from '@angular/router';
import {Location} from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3ScaleChromatic from 'd3-scale-chromatic';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';

import { Station } from '../../station';
import { PlacesService } from '../../places.service';

@Component({
  selector: 'app-dasboard-display',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './dasboard-display.component.html',
  styleUrls: ['./dasboard-display.component.css']
})

export class DasboardDisplayComponent implements OnInit {

  title = 'Line Charts';
  stations: Station[];
  private margin = {top: 20, right: 20, bottom: 30, left: 50};
  private width: number;
  private location: Location;
  private hide_30 = false;
  private hide_720 = false;
  private height: number;
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

  ngOnInit() {
    this.fetchStations();
  }

  fetchStations() {
    this.placesService
      .getStations_Logstash()
      .subscribe((data: Station[]) => {
        this.stations = data;
        console.log(data);
        this.initSvg();
        this.initAxis(this.stations);
        // console.log(this.stations);
        this.drawAxis();
        this.drawLine(this.stations);
        // this.drawAxis();
        // this.drawPath();
      });
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
      // this.router.navigate(['/dashboard', { time: time}]);
    // this.fetchStations();
    // const a = this.location.path();
    this.router.navigateByUrl('/find', {skipLocationChange: true}).then(() =>
    this.router.navigate(['/dashboard']));
      });
  }

  plotPieChart() {
    this.placesService.findPieChart().subscribe(() => {
      this.router.navigate(['/pie-chart-divvy']);
      });
  }

  plotSMA30() {
    if (this.check_sma_30 === false) {
      console.log('checkbox 30 chedin');
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
      console.log('checkbox 30 checkedout');
        // Remove SMA 30 plot
        var iEl = d3.select('.line-sma-30');
        iEl.remove();
        this.hide_30 = true;
    }
  }

  plotSMA720() {
    if (this.check_sma_720 === false) {
      console.log('checkbox 720 chedin');
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
      console.log('checkbox 720 checkedout');
        // Remove SMA 30 plot
        var iEl = d3.select('.line-sma-720');
        iEl.remove();
        this.hide_720 = true;
    }
  }
  /////////////////////////////////////// functions for line chart/////////////////////////////////////////////////////////

  private initSvg() {
    console.log('inside initSVG');
    this.svg = d3.select('#line-chart')
        .append('g')
        .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
  }

  private initAxis(data: Station[]) {
    console.log('inside initAxis');
    this.x = d3Scale.scaleBand().rangeRound([0, this.width]).padding(0.1);
    this.y = d3Scale.scaleLinear().range([this.height, 0]);
    this.x.domain(data.map((d) => d.x_axis.toString())); // takes data
    console.log(data.map((d) => d.x_axis.toString()));
    this.y.domain([0, d3Array.max(this.stations, function(d) {
      return Math.max( parseInt(d.sma_30.toString(), 10), parseInt(d.sma_720.toString(), 10), parseInt(d.availableDocks.toString(), 10));
    })]);
    // this.y.domain(d3Array.extent(data, (d) => d.availableDocks ));
    // console.log(d3Array.extent(data, (d) => d.availableDocks ));
  }

  private drawAxis() {
    console.log('inside drawAxis');

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

  private drawLine(data: Station[]) {
    console.log('inside drawLine');
    this.line = d3Shape.line()
        .x( (d: any) => this.x(d.x_axis.toString()) ) // sets the scale
        .y( (d: any) => this.y(d.availableDocks) );

    this.svg.append('path')
        .datum(data)
        .attr('class', 'line')
        .attr('d', this.line);
  }

}
