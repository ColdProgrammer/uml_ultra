////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////


/// This file and the source code provided can be used only for
/// the projects and assignments of this course

/// Last Edit by Srajan: 03/23/2019


////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////



import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Station } from './station';
import { HttpHeaders } from '@angular/common/http';

import { Subject, from } from 'rxjs';
import * as socketio from 'socket.io-client';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';


import { Place } from './place';





const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};


@Injectable({
  providedIn: 'root'
})
export class PlacesService {

  uri = 'http://localhost:4000';
  listuri = 'http://localhost:3000';

  constructor(private http: HttpClient) {

  }

  getPlaces(): Observable<Place[]> {
    return this.http.get<Place[]>(`${this.uri}/places`);
  }

  getPlaceSelected() {
    return this.http.get(`${this.uri}/place_selected`);
  }

  getStations() {
    return this.http.get(`${this.uri}/stations`);
  }

  getAllStationsLatLong() {
    return this.http.get(`${this.uri}/all_stations`);
  }

  getStations_Hour_Old() {
    return this.http.get(`${this.uri}/stations/hourOldData`);
  }

  getStations_Hour_Cont() {
    return this.http.get(`${this.uri}/stations/hourContData`);
  }

  getStations_Sma() {
    return this.http.get(`${this.uri}/stations/sma_data`);
  }

  getStations_Logstash() {
    return this.http.get(`${this.uri}/stations/logstash`);
  }

  getStations_PieChart() {
    return this.http.get(`${this.uri}/stations/piechart`);
  }

  findPlaces(find, where, zipcode) {

    const find_places_at = {
      find: find,
      where: where,
      zipcode: zipcode
    };

    return this.http.post(`${this.uri}/places/find`, find_places_at, httpOptions);

  }

  findStationLogstash(place, time) {
    const find_station_at = {
      find: place,
      where: time
    };

    return this.http.post(`${this.uri}/places/find/logstash`, find_station_at, httpOptions);

  }

  findStations(placeName) {
    const find_stations_at = {
      placeName: placeName
    };
    const str = JSON.stringify(find_stations_at, null, 2);
    return this.http.post(`${this.uri}/stations/find`, find_stations_at, httpOptions);
  }

  findPieChart() {
    const find_station_at = {
      find: '',
      where: ''
    };

    return this.http.post(`${this.uri}/places/find/piechart`, find_station_at, httpOptions);

  }


  // The below function for hour old divvy status
  plotLineHour(placeName, time) {
    const find_stations_at = {
      placeName: placeName,
      time: time
    };

    return this.http.post(`${this.uri}/stations/hourold`, find_stations_at, httpOptions);

  }

  // The below function for hour old  sma divvy status
  plotSMA(placeName) {
    const find_stations_at = {
      placeName: placeName,
    };

    return this.http.post(`${this.uri}/stations/sma`, find_stations_at, httpOptions);

  }

  getUpdates() {
    console.log('inside service');
    const socket = socketio(this.listuri);
    let station;
    const stationSubObservable = from(station);

    socket.on('updatedStation', (marketStatus: Station[]) => {
      station.next(marketStatus);
    });

    return stationSubObservable;
  }
}
