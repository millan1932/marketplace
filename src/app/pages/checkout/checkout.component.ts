import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Path, MercadoPago  } from '../../config';
import { Sweetalert, DinamicPrice, Paypal } from '../../functions';

import { Router } from '@angular/router';

import { UsersModel } from '../../models/users.model';

import { UsersService } from '../../services/users.service';
import { ProductsService } from '../../services/products.service';
import { OrdersService } from '../../services/orders.service';
import { SalesService } from '../../services/sales.service';
import { StoresService } from '../../services/stores.service';

import * as Cookies from 'js-cookie';

import { Md5 } from 'md5-typescript';


declare var jQuery:any;
declare var $:any;


@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  path:string = Path.url;
  user: UsersModel;
  id:string = null;
  saveAddress:boolean = false;
  countries:any=null;
  dialCode:string = null;
  shoppingCart: any[] = [];
  totalShoppingCart:number = 0;
  render:boolean = true;
  totalP:string = `<h3 class="text-right">Total <span class="totalCheckout"><div class="spinner-border"></div></span></h3>`
  totalPrice:any[] = [];
  subTotalPrice:any[] = [];
  paymentMethod:string = "";
  addInfo:string = "";
  validateCoupon:boolean = false;

  constructor(private router:Router,
              private usersService:UsersService,
              private productsService: ProductsService,
              private ordersService:OrdersService,
              private salesService: SalesService,
              private storesService: StoresService) { 

      this.user = new UsersModel();
  }

  ngOnInit(): void {

       /*===================================================
      Validar la existencia de un cupon de la tienda 242
    ========================================================*/
    if(Cookies.get('coupon') != undefined){

      this.storesService.getFilterData("url", Cookies.get('coupon'))
      .subscribe(resp=>{

        this.validateCoupon = true;

      })
    }


    

    /*==========================================
      Validar si existe usuario autenticado
    ===========================================*/

    this.usersService.authActivate().then(resp=>{

      if(resp){

        this.usersService.getFilterData("idToken", localStorage.getItem("idToken"))
        .subscribe(resp=>{


          this.id = Object.keys(resp).toString();

          for(const i in resp){

            this.user.displayName = resp[i].displayName;
            this.user.username = resp[i].username;
            this.user.email = resp[i].email;
            this.user.country = resp[i].country;
            this.user.city = resp[i].city;


            if(resp[i].phone != undefined){

              this.user.phone = resp[i].phone.split("-")[1]
              this.dialCode = resp[i].phone.split("-")[0]
            }


            this.user.address = resp[i].address;

             /*==========================================
               Traer el listado de paises 231
             ===========================================*/

             this.usersService.getCountries()
             .subscribe(resp=>{

                this.countries = resp;

             })


           

          }

        })
      }


    })

    /*==========================================
      Traer la lista del carrito de compras
    ===========================================*/

    if(localStorage.getItem("list")){

      let list = JSON.parse(localStorage.getItem("list"));

      this.totalShoppingCart = list.length;

      if(list.length == 0){

        this.router.navigateByUrl("/shopping-cart");

        return;
      }

   /*==========================================
     Recorremos el arreglo del listado 233
    ===========================================*/

    for(const i in list){

  /*==========================================
    Filtramos los productos del carrito de compras 233
    ===========================================*/

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
                  listDetails:list[i].details,
                  store:resp[f].store

               })

             }

    })

    }


    }else{

       this.router.navigateByUrl("shopping-cart");

        return;


    }
  }

  /*===================================
    Guardar datos de envio del usuario
  =====================================*/

  saveAddressFnc(inputCountry, inputCity, inputphone, inputAddress, inputSaveAddress){

      if(this.saveAddress){


        if(inputCountry.value != "" &&
           inputCity.value != "" &&
           inputphone.value != "" &&
           inputAddress.value != ""){

          let body = {

            country: this.user.country,
            country_code: this.user.country_code,
            city: this.user.city,
            phone: `${this.dialCode}-${this.user.phone}`,
            address: this.user.address
          }

          this.usersService.patchData(this.id, body)
          .subscribe(resp=>{

            Sweetalert.fnc("success", "actualizado", null)
          })


        }else{

          inputSaveAddress.checked = false;

          Sweetalert.fnc("error", "Campos requeridos", null)

        }
    }

  }

    /*===================================
    Agregar codigo dial al input telefonico 231
  =====================================*/

  changeCountry(inputCountry){

    this.countries.forEach(country=>{

        if(inputCountry.value == country.name){

          this.dialCode = country.dial_code;
          this.user.country_code = country.code;
        }

    })
  }


    /*===================================
  Funcion callback 233
  =====================================*/

  callback(){

    if(this.render){

      this.render = false;

      let totalShoppingCart = this.totalShoppingCart;
      let localTotalPrice = this.totalPrice;
      let localSubTotalPrice = this.subTotalPrice;

       setTimeout(function(){

            let price = $(".pCheckout .end-price");
            let quantity = $(".qCheckout");
            let shipping = $(".sCheckout");
            let subTotalPrice = $(".subTotalPriceCheckout");

            let total = 0;

            for(let i = 0; i < price.length; i++){

               /*=============================================================
                  Sumar precio con envio 224
               ==============================================================*/
               let shipping_price = Number($(price[i]).html()) + Number($(shipping[i]).html());

               /*=============================================================
                  Multiplicar cantidad por precio con envio 224
               ==============================================================*/

               let subTotal = Number($(quantity[i]).html())*shipping_price;

                /*=============================================================
                  Mostramos subtotales de cada producto 224
               ==============================================================*/


               $(subTotalPrice[i]).html(`$${subTotal.toFixed(2)}`)

               localSubTotalPrice.push(subTotal.toFixed(2))


                /*=============================================================
                  Definimos el total de los precios 224
               ==============================================================*/
               total += subTotal;


            }

            $(".totalCheckout").html(`$${total.toFixed(2)}`)

            localTotalPrice.push(total.toFixed(2));

          },totalShoppingCart*500)
    }
  }

      /*=============================================================
       Envio del formulario checkout 234
     ==============================================================*/

  onSubmit(f: NgForm){

     /*=============================================================
       Validamos formulario para eviatar campos vacios 234
     ==============================================================*/

    if(f.invalid ){

      Sweetalert.fnc("error", "Requerimiento Invalido", null);

      return;
    }



      /*=============================================================
       Sweetalert para esperar el proceso de ejecucion 234
     ==============================================================*/

         Sweetalert.fnc("loading", "Loading...", null);  

       /*=============================================================
       Pasarelas de pago 234
     ==============================================================*/

    
     if(f.value.paymentMethod == "paypal"){

       /*=============================================================
       checkout con paypal 234
     ==============================================================*/

     

     Sweetalert.fnc("html", ` <div id="paypal-button-container"></div>`, null);

         /*=============================================================
       ejecutamos funcion de paypal pasando el precio total de la venta 236
     ==============================================================*/

     Paypal.fnc(this.totalPrice[0]).then(resp=>{

        if(resp){

          let totalRender = 0;

      /*=========================================
     Tomamos la informacion de la venta 237
     =======================================*/

            this.shoppingCart.forEach((product, index)=>{

              totalRender ++

                  /*================================================================================
                   enviar actualizacion de cantidad de producto vendido a la BD Modulo Paypal 237
                  =================================================================================*/

                  this.productsService.getFilterData("url", product.url)
                  .subscribe(resp=>{

                    for(const i in resp){

                      let id = Object.keys(resp).toString();

                      let value = {

                        sales: Number(resp[i].sales)+Number(product.quantity),
                        stock: Number(resp[i].stock)-Number(product.quantity)
                      }

                      this.productsService.patchDataAuth(id, value, localStorage.getItem("idToken"))
                      .subscribe(resp=>{})

                    }

                  })


                    /*=============================================================
                     Crear el proceso de entrega de la venta 239
                   ==============================================================*/

                   let moment = Math.floor(Number(product.delivery_time)/2);

                   let sentDate = new Date();
                   sentDate.setDate(sentDate.getDate()+moment);

                   let deliveredDate = new Date();
                   deliveredDate.setDate(deliveredDate.getDate()+Number(product.delivery_time))


                  let proccess = [

              {
                stage:"reviewed",
                status:"ok",
                comment:"We have received your order, we start delivery process",
                date:new Date()
              },

              {
                stage:"sent",
                status:"pending",
                comment:"",
                date:sentDate
              },
              {
                stage:"delivered",
                status:"pending",
                comment:"",
                date:deliveredDate
              }

            ]


                    /*=============================================================
                     creamos orden de venta en la base de datos 238
                   ==============================================================*/


                   let body = {

                      store:product.store,
                      user:this.user.username,
                      product:product.name,
                      url:product.url,
                      image:product.image,
                      category:product.category,
                      details:product.details,
                      quantity:product.quantity,
                      price:this.subTotalPrice[index],
                      email:f.value.email,
                      country:f.value.country,
                      city:f.value.city,
                      phone:`${this.dialCode}-${f.value.phone}`,
                      address:f.value.address,
                      info:f.value.addInfo,
                      process:JSON.stringify(proccess),
                      status:"pending"

                   }

                   this.ordersService.registerDatabase(body, localStorage.getItem("idToken"))
                   .subscribe(resp=>{

                      if(resp["name"] != ""){

                          
                    /*=================================================================================================
                     Separamos la comision del marketplace y el pago a la tienda del precio total de cada producto 240
                   ===================================================================================================*/       

                          let commision = 0;
                          let unitPrice = 0;

                   /*=======================
                     25% de comision MUCHO
                   =========================*/  


                          if(this.validateCoupon){

                            commision = Number(this.subTotalPrice[index])*0.05;
                            unitPrice = Number(this.subTotalPrice[index])*0.95

                          }else{

                            commision = Number(this.subTotalPrice[index])*0.25;
                            unitPrice = Number(this.subTotalPrice[index])*0.75;


                          }

                          

                           /*=================================================
                           Enviar informacion de la venta a la base de datos 240
                           ===================================================*/

                           let id_payment =  localStorage.getItem("id_payment");

                           let body = {

                                id_order: resp["name"],
                                client: this.user.username,
                                product: product.name,
                                url:product.url,
                                quantity:product.quantity,
                                unit_price: unitPrice.toFixed(2),
                                commision: commision.toFixed(2), 
                                total: this.subTotalPrice[index],
                                payment_method: f.value.paymentMethod,
                                id_payment:id_payment,
                                date: new Date(),
                                status: "pending"


                           }

                           this.salesService.registerDatabase(body, localStorage.getItem("idToken"))
                          .subscribe(resp=>{})

                      }

                   })

            })

                 /*=============================================================
                 Preguntamos cuando haya finalizado el proceso de guardar todo en la BD 240
                ==============================================================*/
      
              if(totalRender == this.shoppingCart.length){

                localStorage.removeItem("list");
                localStorage.removeItem("id_payment");
                Cookies.remove('coupon');

                Sweetalert.fnc("success", "La compra fue creada Correctamente", "account/my-shopping");


              }

        }else{

          Sweetalert.fnc("error", "La compra fue Rechazada, intente Nuevamente", null);

        }  

     })
  

     }else if(f.value.paymentMethod == "payu"){

    /*=============================================================
       checkout con payu 234
     ==============================================================*/
      console.log("Chekout con payu");
    
     }else if(f.value.paymentMethod == "mercado-pago"){

        /*=============================================================
       checkout con mercado-pago 234
     ==============================================================*/
     let formMP = `<img src="assets/img/payment-method/mercado_pago.jpg" style="width:100px" />
              <div><a class="ps-btn p-0 px-5 popupMP">Next</a></div>`

     /*=============================================================
       sacar el boton de mercadopago en una alerta suave 248
     ==============================================================*/
     Sweetalert.fnc("html", formMP, null);

     /*=============================================================
       Abrir ventana emergente de mercadopago 248
     ==============================================================*/

     let localTotalPrice = this.totalPrice[0].toString();


       /*===================================
         Capturar la descripcion 
       =======================================*/

         let description = "";

         this.shoppingCart.forEach(product=>{

         description += `${product.name} x${product.quantity},`

         })

          description = description.slice(0, -2);

          /*===================================
         Capturar el email 251
       =======================================*/

       let email = this.user.email;


     $(document).on("click", ".popupMP", function(){

      Cookies.set("_x", window.btoa(localTotalPrice), {expires: 1});
      Cookies.set("_p", description, {expires:1});
      Cookies.set("_e", email, {expires:1});

      window.open(`http://localhost/marketplace-account/src/mercadopago/index.php?_x=${Md5.init(localTotalPrice)}`,
                "_blank",
                "width=950,height=650,scrollbars=NO")

     })

      /*=======================================
         Validar la compra de Mercado Pago 251
       =======================================*/
       let count = 0;

        /*=============================================
         Convertir variables globales en locales 252
       ==============================================*/

      
      
     
      let localSubTotalPrice = this.subTotalPrice;
      let localShoppingCart = this.shoppingCart;
      let localProductsService = this.productsService;
      let localUser = this.user;
      let localDialCode = this.dialCode;
      let localAddInfo = this.addInfo;
      let localOrdersService = this.ordersService;
      let localValidateCoupon = this.validateCoupon;
      let localPaymentMethod  =  this.paymentMethod;
      let localSalesService = this.salesService;



       let interval = setInterval(function(){

        count++

         /*=============================================
          validar la compra de mercado pago
          =============================================*/

        if( Cookies.get('_i') != undefined && 
            Cookies.get('_k') != undefined && 
            Cookies.get('_a') != undefined &&
            Cookies.get('_k') == MercadoPago.public_key &&
            Cookies.get('_a') == MercadoPago.access_token){


            let totalRender = 0;

          /*=============================================
          Tomamos la información de la venta
          =============================================*/

          localShoppingCart.forEach((product, index)=>{

            totalRender ++

            /*=============================================================================================
            Enviar actualización de cantidad de producto vendido a la base de datos Modulo Mercado Pago
            ==============================================================================================*/ 

            localProductsService.getFilterData("url", product.url)
            .subscribe(resp=>{

              for(const i in resp){

                let id = Object.keys(resp).toString();

                let value = {

                  sales: Number(resp[i].sales)+Number(product.quantity),
                  stock: Number(resp[i].stock)-Number(product.quantity)
                
                }

                localProductsService.patchDataAuth(id, value, localStorage.getItem("idToken"))
                .subscribe(resp=>{})

              }

            })

            /*=============================================
            Crear el proceso de entrega de la venta
            =============================================*/

            let moment = Math.floor(Number(product.delivery_time)/2);

            let sentDate = new Date();
            sentDate.setDate(sentDate.getDate()+moment);

            let deliveredDate = new Date();
            deliveredDate.setDate(deliveredDate.getDate()+Number(product.delivery_time))

            let proccess = [

              {
                stage:"reviewed",
                status:"ok",
                comment:"We have received your order, we start delivery process",
                date:new Date()
              },

              {
                stage:"sent",
                status:"pending",
                comment:"",
                date:sentDate
              },
              {
                stage:"delivered",
                status:"pending",
                comment:"",
                date:deliveredDate
              }

            ]

            /*=============================================
            Crear orden de venta en la base de datos
            =============================================*/

            let body = {

              store:product.store,
              user: localUser.username,
              product: product.name,
              url:product.url,
              image:product.image,
              category: product.category,
              details:product.details,
              quantity:product.quantity,
              price: localSubTotalPrice[index],
              email:localUser.email,
              country:localUser.country,
              city:localUser.city,
              phone:`${localDialCode}-${localUser.phone}`,
              address:localUser.address,
              info:localAddInfo,
              process:JSON.stringify(proccess),
              status:"pending"

            }

            localOrdersService.registerDatabase(body, localStorage.getItem("idToken"))
            .subscribe(resp=>{
              
              if(resp["name"] != ""){

                /*=============================================
                Separamos la comisión del Marketplace y el pago a la tienda del precio total de cada producto
                =============================================*/ 

                let commision = 0;
                let unitPrice = 0;

                if(localValidateCoupon){

                  commision = Number(localSubTotalPrice[index])*0.05;
                  unitPrice = Number(localSubTotalPrice[index])*0.95;

                }else{

                  commision = Number(localSubTotalPrice[index])*0.25;
                  unitPrice = Number(localSubTotalPrice[index])*0.75;

                }       

                /*=============================================
                Enviar información de la venta a la base de datos
                =============================================*/ 

                let id_payment = Cookies.get('_i');

                let body = {

                  id_order: resp["name"],
                  client: localUser.username,
                  product: product.name,
                  url:product.url,                  
                  quantity:product.quantity,
                  unit_price: unitPrice.toFixed(2),
                  commision: commision.toFixed(2), 
                  total: localSubTotalPrice[index],
                  payment_method: "Mercado Pago",
                  id_payment: id_payment,
                  date: new Date(),
                  status: "pending"

                }

                localSalesService.registerDatabase(body, localStorage.getItem("idToken"))
                .subscribe(resp=>{})
              
              }

            })


          })

          /*=============================================
          Preguntamos cuando haya finalizado el proceso de guardar todo en la base de datos
          =============================================*/ 

          if(totalRender == localShoppingCart.length){

            clearInterval(interval);
            Cookies.remove('_a')        
            Cookies.remove('_k')

            localStorage.removeItem("list");
            Cookies.remove('coupon');

            Sweetalert.fnc("success", "El pago fue Aprovado", "account/my-shopping");
          
          }     

        }

       },1000)


      /*=======================================
         Detenemos el intervalo 251
       =======================================*/

       if(count > 300){

          clearInterval(interval);
          window.open("account", "_parent");

       }

      
     }else{

      Sweetalert.fnc("error", "Requerimiento Invalido", null)

      return;

     }

  }

}


