import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3ScaleChromatic from 'd3-scale-chromatic';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';

import { Station } from '../../station';
import { PlacesService } from '../../places.service';

@Component({
  selector: 'app-sma-line-chart-divvy',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './sma-line-chart-divvy.component.html',
  styleUrls: ['./sma-line-chart-divvy.component.css']
})
export class SmaLineChartDivvyComponent implements OnInit {
  title = 'Line Chart';
  // private time = this.route.snapshot.paraMap.get('time');
  stations: Station[];

  private margin = {top: 20, right: 20, bottom: 30, left: 50};
  private width: number;
  private height: number;
  private x: any;
  private y: any;
  private g: any;
  private z: any;
  private svg: any;
  private line: d3Shape.Line<[number, number]>;
  constructor(private placesService: PlacesService) {
    this.width = 1500 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;
  }

  ngOnInit() {
    this.fetchStations();
  }

  fetchStations() {
    this.placesService
      .getStations_Sma()
      .subscribe((data: Station[]) => {
        this.stations = data;
        // console.log(data);
        this.initChart();
        // this.drawAxis();
        // this.drawPath();
      });
  }

  private initChart(): void {


    this.x = d3Scale.scaleBand().rangeRound([0, this.width]).padding(0.1);
    var	y = d3Scale.scaleLinear().range([this.height, 0]);

    var	valueline  = d3Shape.line()
    .x( (d: any) => this.x(d.lastCommunicationTime) )
    .y( (d: any) => y(d.sma_30) );
    
var	valueline2 = d3Shape.line()
    .x( (d: any) => this.x(d.lastCommunicationTime) )
    .y( (d: any) => y(d.sma_720) );

    this.svg = d3.select('svg')
        .attr('width', this.width + this.margin.left + this.margin.right)
        .attr('height', this.height + this.margin.top + this.margin.bottom)
    .append('g')
        .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');


    // Scale the range of the data
    this.x.domain(this.stations.map((d) => (d.lastCommunicationTime)));
    y.domain([0, d3Array.max(this.stations, function(d) { return Math.max( parseInt(d.sma_30.toString(), 10), parseInt(d.sma_720.toString(), 10)); })]);

    this.svg.append('path')		// Add the valueline path.
        .datum(this.stations)
        .attr('class', 'line')
        .style('stroke', 'red')
        .attr('d', valueline);

        this.svg.append('path')		// Add the valueline2 path.
        .datum(this.stations)
        .attr('class', 'line')
        .style('stroke', 'blue')
        .attr('d', valueline2);

        this.svg.append('g')			// Add the X Axis
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + this.height + ')')
        .call(d3Axis.axisBottom(this.x));

      this.svg.append('g')			// Add the Y Axis
        .attr('class', 'y axis')
        .call(d3Axis.axisLeft(y));

        this.svg.append('text')
        .attr('transform', 'translate(' + (this.width - 15 ) + ',' + y(this.stations[0].sma_30) + ')')
        .attr('dy', '.35em')
        .attr('text-anchor', 'start')
        .style('fill', 'red')
        .text('30');

        this.svg.append('text')
        .attr('transform', 'translate(' + (this.width + 3) + ',' + y(this.stations[0].sma_720) + ')')
        .attr('dy', '.35em')
        .attr('text-anchor', 'start')
        .style('fill', 'steelblue')
        .text('70');
}

}
