import { Component, OnInit } from '@angular/core';
import { Path } from '../../config';

declare var jQuery:any;
declare var $:any;

import { CategoriesService } from '../../services/categories.service';
import { SubCategoriesService } from '../../services/sub-categories.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

	path:string = Path.url;
	categories:any[] = [];
	render:boolean = true;
	categoriesList:any[] = [];


  constructor(private categoriesService: CategoriesService, private subCategoriesService: SubCategoriesService) { }

  ngOnInit(): void {

    	/*=====================================
		Tomamos la data de las categorias
		======================================*/

      this.categoriesService.getData()
      .subscribe(resp => {

        

         let i;

		for (i in resp){

       this.categories.push(resp[i]);
  
         /*=====================================
		Separamos los nombres de categorias
		======================================*/
         this.categoriesList.push(resp[i].name)

		}


       })

  }

   /*=====================================
Funcion que nos avisa cuando finaliza el renderizado de Angular
 ======================================*/

  callback(){
 
    if(this.render){

    	this.render = false;


    	let arraySubCategories = [];
    	

    	 /*=====================================
Separar las categorias
 ======================================*/
 this.categoriesList.forEach(category=>{

 	/*=====================================
 Tomamos la coleccion de las sub-categorias filtrando con los nombres de categoria
 ======================================*/

   this.subCategoriesService.getFilterData("category", category)
   .subscribe(resp=>{

   	 /*=====================================
 Hacemos un recorrido por la coleccion general de subcategorias y url
 y clasificamos de acuerdo a la categoria que corresponde
 ======================================*/

     let i;

     for (i in resp){


     	arraySubCategories.push({

                    "category": resp[i].category,
                    "subcategory": resp[i].name,
                    "url":resp[i].url
		             })
                   }
    
 /*=====================================
  Recorremos el array de objetos nuevo para buscar coincidencias con los nombres de categorias
 ======================================*/

 for (i in arraySubCategories){

 	if(category == arraySubCategories[i].category){


 		$(`[category-footer='${category}']`).after(

 		`<a href="products/${arraySubCategories[i].url}">${arraySubCategories[i].subcategory}</a>`

			);
 	}
 }



   })

 })


    }

}

}
