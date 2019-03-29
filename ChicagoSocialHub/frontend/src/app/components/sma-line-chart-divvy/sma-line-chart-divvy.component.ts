import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
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
  private sub;
  private time;
  private margin = {top: 20, right: 20, bottom: 30, left: 50};
  private width: number;
  private height: number;
  private x: any;
  private y: any;
  private svg: any;
  private line: d3Shape.Line<[number, number]>;
  constructor(private placesService: PlacesService) {
    this.width = 900 - this.margin.left - this.margin.right;
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
        this.initSvg();
        this.initAxis(this.stations);
        this.drawAxis();
        this.drawLine(this.stations);
      });
  }

  private initSvg() {
    this.svg = d3.select('svg')
                  .append('g')
                  .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
    }

  private initAxis(data: Station[]) {
    this.x = d3Scale.scaleBand().rangeRound([0, this.width]).padding(0.1);
    this.y = d3Scale.scaleLinear().range([this.height, 0]);
    this.x.domain(data.map((d) => d.lastCommunicationTime.substr(12, 10))); // takes data
    this.y.domain(d3Array.extent(data, (d) => d.sma_30 ));
    console.log(data, (d) => d.sma_30 );
  }

  private drawAxis() {

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
    this.line = d3Shape.line()
                        .x( (d: any) => this.x(d.lastCommunicationTime.substr(12, 10))) // sets the scale
                        .y( (d: any) => this.y(d.sma_30) );

    this.svg.append('path')
            .datum(data)
            .attr('class', 'line')
            .attr('d', this.line);
  }
}
