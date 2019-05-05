import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Axis from 'd3-axis';
import * as d3Array from 'd3-array';

import { Station } from '../../station';
import { PlacesService } from '../../places.service';

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface PlotData {
  stationName: String;
  availableBikes: Number;
  availableDocks: Number;
  totalDocks: Number;
}

@Component({
  selector: 'app-stack-bar-chart-divvy',
  templateUrl: './stack-bar-chart-divvy.component.html',
  styleUrls: ['./stack-bar-chart-divvy.component.css']
})

export class StackBarChartDivvyComponent implements OnInit {

  title = 'Stacked Bar Chart';
  stations: Station[];
  private margin: Margin;
  private width: number;
  private height: number;
  private new_data: PlotData[];
  private svg: any;

  private x: any;
  private y: any;
  private z: any;
  private g: any;

  constructor(private placesService: PlacesService) { }

  // This function is called when the page is initalized.
  ngOnInit() {
    this.fetchStations();
  }

  // This function fetches data from server for stack bar component
  fetchStations() {
    this.placesService
      .getStations()
      .subscribe((data: Station[]) => {
        this.stations = data;
        this.initMargins();
        this.initSvg();
        this.drawChart(this.stations);
      });
  }

  // This function initalized the bar chart
  private initMargins() {
    this.margin = {top: 20, right: 20, bottom: 30, left: 40};
  }

  // This function initalizes the svg element.
  private initSvg() {
      this.svg = d3.select('svg');

      this.width = +this.svg.attr('width') - this.margin.left - this.margin.right;
      this.height = +this.svg.attr('height') - this.margin.top - this.margin.bottom;
      this.g = this.svg.append('g').attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

      this.x = d3Scale.scaleBand()
          .rangeRound([0, this.width])
          .paddingInner(0.05)
          .align(0.1);
      this.y = d3Scale.scaleLinear()
          .rangeRound([this.height, 0]);
      this.z = d3Scale.scaleOrdinal()
          .range([ '#8a89a6', '#d0743c']);
  }

  // This function attaches data and draws it on the chart
  private drawChart(data: any[]) {
    
      let keys = ['availableBikes', 'availableDocks'];
      // Object.getOwnPropertyNames(data[0]).slice(1);

      data = data.map(v => {
          v.total = keys.map(key => v[key]).reduce((a, b) => a + b, 0);
          return v;
      });
      data.sort((a: any, b: any) => b.total - a.total);

      this.x.domain(data.map((d: any) => d.stationName));
      // console.log(data.map((d: any) => d.stationName));
      this.y.domain([0, d3Array.max(data, (d: any) => d.totalDocks)]).nice();
      // console.log([0, d3Array.max(data, (d: any) => d.totalDocks)]);
      this.z.domain(keys);
      // console.log(keys);

      this.g.append('g')
          .selectAll('g')
          .data(d3Shape.stack().keys(keys)(data))
          .enter().append('g')
          .attr('fill', d => this.z(d.key))
          .selectAll('rect')
          .data(d => d)
          .enter().append('rect')
          .attr('x', d => this.x(d.data.stationName))
          .attr('y', d => this.y(d[1]))
          .attr('height', d => this.y(d[0]) - this.y(d[1]))
          .attr('width', this.x.bandwidth());

      this.g.append('g')
          .attr('class', 'axis')
          .attr('transform', 'translate(0,' + this.height + ')')
          .call(d3Axis.axisBottom(this.x));

      this.g.append('g')
          .attr('class', 'axis')
          .call(d3Axis.axisLeft(this.y).ticks(null, 's'))
          .append('text')
          .attr('x', 2)
          .attr('y', this.y(this.y.ticks().pop()) + 0.5)
          .attr('dy', '0.32em')
          .attr('fill', '#000')
          .attr('font-weight', 'bold')
          .attr('text-anchor', 'start')
          .text('Total No of Docks');

      let legend = this.g.append('g')
          .attr('font-family', 'sans-serif')
          .attr('font-size', 10)
          .attr('text-anchor', 'end')
          .selectAll('g')
          .data(keys.slice().reverse())
          .enter().append('g')
          .attr('transform', (d, i) => 'translate(0,' + i * 20 + ')');

      legend.append('rect')
          .attr('x', this.width - 19)
          .attr('width', 19)
          .attr('height', 19)
          .attr('fill', this.z);

      legend.append('text')
          .attr('x', this.width - 24)
          .attr('y', 9.5)
          .attr('dy', '0.32em')
          .text(d => d);
  }

}
