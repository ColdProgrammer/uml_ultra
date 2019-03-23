////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
/// This file and the source code provided can be used only for
/// the projects and assignments of this course

/// Last Edit by Dr. Atef Bader: 1/30/2019


////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////



import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AgmCoreModule, GoogleMapsAPIWrapper } from '@agm/core';


import { MatToolbarModule, MatFormFieldModule, MatInputModule, MatOptionModule, MatSelectModule, MatIconModule, MatButtonModule, MatCardModule, MatTableModule, MatDividerModule, MatSnackBarModule } from '@angular/material';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { PlacesService } from './places.service';

import { FindComponent } from './components/find/find.component';
import { ListOfPlacesComponent } from './components/list-of-places/list-of-places.component';
import { ListOfStationsComponent } from './components/list-of-stations/list-of-stations.component';
import { BarChartYelpComponent } from './components/bar-chart-yelp/bar-chart-yelp.component';
import { StackBarChartDivvyComponent } from './components/stack-bar-chart-divvy/stack-bar-chart-divvy.component';
import { LineChartDivvyComponent } from './components/line-chart-divvy/line-chart-divvy.component';




const routes: Routes = [
  { path: 'find', component: FindComponent},
  { path: 'list_of_places', component: ListOfPlacesComponent},
  { path: 'list_of_stations', component: ListOfStationsComponent},
  { path: 'bar-chart-yelp', component: BarChartYelpComponent},
  { path: 'stack-chart-divvy', component: StackBarChartDivvyComponent},
  { path: 'line-chart-divvy', component: LineChartDivvyComponent},

  { path: '', redirectTo: 'find', pathMatch: 'full'}
];

@NgModule({
  declarations: [
    AppComponent,
    FindComponent,
    ListOfPlacesComponent,
    ListOfStationsComponent,
    BarChartYelpComponent,
    StackBarChartDivvyComponent,
    LineChartDivvyComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    ReactiveFormsModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatDividerModule,
    MatSnackBarModule,

/////////////////////////////////////////////////////////////////////////////////////    
/////////////////////////// SETUP NEEDED ////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

//  1. Create your API key from Google Developer Website
//  2. Install AGM package: npm install @agm/core @ng-bootstrap/ng-bootstrap --
//  3. Here is the URL for an online IDE for NG and TS that could be used to experiment
//  4. AGM live demo is loacted at this URL: https://stackblitz.com/edit/angular-google-maps-demo


/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////


    AgmCoreModule.forRoot({apiKey: 'AIzaSyB-M3eYX7THgY3KeZ0SaeBdd1g9hv9b-lw'}),
    FormsModule,
    NgbModule
  ],

  providers: [PlacesService, GoogleMapsAPIWrapper],
  bootstrap: [AppComponent]
})
export class AppModule { }
