import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import { Station } from '../../station';
import { PlacesService } from '../../places.service';

@Component({
  selector: 'app-pie-chart-divvy',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './pie-chart-divvy.component.html',
  styleUrls: ['./pie-chart-divvy.component.css']
})
export class PieChartDivvyComponent implements OnInit {

  title = 'Pie Chart';

  private margin = {top: 20, right: 20, bottom: 30, left: 50};
  private width: number;
  private height: number;
  private radius: number;
  stations: Station[];
  private arc: any;
  private labelArc: any;
  private pie: any;
  private color: any;
  private svg: any;

  constructor(private placesService: PlacesService) {
    this.width = 900 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;
    this.radius = Math.min(this.width, this.height) / 2;
  }

  // This function is called when the program is initalized
  ngOnInit() {
    this.fetchStations();
  }

  // This function fetches the data for piechart
  fetchStations() {
    this.placesService
      .getStations_PieChart()
      .subscribe((data: Station[]) => {
        this.stations = data;
        // console.log(data);
        this.initSvg(this.stations);
        this.drawPie(this.stations);
      });
  }

  // This function initializes the svg component
  private initSvg(data) {
    this.color = d3Scale.scaleOrdinal()
        .range(['#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ff8c00']);
    this.arc = d3Shape.arc()
        .outerRadius(this.radius - 10)
        .innerRadius(0);
    this.labelArc = d3Shape.arc()
        .outerRadius(this.radius - 40)
        .innerRadius(this.radius - 40);
    this.pie = d3Shape.pie()
        .sort(null)
        .value((d: any) => d.pie);
    this.svg = d3.select('svg')
        .append('g')
        .attr('transform', 'translate(' + this.width / 2 + ',' + this.height / 2 + ')');
  }

  // This function draws the piechart
  private drawPie(data) {
      const g = this.svg.selectAll('.arc')
          .data(this.pie(data))
          .enter().append('g')
          .attr('class', 'arc');
      g.append('path').attr('d', this.arc)
          .style('fill', (d: any) => this.color(d.data.dock) );
      g.append('text').attr('transform', (d: any) => 'translate(' + this.labelArc.centroid(d) + ')')
          .attr('dy', '.35em')
          .text((d: any) => d.data.dock);
  }

}
