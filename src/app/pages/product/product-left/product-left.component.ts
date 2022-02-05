import { Component, OnInit } from '@angular/core';
import { Path } from '../../../config';
import { Rating,DinamicRating, DinamicReviews, DinamicPrice, CountDown, ProgressBar, Tabs, SlickConfig, ProductLightbox, Quantity, Tooltip } from '../../../functions';

import { ActivatedRoute, Router } from '@angular/router';

import { ProductsService } from '../../../services/products.service';
import { UsersService } from '../../../services/users.service';

declare var jQuery:any;
declare var $:any;

@Component({
  selector: 'app-product-left',
  templateUrl: './product-left.component.html',
  styleUrls: ['./product-left.component.css']
})
export class ProductLeftComponent implements OnInit {

	path:string = Path.url;
	product:any[]= [];
	rating:any[] = [];
	reviews:any[] = [];
	price:any[] = [];
	preload:boolean = false;
	render:boolean = true;
	countd:any[] = [];
	gallery:any[] = [];
	renderGallery:boolean = true;
	video:string = null;
	tags:any[]=[];
  totalReviews:string;
  offer:boolean = false;
  quantity:number = 1;
  summary:any[]=[];
  details:any[]=[];

  constructor(private activateRoute: ActivatedRoute,
  	    private productsService: ProductsService,
          private usersService: UsersService,
          private router:Router) { }

  ngOnInit(): void {

  	this.preload = true;

  	this.productsService.getFilterData("url", this.activateRoute.snapshot.params["param"])
  	.subscribe(resp =>{

  		this.productsFnc(resp);
  	})
  }

 /*====================================================
    Declaramos funcion para mostrar los productos recomendados
  	====================================================*/

  productsFnc(response){

       this.product = [];
   	 /*====================================================
    Hacemos un recorrido por la respuesta que nos traiga el filtrado
  	====================================================*/


  	let i;
  	let getProduct = [];

  	for (i in response){

  		getProduct.push(response[i]);

  	}

  	
  	/*====================================================
    Filtramos el producto
  	====================================================*/
     getProduct.forEach((product, index)=>{     	

         this.product.push(product);

         this.rating.push(DinamicRating.fnc(this.product[index]));
         
         this.reviews.push(DinamicReviews.fnc(this.rating[index]));

         this.price.push(DinamicPrice.fnc(this.product[index]));

         this.summary.push(JSON.parse(this.product[index].summary));

         this.details.push(JSON.parse(this.product[index].details));

         /*=====================================
          Agregamos la fecha al descontador 128
         =======================================*/
         if(this.product[index].offer != ""){

            let today = new Date();

            let offerDate = new Date(

                    parseInt(JSON.parse(this.product[index].offer)[2].split("-")[0]),
                    parseInt(JSON.parse(this.product[index].offer)[2].split("-")[1])-1,
                    parseInt(JSON.parse(this.product[index].offer)[2].split("-")[2])
                )

            if(today < offerDate){

                this.offer = true;

         	const date = JSON.parse(this.product[index].offer)[2];
         	this.countd.push(

                new Date(
 
                     parseInt(date.split("-")[0]),
                     parseInt(date.split("-")[1])-1,
                     parseInt(date.split("-")[2])
                	)
         	)

           }
         }

    /*====================================================
         Gallery 130
  	====================================================*/

  	  this.gallery.push(JSON.parse(this.product[index].gallery))

  	  /*====================================================
         Video 131 
  	====================================================*/

    //if(JSON.parse(this.product[index].video).length > 0){

  	if(JSON.parse(this.product[index].video)[0] == "youtube"){

  		this.video = `https://www.youtube.com/embed/${JSON.parse(this.product[index].video)[0]}?rel=0&autoplay=0`     

  	}
  	if (JSON.parse(this.product[index].video)[0] == "vimeo"){

  		this.video = `https://player.vimeo.com/video/${JSON.parse(this.product[index].video)[1]}`
      
  	}
  		//}

  		/*===========================
         Agregamos los tags 134
  		=============================*/

         this.tags = JSON.parse(this.product[index].tags);

    /*===================
     Total Reviews 137
    ====================*/
    this.totalReviews = JSON.parse(this.product[index].reviews).length;
                  
  
        this.preload = false;

     	
     })

 }

 /*===================
     Funcion callback
    ====================*/
     callback(){

     	if(this.render){

     		this.render = false;

     		Rating.fnc();
     		CountDown.fnc();
     		ProgressBar.fnc();
     		Tabs.fnc();
     		Quantity.fnc();
            Tooltip.fnc();

          /*================================
           Agregamos detalles del producto
           ================================*/

            if($(".ps-product__variations").attr("specification") != "" && 
              $(".ps-product__variations").attr("specification") != '[{\"\":[]}]'){

   /*===============================================
    Recorremos el array de objetos de detalles 213
    ===============================================*/

    
     JSON.parse($(".ps-product__variations").attr("specification")).forEach((detail, index)=>{

         /*===============================================
    Seleccionamos el nombre de propiedad de cada detalle 213
    ===============================================*/

        let property = Object.keys(detail).toString();

         /*===============================================
    construimos el HTML que va aparecer en la vista 213
    ===============================================*/

        let figure =  ` <figure class="details${index}">
                                        
                        <figcaption>${property}: <strong>Eligue una Opcion</strong></figcaption>

                        <div class="d-flex"> 
                        </div> 
                    </figure>`

     /*===============================================
    pintamos en la vista el HTML de figure 213
    ===============================================*/

                    $(".ps-product__variations").append(`

                        ${figure}

                        `)
                    for(const i in detail[property]){

                        if(property == "Color"){

                            $(`.details${index} .d-flex`).append(`


                                <div
                                  class="rounded-circle mr-3  details ${property}"
                                  detailType="${property}"
                                  detailValue="${detail[property][i]}"
                                  data-toggle="tooltip" title="${detail[property][i]}"
                                  style="background-color:${detail[property][i]}; width:30px; height:30px; cursor:pointer; border:1px solid #bbb"></div>

                               `)
                        }else{

                             $(`.details${index} .d-flex`).append(`


                                 <div
                                   class="py-2 px-3 mr-3  details ${property}"
                                   detailType="${property}"
                                   detailValue="${detail[property][i]}"
                                   data-toggle="tooltip" title="${detail[property][i]}"
                                   style="cursor:pointer; border:1px solid #bbb">${detail[property][i]}</div>


                               `)


                        }


                    }
             })

          }

    /*==================================================
     Agregamos detalle de producto al localstorage 214
    ===================================================*/

    $(document).on("click", ".details", function(){

    /*==================================================
     Señalar el detalle escogido 214
    ===================================================*/

    let details = $(`.details.${$(this).attr("detailType")}`);

    for(let i = 0; i < details.length; i++){

        $(details[i]).css({"border":"1px solid #bbb"})
    }

    $(this).css({"border":"3px solid #bbb"})  

      /*==================================================
    preguntamos si existen detalles en el localstorage 214
    ===================================================*/

    if(localStorage.getItem("details")){

        let details = JSON.parse(localStorage.getItem("details"));

        for(const i in details){

            details[i][$(this).attr("detailType")] = $(this).attr("detailValue");

            localStorage.setItem("details", JSON.stringify(details))
        }

    }else{

      localStorage.setItem("details", `[{"${$(this).attr("detailType")}":"${$(this).attr("detailValue")}"}]`)

    }


   

            })

            
     	}

  }

   /*============================
     Funcion callback Galeria
    ====================*/

  callbackGallery(i){

  	if(this.renderGallery){

  		this.renderGallery = false;

        $(".ps-product__thumbnail").hide();

        setTimeout(function(){

         $(".ps-product__thumbnail").show();

          SlickConfig.fnc()
          ProductLightbox.fnc()

        },i*100)

  		
  	}
  }

   /*====================================================
          Funcion para agregar producto a la lista de deseos 193
      ====================================================*/

      addWishlist(product){

        this.usersService.addWishlist(product);

      }

      /*=============================================================
          Funcion cambio de cantidad 217
      ==============================================================*/

      changeQuantity(quantity, unit, move){

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

        $(".quantity input").val(quantity);

        this.quantity = number;

      }

       /*=============================================================
          Funcion para agregar producto al carrito de compras 203
      ==============================================================*/
      addShoppingCart(product, unit, details){

         /*=============================================================
          Preguntamos si existen detalles en el localStorage 215
      ==============================================================*/

      if(localStorage.getItem("details")){

        details = localStorage.getItem("details");

      }

               /*=============================================================
          Agregar producto al carrito de compras 215
      ==============================================================*/

          let url = this.router.url;

          let item = {

            product: product,
            unit: this.quantity,
            details: details,
            url:url
          }

          localStorage.removeItem("details");

          this.usersService.addShoppingCart(item);
      }


       /*=============================================================
          Funcion para agregar producto al carrito de compras 254
      ==============================================================*/
      buyNow(product, unit, details){

         /*=============================================================
          Preguntamos si existen detalles en el localStorage 254
      ==============================================================*/

      if(localStorage.getItem("details")){

        details = localStorage.getItem("details");

      }

    /*=============================================================
          Agregar producto al carrito de compras 254
      ==============================================================*/

          let url = this.router.url;

          let item = {

            product: product,
            unit: this.quantity,
            details: details,
            url:'checkout'
          }

          localStorage.removeItem("details");

          this.usersService.addShoppingCart(item);
      }

}
