import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Place } from '../../place';
import { PlacesService } from '../../places.service';
import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';


@Component({
  selector: 'app-bar-chart-yelp',
  templateUrl: './bar-chart-yelp.component.html',
  styleUrls: ['./bar-chart-yelp.component.css']
})
export class BarChartYelpComponent implements OnInit {

  places: Place[] = [];
  title = '  Bar Chart for Restaurant Reviews!';

    private width: number;
    private height: number;
    private margin = {top: 20, right: 20, bottom: 30, left: 40};
    private x: any;
    private y: any;
    private svg: any;
    private g: any;

  constructor(private placesService: PlacesService, private http: HttpClient) { }

  ngOnInit() {
    this.fetchPlaces();
  }

  fetchPlaces() {
    this.placesService
      .getPlaces()
      .subscribe((data: Place[]) => {
        this.places = data;
        // console.log(this.places);
        this.initSvg();
        this.initAxis(this.places);
        this.drawAxis();
        this.drawBars(this.places);
      });
  }

  // This function initializes the svg component.
  private initSvg() {
    this.svg = d3.select('svg');
    this.width = +this.svg.attr('width') - this.margin.left - this.margin.right;
    this.height = +this.svg.attr('height') - this.margin.top - this.margin.bottom;
    this.g = this.svg.append('g')
        .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
  }

  // This function initializes the axis for the chart.
  private initAxis(places) {
      this.x = d3Scale.scaleBand().rangeRound([0, this.width]).padding(0.1);
      this.y = d3Scale.scaleLinear().rangeRound([this.height, 0]);
      this.x.domain(places.map((d) => d.name));
      // console.log(places);
      this.y.domain([0, d3Array.max(this.places, (d) => parseInt(d.rating.toString(), 10))]);
  }

  // This Function helps to draw the axis
  private drawAxis() {
      this.g.append('g')
          .attr('class', 'axis axis--x')
          .attr('transform', 'translate(0,' + this.height + ')')
          .call(d3Axis.axisBottom(this.x));
      this.g.append('g')
          .attr('class', 'axis axis--y')
          .call(d3Axis.axisLeft(this.y).ticks(10))
          .append('text')
          .attr('class', 'axis-title')
          .attr('transform', 'rotate(-90)')
          .attr('y', 6)
          .attr('dy', '0.71em')
          .attr('text-anchor', 'end')
          .text('Rating');
  }

  // This Function draws the Bars for the Bar chart
  private drawBars(places) {
      this.g.selectAll('.bar')
          .data(places)
          .enter().append('rect')
          .attr('class', 'bar')
          .attr('x', (d) => this.x(d.name) )
          .attr('y', (d) => this.y(d.rating) )
          .attr('width', this.x.bandwidth())
          .attr('height', (d) => this.height - this.y(d.rating));
  }

}
