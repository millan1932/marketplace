import { Component, OnInit } from '@angular/core';
import { Path } from '../../config';
import { Search, DinamicPrice, Sweetalert } from '../../functions';

import { CategoriesService } from '../../services/categories.service';
import { SubCategoriesService } from '../../services/sub-categories.service';
import { ProductsService } from '../../services/products.service';
import { UsersService } from '../../services/users.service';

import { Router } from '@angular/router';

declare var jQuery:any;
declare var $:any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

   path: String = Path.url;
   //objectKeys = Object.keys;
   //categories = null;
   categories:any[] = [];
   arrayTitleList:any[] = [];
   render:boolean = true;
   authValidate:boolean = false;
   picture:string;
   wishlist:number = 0;
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

                     /*===================================================
                    Mostramos cantidad de productos en su lista de deseos
                     =====================================================*/

                     if(resp[i].wishlist != undefined){

                        this.wishlist = Number(JSON.parse(resp[i].wishlist).length)
                     }


                   /*=======================================
                    Mostramos foto del usuario
                     ========================================*/

                    if(resp[i].picture != undefined){

                        if(resp[i].method != "direct"){

                           this.picture = `<img src="${resp[i].picture}" class="img-fluid rounded-circle ml-auto">`;

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
      Recorremos la coleccion de categorias para tomar la lista de titulos
      ======================================*/

         let i;
         for(i in resp){

            this.categories.push(resp[i]);


            /*=====================================
      Separamos la lista de titulos en indices de un array
      ======================================*/

            this.arrayTitleList.push(JSON.parse(resp[i].title_list));
            
         }    

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

                 /*===================================================
                Mostrar los detalles por defecto del producto 216
               =======================================================*/

               if(resp[f].specification != ""){

               let specification = JSON.parse(resp[f].specification);

               for(const i in specification){

                  let property = Object.keys(specification[i]).toString();

                   details += `<div>${property}: ${specification[i][property][0]}</div>`
               }

            }

         }

               details += `</div>`;

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
      Hacemos un recorrido por la lista de titulos
      ======================================*/

      this.arrayTitleList.forEach(titleList =>{

         /*=====================================
      Separar individualmente los titulos
      ======================================*/
        for (let i = 0; i < titleList.length; i++){

      /*=====================================
      Tomamos la coleccion de las sub-categorias filtrando con la lista de titulos
      ======================================*/

            this.subCategoriesService.getFilterData("title_list", titleList[i])
            .subscribe(resp =>{
           
               arraySubCategories.push(resp);

               /*=====================================
      Hacemos un recorrido por la coleccion general de subcategorias
      ======================================*/

          let f;
          let g;
          let arrayTitleName = [];

          for (f in arraySubCategories){

             /*=====================================
                 Hacemos un recorrido por la coleccion particular de subcategorias
                  ======================================*/
                   
                 for (g in arraySubCategories[f]){

                   
                     /*=====================================
                     Creamos un nuevo array de objetos clasificando cada subcategoria con la respectiva lista de titulo a la que pertenece
                       ======================================*/
                arrayTitleName.push({

                    "titleList": arraySubCategories[f][g].title_list,
                    "subcategory": arraySubCategories[f][g].name,
                    "url":arraySubCategories[f][g].url,
                   })

                }

           }

            /*=====================================
              Recorremos el array de objetos nuevo para buscar coincidencias con las listas de titulo
                ======================================*/

                for (f in arrayTitleName){

                   if (titleList[i] == arrayTitleName[f].titleList){

                        /*=====================================
             Imprimir el nombre de subcategoria debajo del listado correspondiente
                ======================================*/

                  $(`[titleList='${titleList[i]}']`).append(

                     `<li>
                        <a href="products/${arrayTitleName[f].url}">${arrayTitleName[f].subcategory}</a>
                       </li>`

                     )

                   }

                }

           

            })
          

         }

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

      let price = $(".pShoppingHeader .end-price")
      let quantity = $(".qShoppingHeader");
      let shipping = $(".sShoppingHeader");

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