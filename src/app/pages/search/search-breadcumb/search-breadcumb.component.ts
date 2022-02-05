import { Component, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-search-breadcumb',
  templateUrl: './search-breadcumb.component.html',
  styleUrls: ['./search-breadcumb.component.css']
})
export class SearchBreadcumbComponent implements OnInit {

	breadcrumb:string = null;

  constructor(private activateRoute: ActivatedRoute) { }

  ngOnInit(): void {

  	/*=============================================
     Capturamos el parametro URL
    =============================================*/

     this.breadcrumb = this.activateRoute.snapshot.params["param"].replace(/[_]/g, " ");
  }

}
