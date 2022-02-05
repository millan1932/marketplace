import { Component, OnInit } from '@angular/core';
import { Path } from '../../../config';

import { OwlCarouselConfig, CarouselNavigation, Rating,DinamicRating, DinamicReviews, DinamicPrice } from '../../../functions';

import { ProductsService } from '../../../services/products.service';

import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-products-recommended',
  templateUrl: './products-recommended.component.html',
  styleUrls: ['./products-recommended.component.css']
})
export class ProductsRecommendedComponent implements OnInit {

	path:string = Path.url;
	recommendedItems:any[] = [];
	render:boolean = true;
	rating:any[] = [];
	reviews:any[] = [];
	price:any[] = [];
	cargando:boolean = false;

  constructor(private productsService: ProductsService,
  	          private activateRoute: ActivatedRoute,
              private usersService: UsersService,
              private router:Router) { }

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
    Declaramos funcion para mostrar los productos recomendados
  	====================================================*/

  productsFnc(response){

       this.recommendedItems = [];
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


  		return (b.views - a.views)
  	})
  	/*====================================================
    Filtramos solo hasta 10 productos
  	====================================================*/
     getSales.forEach((product, index)=>{

     	if(index < 10){

         this.recommendedItems.push(product);

         this.rating.push(DinamicRating.fnc(this.recommendedItems[index]));
         
         this.reviews.push(DinamicReviews.fnc(this.rating[index]));



         this.price.push(DinamicPrice.fnc(this.recommendedItems[index]));

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
          Funcion para agregar producto a la lista de deseos 193
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
