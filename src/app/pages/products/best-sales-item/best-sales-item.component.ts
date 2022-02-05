import { Component, OnInit } from '@angular/core';
import { Path } from '../../../config';
import { OwlCarouselConfig, CarouselNavigation, Rating, DinamicRating, DinamicReviews, DinamicPrice, Sweetalert } from '../../../functions';

import { ProductsService } from '../../../services/products.service';
import { UsersService } from '../../../services/users.service';

import { ActivatedRoute, Router } from '@angular/router';

declare var jQuery:any;
declare var $:any;

@Component({
  selector: 'app-best-sales-item',
  templateUrl: './best-sales-item.component.html',
  styleUrls: ['./best-sales-item.component.css']
})
export class BestSalesItemComponent implements OnInit {

	path:string = Path.url;
	bestSalesItem:any[] = [];
	render:boolean = true;
	rating:any[] = [];
	reviews:any[] = [];
	price:any[] = [];
  cargando:boolean = false;

  constructor(private productsService: ProductsService,
  	          private activateRoute: ActivatedRoute,
              private usersService: UsersService,
              private router: Router) { }

  ngOnInit(): void {

    this.cargando = true;

  	/*================================
     Capturamos el parametro URL
  	==================================*/

  	let params = this.activateRoute.snapshot.params["param"].split("&")[0];

    /*================================
    Filtramos data de productos con categoria
  	==================================*/

  	this.productsService.getFilterData("category", params)
  	.subscribe(resp1=>{

  		if(Object.keys(resp1).length > 0){


  			this.productsFnc(resp1);

  	

       }else{

       	/*==================================================
    Filtramos data de categorias
  	====================================================*/

  	this.productsService.getFilterData("sub_category", params)
  	.subscribe(resp2=>{

  		


  			this.productsFnc(resp2);


  		  

  	     })


       }
   })

  	
  }

   /*====================================================
    Declaramos funcion para mostrar las mejores ventas
  	====================================================*/

  productsFnc(response){

       this.bestSalesItem = [];
   	 /*====================================================
    Hacemos un recorrido por la respuesta que nos traiga el filtrado
  	====================================================*/


  	let i;
  	let getSales = [];

  	for (i in response){

  		getSales.push(response[i]);

  	}

  	 /*====================================================
    Ordenamos de mayor a menor ventas el arreglo de objetos
  	====================================================*/
  	getSales.sort(function(a,b){


  		return (b.sales - a.sales)
  	})
  	/*====================================================
    Filtramos solo hasta 10 productos
  	====================================================*/
     getSales.forEach((product, index)=>{

     	if(index < 10){

         this.bestSalesItem.push(product);

         this.rating.push(DinamicRating.fnc(this.bestSalesItem[index]));
         
         this.reviews.push(DinamicReviews.fnc(this.rating[index]));         

         this.price.push(DinamicPrice.fnc(this.bestSalesItem[index]));

         this.cargando = false;

          setTimeout(function(){

            Rating.fnc()
            
         },index*100)

     	}

     })

  }   
  
  	/*====================================================
  Funcion que nos avisa cuando finaliza el renderizado de angular
  	====================================================*/
   callback(){
     if (this.render){
     	this.render = false;

     	OwlCarouselConfig.fnc();
  	    CarouselNavigation.fnc();
  	    
     }
   }

        /*====================================================
          Funcion para agregar producto a la lista de deseos 191
      ====================================================*/

      addWishlist(product){

        this.usersService.addWishlist(product);
      }


      /*=============================================================
          Funcion para agregar producto al carrito de compras 203
      ==============================================================*/
      addShoppingCart(product, unit, details){

          let url = this.router.url;

          let item = {

            product: product,
            unit: unit,
            details: details,
            url:url

          }

          this.usersService.addShoppingCart(item);
      }
}
