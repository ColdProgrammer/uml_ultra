////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////


/// This file and the source code provided can be used only for
/// the projects and assignments of this course

/// Last Edit by Dr. Atef Bader: 1/30/2019


////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////



import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PlacesService } from '../../places.service';



@Component({
  selector: 'app-find',
  templateUrl: './find.component.html',
  styleUrls: ['./find.component.css']
})
export class FindComponent implements OnInit {

  createForm: FormGroup;
  hintColor;


  constructor(private placesService: PlacesService, private fb: FormBuilder, private router: Router) {
    this.hintColor = '#76FF03';
    this.createForm = this.fb.group({
      zipcode: '',
      where: '',
      find: ''

    });
  }

  ngOnInit() {
  }

  // This function calls server.js to find places in yelp.
  findPlaces() {
    // console.log(this.createForm.value);
    this.placesService.findPlaces(this.createForm.value.find, this.createForm.value.where, this.createForm.value.zipcode).subscribe(() => {
      this.router.navigate(['/list_of_places']);
    });
  }
}
