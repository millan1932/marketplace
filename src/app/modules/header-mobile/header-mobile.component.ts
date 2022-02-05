import { Component, OnInit } from '@angular/core';
import { Path } from '../../config';
import { Search, DinamicPrice, Sweetalert } from '../../functions';

declare var jQuery:any;
declare var $:any;

import { CategoriesService } from '../../services/categories.service';
import { SubCategoriesService } from '../../services/sub-categories.service';
import { ProductsService } from '../../services/products.service';
import { UsersService } from '../../services/users.service';

import { Router } from '@angular/router';

@Component({
  selector: 'app-header-mobile',
  templateUrl: './header-mobile.component.html',
  styleUrls: ['./header-mobile.component.css']
})
export class HeaderMobileComponent implements OnInit {

	path:string = Path.url;
	categories:any[] = [];
	render:boolean = true;
	categoriesList:any[] = [];
   authValidate:boolean = false;
   picture:string;
   shoppingCart:any[] = [];
   totalShoppingCart:number = 0;
   renderShopping:boolean = true;
   subTotal:string =`<h3>Sub Total:<strong class="subTotalHeader"><div class="spinner-border"></div></strong></h3>`;

  constructor(private categoriesService: CategoriesService, 
              private subCategoriesService: SubCategoriesService,
              private productsService: ProductsService,
              private usersService: UsersService,
              private router:Router) { }

  ngOnInit(): void {

     /*=======================================
        Validar si existe usuario autenticado
      ========================================*/
      this.usersService.authActivate().then(resp =>{

         if(resp){

               this.authValidate = true;

               this.usersService.getFilterData("idToken", localStorage.getItem("idToken"))
               .subscribe(resp=>{

                  for(const i in resp){

                    if(resp[i].picture != undefined){

                        if(resp[i].method != "direct"){

                           this.picture = `<img src="${resp[i].picture}" class="img-fluid rounded-circle ml-auto" >`;

                        }else{

                           this.picture = `<img src="assets/img/users/${resp[i].username.toLowerCase()}/${resp[i].picture}" class="img-fluid rounded-circle ml-auto">`;
                        }
                     }else{

                        this.picture = `<i class="icon-user"></i>`;
                     }
                  }
               })
          }     
      })


  	/*=====================================
		Tomamos la data de las categorias
		======================================*/

      this.categoriesService.getData()
      .subscribe(resp => {

         

         /*=====================================
		Recorrido por el objeto de la data de categorias
		======================================*/

		let i;

		for (i in resp){

         this.categories.push(resp[i]);
  
         /*=====================================
		Separamos los nombres de categorias
		======================================*/
         this.categoriesList.push(resp[i].name)

		}

     })

      /*=====================================
		Activamos el efecto toggle en el listado de subcategorias
		======================================*/


      $(document).on("click",".sub-toggle", function(){

        $(this).parent().children('ul').toggle();

      })

       /*===================================================
  Tomamos la data del carrito de compras del localstorage
    =======================================================*/  

    if(localStorage.getItem("list")){

      let list = JSON.parse(localStorage.getItem("list"));

      this.totalShoppingCart = list.length;

 /*===================================================
  Recorremos el arreglo del listado 206
=======================================================*/

      for(const i in list){


/*===================================================
 Filtramos los productos del carrito de compras 206
=======================================================*/
         
         this.productsService.getFilterData("url", list[i].product)
         .subscribe(resp=>{

            for(const f in resp){

               /*==========
               226 7:03
               ===========*/

                  let details = `<div class="list-details small text-secondary">`

                  if(list[i].details.length > 0){

                     let specification = JSON.parse(list[i].details);   

                     for(const i in specification){

                        let property = Object.keys(specification[i]);

                        for(const f in property){

                           details += `<div>${property[f]}: ${specification[i][property[f]]}</div>`
                        }

                     }

                  }else{

                     /*=============================================
                     Mostrar los detalles por defecto del producto 
                     =============================================*/

                     if(resp[f].specification != ""){

                        let specification = JSON.parse(resp[f].specification);

                        for(const i in specification){

                           let property = Object.keys(specification[i]).toString();

                           details += `<div>${property}: ${specification[i][property][0]}</div>`

                        }

                     }

                  }

                  details += `</div>`;

                  /*=====
                  226 7:06
                  ======*/

               this.shoppingCart.push({

                  url:resp[f].url,
                  name:resp[f].name,
                  category:resp[f].category,
                  image:resp[f].image,
                  delivery_time:resp[f].delivery_time,
                  quantity:list[i].unit,
                  price:DinamicPrice.fnc(resp[f])[0],
                  shipping:Number(resp[f].shipping)*Number(list[i].unit),
                  details:details,
                  listDetails:list[i].details

               })
            }
         })
            
      }
    }

  }

/*=====================================
   Declaramos funcion del buscador 
    ======================================*/

  goSearch(search:string){

    if(search.length == 0 || Search.fnc(search) == undefined){

      return;
    }

    window.open(`search/${Search.fnc(search)}`, '_top')
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


 		$(`[category='${category}']`).append(

 		`<li class="current-menu-item ">
			<a href="products/${arraySubCategories[i].url}">${arraySubCategories[i].subcategory}</a>
			</li>`

			)
 	}
 }



   })

 })

    }
  }

  /*=====================================
      Funcion que nos avisa cuando finaliza el renderizado de Angular
      ======================================*/
    
    callbackShopping(){

    if(this.renderShopping){

       this.renderShopping = false;


    /*=====================================
      Sumar Valores para el precio total
      ======================================*/

      let totalProduct = $(".ps-product--cart-mobile");

      setTimeout(function(){

      let price = $(".pShoppingHeaderM .end-price")
      let quantity = $(".qShoppingHeaderM");
      let shipping = $(".sShoppingHeaderM");

      let totalPrice = 0;

      for(let i = 0; i < price.length; i++){

     /*=====================================
       sumar precio con envio 207
      ======================================*/

      let shipping_price = Number($(price[i]).html()) + Number($(shipping[i]).html());

      totalPrice += Number($(quantity[i]).html() * shipping_price)

         
      }
   

      $(".subTotalHeader").html(`$${totalPrice.toFixed(2)}`)

      }, totalProduct.length * 500)

    }

  }  

   /*===================================================================
      Funcion para remover productos de la lista de carrito de compras
      ===================================================================*/

      removeProduct(product, details){

         console.log("product", product);

         if(localStorage.getItem("list")){

            let shoppingCart = JSON.parse(localStorage.getItem("list"));

            shoppingCart.forEach((list, index)=>{

               if(list.product == product && list.details == details.toString()){

                  shoppingCart.splice(index, 1);
               }
            })


    /*===================================================================
      Actualizamos en localstorage la lista de carrito de compras
      ===================================================================*/

             localStorage.setItem("list", JSON.stringify(shoppingCart));


             Sweetalert.fnc("success", "Producto Eliminado", this.router.url)
         }
      }

}
