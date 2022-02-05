import { Component, OnInit, OnDestroy } from '@angular/core';

import { Path } from '../../config';
import { DinamicPrice, Quantity, Sweetalert } from '../../functions';

import { ProductsService } from '../../services/products.service';

import { Subject } from 'rxjs';

import { Router } from '@angular/router';
import notie from 'notie';

import { confirm } from 'notie';

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.css']
})
export class ShoppingCartComponent implements OnInit, OnDestroy {

  path:string = Path.url;
  shoppingCart:any[] = [];
  totalShoppingCart:number = 0;
  render:boolean = true;
  totalP:string =`<div class="p-2"><h3>Total <span class="totalP"><div class="spinner-border"></div></span></h3></div>`;
  

  dtOptions:DataTables.Settings= {};
  dtTrigger: Subject<any> = new Subject();
  popoverMessage:string = 'Esta seguro de remover esto?';

  constructor(private productsService: ProductsService,
              private router:Router) { }

  ngOnInit(): void {

     /*============================================
          Agregamos opciones a DataTable 220
       ============================================*/

       this.dtOptions = {
         pagingType: 'full_numbers',
         processing: true
       }

         /*===================================================
  Tomamos la data del carrito de compras del localstorage
    =======================================================*/  

    if(localStorage.getItem("list")){

      let list = JSON.parse(localStorage.getItem("list"));

      this.totalShoppingCart = list.length;

 /*===================================================
  Recorremos el arreglo del listado 206
=======================================================*/

      let load = 0;

      for(const i in list){


/*===================================================
 Filtramos los productos del carrito de compras 206
=======================================================*/
         
         this.productsService.getFilterData("url", list[i].product)
         .subscribe(resp=>{

            for(const f in resp){

                load++;

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

                  if(load == list.length){

                    this.dtTrigger.next();
                  }
            }
         })
            
      }
    }

  }

   /*=============================================================
          Funcion callback 223
      ==============================================================*/

  callback(){

    if(this.render){

      this.render = false;

      this.totalPrice(this.totalShoppingCart)

      setTimeout(function(){

        Quantity.fnc(); 

      }, this.totalShoppingCart*500)

          
    }    
  }  

   /*=============================================================
          Funcion cambio de cantidad 217
      ==============================================================*/

      changeQuantity(quantity, unit, move, product, details){

        let number = 1;

           /*=============================================================
          controlar maximos y minimos de la cantidad 217
      ==============================================================*/

        if(Number(quantity) > 9){

            quantity = 9;

        }

        if(Number(quantity) < 1){

            quantity = 1;
        }

           /*=============================================================
         Modificar cantidad de acuerdo a la direccion
      ==============================================================*/

      if(move == "up" && Number(quantity) < 9){

        number = Number(quantity)+unit;

        }

        else if(move == "down" && Number(quantity) > 1){

        number = Number(quantity)-unit;

        }else{

            number = Number(quantity);

        }

        /*$(".quantity input").val(quantity);*/

        /*this.quantity = number;*/


        /*=============================================================
         Actualizar la variable list del localstorage
       ==============================================================*/
       if(localStorage.getItem("list")){

          let shoppingCart = JSON.parse(localStorage.getItem("list"));

          shoppingCart.forEach(list=>{

            if(list.product == product && list.details == details.toString()){

              list.unit = number;
            }

          })  

          localStorage.setItem("list", JSON.stringify(shoppingCart));

          this.totalPrice(shoppingCart.length)

       }


      }
      /*=============================================================
        Actualizar subtotal y total 224
       ==============================================================*/

       totalPrice(totalShoppingCart){

          setTimeout(function(){

            let price = $(".pShoppingCart .end-price");
            let quantity = $(".qShoppingCart");
            let shipping = $(".sShoppingCart");
            let subTotalPrice = $(".subTotalPrice");

            let total = 0;

            for(let i = 0; i < price.length; i++){

               /*=============================================================
                  Sumar precio con envio 224
               ==============================================================*/
               let shipping_price = Number($(price[i]).html()) + Number($(shipping[i]).html());

               /*=============================================================
                  Multiplicar cantidad por precio con envio 224
               ==============================================================*/

               let subTotal = Number($(quantity[i]).val())*shipping_price;

                /*=============================================================
                  Mostramos subtotales de cada producto 224
               ==============================================================*/


               $(subTotalPrice[i]).html(`$${subTotal.toFixed(2)}`)


                /*=============================================================
                  Definimos el total de los precios 224
               ==============================================================*/
               total += subTotal;


            }

            $(".totalP").html(`$${total.toFixed(2)}`)

          },totalShoppingCart*500)

       }

       /*===================================================================
      Funcion para remover productos de la lista de carrito de compras
      ===================================================================*/

      removeProduct(product, details){

     /*===================================================================
      Buscamos coincidencia para remover el producto 226
      ===================================================================*/

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

  /*=============================================================
         Destruimos el Trigger de angular 189
       ==============================================================*/

       ngOnDestroy():void{
         this.dtTrigger.unsubscribe();
       }

}
