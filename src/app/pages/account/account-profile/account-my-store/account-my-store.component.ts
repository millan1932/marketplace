import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { Path, Server } from '../../../../config';
import { DinamicRating, DinamicReviews, Tooltip, Rating, Sweetalert, Capitalize, CreateUrl } from '../../../../functions';

import { StoresService } from '../../../../services/stores.service';
import { ProductsService } from '../../../../services/products.service';
import { UsersService } from '../../../../services/users.service';
import { CategoriesService } from '../../../../services/categories.service';
import { SubCategoriesService } from '../../../../services/sub-categories.service';

import { StoresModel } from '../../../../models/stores.model';
import { ProductsModel } from '../../../../models/products.model';

import { Subject } from 'rxjs';

declare var jQuery:any;
declare var $:any;

@Component({
  selector: 'app-account-my-store',
  templateUrl: './account-my-store.component.html',
  styleUrls: ['./account-my-store.component.css']
})
export class AccountMyStoreComponent implements OnInit, OnDestroy {

  @Input() childItem:any;

    path:string  = Path.url;
    server:string  = Server.url;
    serverDelete:string  = Server.delete;
    preload:boolean = false;

    /*===============================================================
      Variable para almacenar la data de la tienda 316
    =================================================================*/
    store:any[]=[];
    /*===============================================================
      Variable para almacenar la data de los productos 316
    =================================================================*/
    products:any[]=[];
     /*===============================================================
      Variables para trabajar con DataTable 318
    =================================================================*/
    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject();

    /*=========================================================================
      Variable para identificar cuando termina la carga de los productos 318
    ==========================================================================*/
    loadProduct:number = 0;
    /*=========================================================================
      Variable render de DataTable 318
    ==========================================================================*/
    render:boolean = false;
    /*=========================================================================
      Variables para el  render de las reseñas 319
    ==========================================================================*/
    renderReview:boolean = false;
    loadReview:number = 0;
    /*=========================================================================
      Variable para capturar el total de calificaciones que tiene la tienda 321
    ==========================================================================*/
    totalReviews:any[]=[];   
     /*=========================================================================
      Variable para el modelo de tienda 323
    ==========================================================================*/ 
    storeModel: StoresModel;
     /*=============================================
    Variable para el número indicativo del país 323
    =============================================*/

    dialCode:string = null;
     /*=============================================
    Variable de tipo objeto para redes sociales 323
    =============================================*/

    social:object = {

        facebook:"",
        instagram:"",
        twitter:"",
        linkedin:"",
        youtube:""

    }
     /*================================================
    Variable para capturar el listado de paises 323
    ==================================================*/
    countries:any = null;

      /*================================================
   variable para almacenar los archivos de imagen de la tienda 324
    ==================================================*/
    logoStore:File = null;
    coverStore:File = null;

       /*================================================
   Variable para capturar el ID de la tienda 325
    ==================================================*/
    idStore:string=null;

    /*=============================================
    Variable para el modelo de tienda 327
    =============================================*/
    
    productModel: ProductsModel;

    /*=============================================
    Configuración inicial de Summernote  327
    =============================================*/

    config = {

        placeholder:'',
        tabsize:2,
        height:'400px',
        toolbar:[
            ['misc', ['codeview', 'undo', 'redo']],
            ['style', ['bold', 'italic', 'underline', 'clear']],
            ['para', ['style', 'ul', 'ol', 'paragraph', 'height']],
            ['insert', ['link','picture', 'hr']]
        ]

    }

     /*=============================================
    Variables de tipo arreglo para categorías y subcategorías
    =============================================*/

    categories:any[] = [];
    subcategories:any[] = [];

     /*=============================================
    Variables de tipo arreglo con objeto para el resumen del producto 327
    =============================================*/

    summaryGroup: any[] = [{

        input:''

    }]
 /*=============================================
    Variables de tipo arreglo con objetos para los detalles del producto 327
    =============================================*/

    detailsGroup: any[] = [{

        title:'',
        value:''

    }]

    /*=============================================
    Variables de tipo arreglo con objetos para las especificaciones del producto
    =============================================*/

    specificationsGroup: any[] = [{

        type:'',
        values:''

    }]

    /*=============================================
    Variables de tipo arreglo para las palabras claves del producto
    =============================================*/

    tags:any[] = [];

      /*=============================================
    Variables de tipo arreglo para la galería del producto
    =============================================*/

    gallery: File[] = [];
    editGallery: any[] = [];
    deleteGallery: any[] = [];

     /*=============================================
    Variables de tipo objeto para el banner superior del producto
    =============================================*/

    topBanner:object = {

        "H3 tag":"",
        "P1 tag":"",
        "H4 tag":"", 
        "P2 tag":"", 
        "Span tag":"",
        "Button tag":"",
        "IMG tag":""
    }
 /*=============================================
    Variables de tipo objeto para el slide horizontal del producto
    =============================================*/

    hSlider:object = {

        "H4 tag":"",
        "H3-1 tag":"",
        "H3-2 tag":"", 
        "H3-3 tag":"", 
        "H3-4s tag":"",
        "Button tag":"",
        "IMG tag":""
    }

    /*=============================================
    Variables de tipo arreglo para el video del producto
    =============================================*/

    video:any[] = [];

       /*=============================================
    Variables de tipo arreglo para las ofertas del producto
    =============================================*/

    offer: any[] = [];

    /*=============================================
    Variables para almacenar los archivos de imagen del producto
    =============================================*/

    imageProduct:File = null;
    topBannerImg:File = null;
    defaultBannerImg:File = null;
    hSliderImg:File = null;
    vSliderImg: File = null;

/*=============================================
        Variable para capturar el ID del Producto 330
    =============================================*/
   idProducts:any[]=[];
   idProduct:string = null;

/*================================================================================
  Variable que permite avisar al formulario que estamos editando producto 330
    ============================================================================*/
    editProductAction:boolean = false;
/*================================================================================
  Variable que muestra el mensaje antes de borrar el producto 334
    ============================================================================*/
    popoverMessage:string = 'Seguro de Remover el Producto?';


  constructor(private storesService:StoresService,
              private productsService:ProductsService,
              private usersService:UsersService,
              private categoriesService:CategoriesService,
              private subCategoriesService:SubCategoriesService,
              private http: HttpClient) { 

                this.storeModel = new StoresModel();
                this.productModel = new ProductsModel();
             }

  ngOnInit(): void {

    this.preload = true;

     /*===============================================================
       Agregar opciones a DataTable 318
    =================================================================*/

     this.dtOptions = {
          pagingType: 'full_numbers',
          processing: true

       }   

     /*===============================================================
      Validamos si el usuario ya tiene una tienda habilitada 273
    =================================================================*/

     this.storesService.getFilterData("username",this.childItem)
       .subscribe(resp=>{

        if(Object.keys(resp).length == 0){

         window.open("account/new-store", "_top");

          

        }else{

      /*===============================================================
      Almacenamos la informacion de la tienda 316
    =================================================================*/

      for(const i in resp){

        this.idStore = Object.keys(resp).toString();

        this.store.push(resp[i]);

         /*===============================================================
      Almacenamos la informacion de la tienda en el Modelo 323
    =================================================================*/
                  this.storeModel.store = resp[i].store;
                  this.storeModel.url = resp[i].url;
                  this.storeModel.about = resp[i].about;
                  this.storeModel.abstract = resp[i].abstract;
                  this.storeModel.email = resp[i].email;
                  this.storeModel.country = resp[i].country;
                  this.storeModel.city = resp[i].city;
                  this.storeModel.address = resp[i].address;
                  this.storeModel.logo = resp[i].logo;
                  this.storeModel.cover = resp[i].cover;
                  this.storeModel.username = resp[i].username;

                  /*=============================================
                  Dar formato al número teléfonico 323
                  =============================================*/

                  if(resp[i].phone != undefined){

                      this.storeModel.phone = resp[i].phone.split("-")[1];
                      this.dialCode = resp[i].phone.split("-")[0];
                  }

                   /*=============================================
                       Traer el listado de Paises 323
                  =============================================*/
                  this.usersService.getCountries()
                  .subscribe(resp=>{

                    this.countries = resp;
                  })
               }


      /*===============================================================
      Damos formato a las redes sociales de la tienda 316
    =================================================================*/ 

      this.store.map((item, index)=>{

          item.social = JSON.parse(item.social);
          item.newSocial = [];

          for(const i in item.social){

              if(item.social[i] != ""){

                  item.newSocial.push(i)

              }            

                 /*===============================================================
                    Capturamos el destino final de cada red social 323
                 =================================================================*/ 
                 switch(i){

                     case "facebook":
                     this.social["facebook"] = item.social[i].split("/").pop();
                     break;

                     case "instagram":
                     this.social["instagram"] = item.social[i].split("/").pop();
                     break;

                     case "twitter":
                     this.social["twitter"] = item.social[i].split("/").pop();
                     break;

                     case "linkedin":
                     this.social["linkedin"] = item.social[i].split("/").pop();
                     break;

                     case "youtube":
                     this.social["youtube"] = item.social[i].split("/").pop();
                     break;

                 }

          }

          return item;

      })

    /*===============================================================
      Traemos la data de productos de acuerdo al nombre de la tienda 316
    =================================================================*/ 

          this.productsService.getFilterDataStore("store", this.store[0].store)
          .subscribe(resp=>{

            /*===============================================================
              Almacenamos la informacion del producto 316
             =================================================================*/ 

              for(const i in resp){


                this.loadProduct++;

                this.products.push(resp[i]);

                this.idProducts = Object.keys(resp).toString().split(",");

              }

               /*===============================================================
              Damos formato a la data de productos 316
             =================================================================*/ 

              this.products.map((product, index)=>{

                  product.feedback = JSON.parse(product.feedback);
                  product.details = JSON.parse(product.details);
                  product.gallery = JSON.parse(product.gallery);
                  product.horizontal_slider = JSON.parse(product.horizontal_slider);
                  product.summary = JSON.parse(product.summary);
                  product.tags = JSON.parse(product.tags);
                  product.top_banner = JSON.parse(product.top_banner);

              /*===============================================================
                  Damos formato a las ofertas 316
             =================================================================*/ 

                  if(product.offer != ''){

                    product.offer = JSON.parse(product.offer);

                  }else{

                      product.offer = [];
                  }

                   /*===============================================================
                  Damos formato a las Especificaciones 316
                  =================================================================*/ 

                  if(product.specification != '' && product.specification != '[{\"\":[]}]'){

                     product.specification = JSON.parse(product.specification);

                  }else{

                     product.specification = [];
                  }


                   /*===============================================================
                  Damos formato al Video 316
                  =================================================================*/ 

                    product.video = JSON.parse(product.video);

                    if(product.video.length > 0){

                        if(product.video[0] == 'youtube'){


                            product.video = `https://www.youtube.com/embed/${product.video[1]}?rel=0&autoplay=0`;
                        }

                        if(product.video[0] == 'vimeo'){

                         product.video = `https://player.vimeo.com/video/${product.video[1]}`; 

                       }


                    }

                /*===============================================================
                  Damos formato a las Reseñas 316
                 =================================================================*/ 

                 this.totalReviews.push(JSON.parse(product.reviews));

                 let rating = DinamicRating.fnc(product);
                 product.reviews = DinamicReviews.fnc(rating);

                  return product;

              })

              /*===============================================================
                  Pintar el render en datatable 318
                 =================================================================*/ 

              if(this.loadProduct == this.products.length){

                this.dtTrigger.next();

              }
              
              
          })

            /*===============================================================
              Traer Data de Categorias 327
             =================================================================*/ 
             this.categoriesService.getData()
             .subscribe(resp=>{ 

              for(const i in resp){

                this.categories.push(resp[i]);

              }

            })

             /*===============================================================
              Agregar imagen del producto por defecto 328
             =================================================================*/ 
             this.productModel.image = `assets/img/products/default/default-image.jpg`;

             /*=============================================
                Agregar Imagen Banner Top por defecto
                =============================================*/

                this.topBanner["IMG tag"] = `assets/img/products/default/default-top-banner.jpg`;

                /*=============================================
                Agregar Imagen Banner Default por defecto
                =============================================*/

                this.productModel.default_banner = `assets/img/products/default/default-banner.jpg`;

                /*=============================================
                Agregar Imagen Slide Horizontal por defecto
                =============================================*/

                this.hSlider["IMG tag"] = `assets/img/products/default/default-horizontal-slider.jpg`;

                 /*=============================================
                Agregar Imagen Slide Vertical por defecto
                =============================================*/

                this.productModel.vertical_slider = `assets/img/products/default/default-vertical-slider.jpg`;

       /*===============================================================
              Finaliza el preload
             =================================================================*/ 
          this.preload = false;
        }

       })
  }
   /*===============================================================
    Callback Datatable 318
 =================================================================*/ 

 callback(i,totalReviews){

     if(!this.render){

        this.render = true;

        let globalRating = 0;
        let globalReviews = 0;

        setTimeout(function(){

  /*===============================================================
    Agregamos el tooltip para mostrar comentario de revision
 =================================================================*/

             Tooltip.fnc();

  /*===============================================================
    Aparecemos la tabla 320
 =================================================================*/
            
    $("table").animate({"opacity":1});

    $(".preloadTable").animate({"opacity":0});


  /*===============================================================
    Agregamos las calificaciones totales de la tienda 321
 =================================================================*/

    totalReviews.forEach(( review, index)=>{

      globalRating += review.length;

      for(const i in review){

        globalReviews += review[i].review       

      }

    }) 
    /*===============================================================
    Tomamos el promedio y porcentaje de calificaciones 321
 =================================================================*/

    let averageReviews = Math.round(globalReviews/globalRating);
    let precentage = Math.round(globalReviews*100/(globalRating*5));

    /*===============================================================
    Pintamos en el HTML el promedio y porcentaje de calificaciones 321
 =================================================================*/

    $(".globalRating").html(globalRating);
    $(".percentage").html(precentage);

    /*===============================================================
    Tomamos el Arreglo del promedio de calificaciones 321
 =================================================================*/

    let averageRating = DinamicReviews.fnc(averageReviews);

    /*===============================================================
    Pintamos en el HTML el select para el plugin Rating 321
 =================================================================*/

    $(".br-theme-fontawesome-stars").html(`

        <select class="ps-rating reviewsOption" data-read-only="true"></select>

      `)

    /*===============================================================
   Recorremos el arreglo del promedio de calificaciones para pintar los options 321
 =================================================================*/

    for(let i = 0; i < averageRating.length; i++){

        $(".reviewsOption").append(`

          <option value="${averageRating[i]}">${i+1}</option>


          `)
    }
  /*===============================================================
    Ejecutamos la funcion Rating 321
 =================================================================*/
        Rating.fnc();

        },i*10)
     }

 }

 /*===============================================================
    Callback 319
 =================================================================*/ 

 callbackReview(i){

   this.loadReview++;

   if(this.loadReview > this.loadProduct){

     if(!this.renderReview){

        this.renderReview = true;

             Rating.fnc();

     }

   }

 }

  /*===============================================================
    Validacion extra para cada campo del formulario 324
 =================================================================*/ 

  validate(input){

       /*===============================================================
    Validamos la informacion de la tienda 324
 =================================================================*/ 
      if($(input).attr("name") == "storeAbout"){

            /*===============================================================
              Validamos expresion regular de la informacion de la tienda 324
           =================================================================*/
           let pattern = /^[-\\(\\)\\=\\%\\&\\$\\;\\_\\*\\"\\#\\?\\¿\\!\\¡\\:\\,\\.\\0-9a-zA-ZñÑáéíóúÁÉÍÓÚ ]{1,1000}$/;  

            if(!pattern.test(input.value)){

                $(input).parent().addClass('was-validated');

                input.value = "";

                return;

            }else{

                this.storeModel.abstract = input.value.substr(0,100)+"...";
            }

      }

       /*=============================================
        Validamos la ciudad de la tienda 324
        =============================================*/

         if($(input).attr("name") == "storeCity"){

            /*=======================================================
            Validamos expresión regular de la ciudad de la tienda 324
            =======================================================*/ 

            let pattern = /^[A-Za-zñÑáéíóúÁÉÍÓÚ ]{1,}$/;

            if(!pattern.test(input.value)){

                $(input).parent().addClass('was-validated');

                input.value = "";

                return;

            }

        }

        /*=============================================
        Validamos el teléfono de la tienda 324
        =============================================*/

         if($(input).attr("name") == "storePhone"){

            /*========================================================
            Validamos expresión regular del teléfono de la tienda 324
            ========================================================*/ 

            let pattern = /^[-\\0-9 ]{1,}$/;

            if(!pattern.test(input.value)){

                $(input).parent().addClass('was-validated');

                input.value = "";

                return;

            }

        }

        /*=============================================
        Validamos la dirección de la tienda 324
        =============================================*/

         if($(input).attr("name") == "storeAddress"){

            /*=============================================
            Validamos expresión regular de la dirección de la tienda 324
            =============================================*/ 

            let pattern = /^[-\\(\\)\\=\\%\\&\\$\\;\\_\\*\\"\\#\\?\\¿\\!\\¡\\:\\,\\.\\0-9a-zA-ZñÑáéíóúÁÉÍÓÚ ]{1,1000}$/;

            if(!pattern.test(input.value)){

                $(input).parent().addClass('was-validated');

                input.value = "";

                return;

            }

        }

         /*===============================================================
         Validamos las Redes Sociales de la tienda 324
    =================================================================*/

    if($(input).attr("social") == "socialNetwork"){

            /*===============================================================
       Validamos expresion regular de la direccion de la tienda 324
    =================================================================*/        

       let pattern = /^[-\\_\\.\\0-9a-zA-Z]{1,}$/;

       if(!pattern.test(input.value)){

           $(input).parent().addClass('was-validated');

           //input.value = "";

           return;
       }

      }

    /*===============================================================
    Validamos el Nombre de la Tienda 327
 =================================================================*/ 
 if($(input).attr("name") == "productName"){

           /*=============================================
            Validamos expresión regular del nombre de la tienda
            =============================================*/ 

            let pattern = /^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]{1,}$/;

            if(!pattern.test(input.value)){

                $(input).parent().addClass('was-validated');

                input.value = "";

                return;
       }else{

      /*===============================================================
    Validamos que el nombre del producto no este repetido 327
 =================================================================*/ 
            this.productsService.getFilterDataMyStore("name", input.value)
            .subscribe(resp=>{

              if(Object.keys(resp).length > 0){

                $(input).parent().addClass('was-validated');
                input.value= "";
                this.productModel.url = "";

                Sweetalert.fnc("error", "El Nombre del Producto ya Existe", null)

                return;


              }else{

                    /*===============================================================
                       Capitulamos el Nombre del Producto 327
                    =================================================================*/ 
                    input.value = Capitalize.fnc(input.value);
                        /*===============================================================
                       Creamos la URL del Producto 327
                    =================================================================*/ 
                    this.productModel.url = CreateUrl.fnc(input.value);

              }


            })

         }

       }

          /*=============================================
        Validamos los TAGS de los Banner's y Slider's
        =============================================*/

        if($(input).attr("tags") == "tags"){

            /*=============================================
            Validamos expresión regular
            =============================================*/ 

            let pattern = /^[-\\(\\)\\=\\%\\&\\$\\;\\_\\*\\'\\#\\?\\¿\\!\\¡\\:\\,\\.\\0-9a-zA-ZñÑáéíóúÁÉÍÓÚ ]{1,50}$/;

            if(!pattern.test(input.value)){

                $(input).parent().addClass('was-validated');

                input.value = "";

                return;

            }

        }

         /*=============================================
        Validamos el video del producto
        =============================================*/

        if($(input).attr("name") == "id_video"){

            /*=============================================
            Validamos expresión regular
            =============================================*/ 

            let pattern = /^[-\\(\\)\\=\\%\\&\\$\\;\\_\\*\\"\\#\\?\\¿\\!\\¡\\:\\,\\.\\0-9a-zA-ZñÑáéíóúÁÉÍÓÚ ]{1,100}$/;

            if(!pattern.test(input.value)){

                $(input).parent().addClass('was-validated');

                return;

            }

        }

          /*=============================================
        Validamos el precio de envío y el precio de venta
        =============================================*/

        if($(input).attr("tags") == "prices"){

            /*=============================================
            Validamos expresión regular
            =============================================*/ 

            let pattern = /^[.\\,\\0-9]{1,}$/;

            if(!pattern.test(input.value)){

                $(input).parent().addClass('was-validated');

                return;

            }

        }

          /*=============================================
        Validamos dias de entrega y stock
        =============================================*/

        if($(input).attr("tags") == "intNumber"){

            /*=============================================
            Validamos expresión regular
            =============================================*/ 

            let pattern = /^[0-9]{1,}$/;

            if(!pattern.test(input.value)){

                $(input).parent().addClass('was-validated');

                return;

            }else{

                if($(input).attr("name") == "stock" &&  input.value > 100){

                    input.value = "";

                    Sweetalert.fnc("error", "The product exceeds 100 units", null)

                    return;

                }

            }

        }


  }

    /*===============================================================
    Validacion para las imagenes del formulario 324
 =================================================================*/ 
    validateImage(e, tagPicture){
  
        switch(tagPicture){

            case "changeLogo":
            this.logoStore = e.target.files[0];
            break;

            case "changeCover":
            this.coverStore = e.target.files[0];
            break;

            case "changeImage":
            this.imageProduct = e.target.files[0];
            break;

            case "changeTopBanner":
            this.topBannerImg = e.target.files[0];
            break;

            case "changeDefaultBanner":
            this.defaultBannerImg = e.target.files[0];
            break;

            case "changeHSlider":
            this.hSliderImg = e.target.files[0];
            break;

            case "changeVSlider":
            this.vSliderImg = e.target.files[0];
            break;

            
        }

       let image = e.target.files[0];

      /*===============================================================
      Validamos el formato de la imagen 283
    =================================================================*/

       if(image["type"] !== "image/jpeg" && image["type"] !== "image/png"){

          Sweetalert.fnc("error", "El formato de la Imagen debe ser. JPG o PNG", null)

          return;
       }    

    /*===============================================================
      Validamos el temaño de la imagen 283
    =================================================================*/

        else if(image["size"] > 4000000){

            Sweetalert.fnc("error", "Tamaño Maximo 4MB", null)

            return;
        }

     /*===============================================================
      Mostramos la Imagen Temporal 283
    =================================================================*/

      else{

        let data = new FileReader();
        data.readAsDataURL(image);

        $(data).on("load", function(event){

            let path = event.target.result;

            $(`.${tagPicture}`).attr("src", path)

        })
      }

    }


  /*===============================================================
    Envio del Formulario de la edicion de la tienda 322
 =================================================================*/ 

 onSubmitStore(f:NgForm){
 

   /*===============================================================
    Validacion completa del formulario 324
 =================================================================*/ 

    if(f.invalid){

      Sweetalert.fnc("error", "Invalido", null);

      return;
    }


   /*===============================================================
    Alerta suave mientras se edita la tienda 324
 =================================================================*/ 
  Sweetalert.fnc("loading", "Loading...", null);

  /*===============================================================
      Subir imagenes al servidor 325
    =================================================================*/

        let countAllImages = 0;
        let allImages = [

            {

              type:'logoStore',
              file: this.logoStore,
              folder:this.storeModel.url,
              path:'stores',
              width:'270',
              height:'270'

            },
            {
              type:'coverStore',
              file: this.coverStore,
              folder:this.storeModel.url,
              path:'stores',
              width:'1424',
              height:'768'
            }

            ]

            for(const i in allImages){

            const formData = new FormData();

            formData.append('file', allImages[i].file);
            formData.append('folder', allImages[i].folder);
            formData.append('path', allImages[i].path);
            formData.append('width', allImages[i].width);
            formData.append('height', allImages[i].height);

            this.http.post(this.server, formData)
            .subscribe(resp=>{

                  

                 if(resp["status"] != null && resp["status"] == 200){

                

                      if(allImages[i].type == "logoStore"){


                   /*===============================================================
                     Borrar antigua imagen del servidor 326
                   =================================================================*/

                         const formData = new FormData();


                        let fileDelete = `${allImages[i].path}/${allImages[i].folder}/${this.storeModel.logo}`;

                        formData.append("fileDelete", fileDelete);

                        this.http.post(this.serverDelete, formData)
                        .subscribe(resp=>{ })


                        this.storeModel.logo = resp["result"];
                      }                      
                      

                      if(allImages[i].type == "coverStore"){

                        /*===============================================================
                     Borrar antigua imagen del servidor 326
                   =================================================================*/

                         const formData = new FormData();


                          let fileDelete = `${allImages[i].path}/${allImages[i].folder}/${this.storeModel.cover}`;

                        formData.append("fileDelete", fileDelete);

                        this.http.post(this.serverDelete, formData)
                        .subscribe(resp=>{ })

                        this.storeModel.cover = resp["result"];

                      }                   
                                   

                 } 

                 countAllImages++; 

                   /*===============================================================
                     Preguntamos cuando termina de subir todas las imagenes 325
                   =================================================================*/

                   if(countAllImages == allImages.length){


                    /*===============================================================
                         consolidar numero telefonico de la tienda 325
                    =================================================================*/ 

                   this.storeModel.phone = `${this.dialCode}-${this.storeModel.phone}`;

                /*===============================================================
                        Consolidar redes sociales para la tienda 325
                    =================================================================*/
                   for(const i in Object.keys(this.social)){

                   if(this.social[Object.keys(this.social)[i]] != ""){

                    this.social[Object.keys(this.social)[i]] = `https://${Object.keys(this.social)[i]}.com/${this.social[Object.keys(this.social)[i]]}`


                     }

                    }

                   this.storeModel.social = JSON.stringify(this.social);


                 /*===============================================================
                   Editar la Tienda en la BD 325
                =================================================================*/ 

                 this.storesService.patchDataAuth(this.idStore, this.storeModel, localStorage.getItem("idToken"))
                 .subscribe(resp=>{


                    Sweetalert.fnc("success", "Actualizacion Correcta", "account/my-store");

                      }, err =>{

                        Sweetalert.fnc("error", err.error.error.message, null)
                      })

                   }


              })    

            }  
        }


    /*=============================================
    Traer la data de subcategorías de acuerdo a la categoría seleccionada 327
    =============================================*/

    changeCategory(input){

        let category = input.value.split("_")[0];

        this.subCategoriesService.getFilterData("category", category)
        .subscribe(resp=>{

            this.subcategories = [];

            for(const i in resp){

                this.subcategories.push(resp[i])
            }

        })

    }

      /*=============================================
    Adicionar Input's de forma dinámica
    =============================================*/

    addInput(type){

        if(type == "summary"){

            if(this.summaryGroup.length < 5){

                this.summaryGroup.push({

                    input:''
                })

            }else{

                Sweetalert.fnc("error", "Entry limit has been exceeded", null)

            }

        }

        if(type == "details"){

            if(this.detailsGroup.length < 10){

                this.detailsGroup.push({

                    title:'',
                    value:''
                })

            }else{

                Sweetalert.fnc("error", "Entry limit has been exceeded", null)

            }

        }


        if(type == "specifications"){

            if(this.specificationsGroup.length < 5){

                this.specificationsGroup.push({

                    type:'',
                    values:''
                })

            }else{

                Sweetalert.fnc("error", "Entry limit has been exceeded", null)

            }

        }

    }

    /*=============================================
    Quitar Input's de forma dinámica 331
    =============================================*/

    removeInput(i, type){

        if(i > 0){

            if(type == "summary"){

                this.summaryGroup.splice(i, 1) 

            }

            if(type == "details"){

                this.detailsGroup.splice(i, 1) 

            }

            if(type == "specifications"){

                this.specificationsGroup.splice(i, 1) 

            }
        }

    }
    /*===============================================================
    Funciones de Dropzone 329
 =================================================================*/
 onSelect(event){

     this.gallery.push(...event.addedFiles);

 } 

 onRemove(event){

  this.gallery.splice(this.gallery.indexOf(event), 1);

 }

  /*===============================================================
    Editar Producto 330
 =================================================================*/ 

    editProduct(idProduct){

      this.idProduct = idProduct;

       /*=============================================
        Alerta suave mientras se carga el formulario de edición 331
        =============================================*/

        Sweetalert.fnc("loading", "Loading...", null);
  /*============================
    Traemos la data del producto 330
 ==============================*/

 this.editProductAction = true;

 this.productsService.getUniqueData(idProduct)
 .subscribe(resp=>{

            this.productModel.name = resp["name"];
            this.productModel.url = resp["url"]; 
            this.productModel.category = resp["category"];
            this.productModel.sub_category = resp["sub_category"];
            this.productModel.title_list = resp["title_list"];
            this.productModel.description = resp["description"];
            this.productModel.views = resp["views"];
            this.productModel.sales = resp["sales"];
            this.productModel.image = resp["image"]; 
            this.productModel.default_banner = resp["default_banner"]; 
            this.productModel.vertical_slider = resp["vertical_slider"]; 
            this.productModel.price = resp["price"];
            this.productModel.shipping = resp["shipping"];
            this.productModel.delivery_time = resp["delivery_time"];
            this.productModel.stock = resp["stock"];

  /*============================
   Cargar el resumen del producto 331
 ==============================*/

 this.summaryGroup = [];

 JSON.parse(resp["summary"]).forEach(value=>{

    this.summaryGroup.push({

          input:value

        })

  })

          /*=============================================
            Cargar los detalles del producto 331
            =============================================*/

            this.detailsGroup = []; 

            JSON.parse(resp["details"]).forEach(detail=>{

                this.detailsGroup.push({

                    title:detail.title,
                    value:detail.value

                })

            }) 


            /*=============================================
            Cargar las especificaciones del producto 331
            =============================================*/  

            this.specificationsGroup = [];  

            JSON.parse(resp["specification"]).forEach(spec=>{

                for(const i in spec){

                    this.specificationsGroup.push({

                        type:i,
                        values:spec[i]

                    })

                }
               
            })

               /*=============================================
            Cargar las especificaciones del producto 331
            =============================================*/ 

            JSON.parse(resp["tags"]).forEach(item=>{
               
                this.tags.push(item)

            })  

            /*=============================================
            Cargar la galería del producto 331
            =============================================*/  

            JSON.parse(resp["gallery"]).forEach(item=>{
               
                this.editGallery.push(item)
              
            }) 

             /*=============================================
            Carga del banner superior del producto 331
            =============================================*/
               
            this.topBanner["H3 tag"] = JSON.parse(resp["top_banner"])["H3 tag"];
            this.topBanner["P1 tag"] = JSON.parse(resp["top_banner"])["P1 tag"];
            this.topBanner["H4 tag"] = JSON.parse(resp["top_banner"])["H4 tag"];
            this.topBanner["P2 tag"] = JSON.parse(resp["top_banner"])["P2 tag"];
            this.topBanner["Span tag"] = JSON.parse(resp["top_banner"])["Span tag"];
            this.topBanner["Button tag"] = JSON.parse(resp["top_banner"])["Button tag"];
            this.topBanner["IMG tag"] = JSON.parse(resp["top_banner"])["IMG tag"];

              /*=============================================
            Carga del slide horizontal del producto
            =============================================*/

            this.hSlider["H4 tag"] = JSON.parse(resp["horizontal_slider"])["H4 tag"];
            this.hSlider["H3-1 tag"] = JSON.parse(resp["horizontal_slider"])["H3-1 tag"];
            this.hSlider["H3-2 tag"] = JSON.parse(resp["horizontal_slider"])["H3-2 tag"];
            this.hSlider["H3-3 tag"] = JSON.parse(resp["horizontal_slider"])["H3-3 tag"];
            this.hSlider["H3-4s tag"] = JSON.parse(resp["horizontal_slider"])["H3-4s tag"];
            this.hSlider["Button tag"] = JSON.parse(resp["horizontal_slider"])["Button tag"];
            this.hSlider["IMG tag"] = JSON.parse(resp["horizontal_slider"])["IMG tag"];

            /*=============================================
            Carga del video del producto
            =============================================*/

            JSON.parse(resp["video"]).forEach(value=>{

                this.video.push(value);
               
            }) 
            /*=============================================
            Carga de las ofertas del producto
            =============================================*/

            if(resp["offer"] != ""){

                JSON.parse(resp["offer"]).forEach(value=>{

                    this.offer.push(value);
                   
                })  

            }  

  /*=============================================
            Abrir la ventana modal 331
            =============================================*/  

            $("#formProduct").modal() 

            /*=============================================
            Cerrar la Alerta suave 331
            =============================================*/

            Sweetalert.fnc("close", "", null);

        })

    }

     /*=============================================
    Removemos foto de la galería 331
    =============================================*/  

    removeGallery(pic){

        this.editGallery.forEach((name,index)=>{

            if(pic == name){

                this.deleteGallery.push(pic);

                this.editGallery.splice(index, 1);
            
            }

        })

    }




  /*===============================================================
    Formulario para la creacion o edicion de productos 327
 =================================================================*/ 

 onSubmitProduct(f:NgForm){

        /*=============================================
        Validar que el producto esté correctamente creado 329
        =============================================*/

        let formProduct = $(".formProduct");

           for(let i = 0; i < formProduct.length; i++){

            if($(formProduct[i]).val() == "" || $(formProduct[i]).val() == undefined){

                $(formProduct[i]).parent().addClass("was-validated")

            }
        }

         /*=============================================
        Validamos que las palabras claves tenga como mínimo una sola palabra 329
        =============================================*/

        if(this.tags.length == 0){

            Sweetalert.fnc("error", "Campos Incompletos", null);  

            return;

        }

         /*=============================================
        Validamos que la galería tenga como mínimo una sola imagen 329
        =============================================*/

        if(!this.editProductAction){

        if(this.gallery.length == 0){

          Sweetalert.fnc("error", "Campo Incompleto", null);

          return;

        }

     }else{

        if(this.editGallery.length == 0 && this.gallery.length == 0){

           Sweetalert.fnc("error", "Galeria de Productos Incompleta", null);

           return;
        }

     }

  /*===============================================================
    Validacion completa del formulario 329
 =================================================================*/

    if(f.invalid){

      Sweetalert.fnc("error", "Campos Incompletos", null);

      return;

    }
     /*=============================================
        Alerta suave mientras se registra la tienda y el producto 329
        =============================================*/

        Sweetalert.fnc("loading", "Loading...", null);

         /*=============================================
        Subir imagenes al servidor 329
        =============================================*/

        let folder = "";

        if(!this.editProductAction){

            folder = this.productModel.category.split("_")[1];

       }else{

         folder = this.productModel.category;

       }    

        let countAllImages = 0;

         let allImages = [
           
            {
                type:'imageProduct',
                file: this.imageProduct,
                folder:folder,
                path:'products',
                width:'300',
                height:'300'
            },
            {
                type:'topBannerImg',
                file: this.topBannerImg,
                folder:`${folder}/top`,
                path:'products',
                width:'1920',
                height:'80'
            },
            {
                type:'defaultBannerImg',
                file: this.defaultBannerImg,
                folder:`${folder}/default`,
                path:'products',
                width:'570',
                height:'210'
            },
            {
                type:'hSliderImg',
                file: this.hSliderImg,
                folder:`${folder}/horizontal`,
                path:'products',
                width:'1920',
                height:'358'
            },
            {
                type:'vSliderImg',
                file: this.vSliderImg,
                folder:`${folder}/vertical`,
                path:'products',
                width:'263',
                height:'629'
            }

        ]

        for(const i in allImages){

           const formData = new FormData();

            formData.append('file', allImages[i].file);
            formData.append('folder', allImages[i].folder);
            formData.append('path', allImages[i].path);
            formData.append('width', allImages[i].width);
            formData.append('height', allImages[i].height);

            this.http.post(this.server, formData)
            .subscribe( resp=>{  

              if(resp["status"] != null && resp["status"] == 200){ 

                if(allImages[i].type == "imageProduct"){

                  if(this.editProductAction){


                        /*===============================================================
                     Borrar antigua imagen del servidor 332
                   =================================================================*/

                         const formData = new FormData();


                          let fileDelete = `${allImages[i].path}/${allImages[i].folder}/${this.productModel.image}`;

                        formData.append("fileDelete", fileDelete);

                        this.http.post(this.serverDelete, formData)
                        .subscribe(resp=>{ })


                  }

                   this.productModel.image = resp["result"];

                }

                if(allImages[i].type == "topBannerImg"){

                   if(this.editProductAction){


                        /*===============================================================
                     Borrar antigua imagen del servidor 332
                   =================================================================*/

                         const formData = new FormData();


                          let fileDelete = `${allImages[i].path}/${allImages[i].folder}/${this.topBanner["IMG tag"]}`;

                        formData.append("fileDelete", fileDelete);

                        this.http.post(this.serverDelete, formData)
                        .subscribe(resp=>{ })


                  }

                  this.topBanner["IMG tag"] = resp["result"];

                }

                if(allImages[i].type == "defaultBannerImg"){

                   if(this.editProductAction){


                        /*===============================================================
                     Borrar antigua imagen del servidor 332
                   =================================================================*/

                         const formData = new FormData();


                          let fileDelete = `${allImages[i].path}/${allImages[i].folder}/${this.productModel.default_banner}`;

                        formData.append("fileDelete", fileDelete);

                        this.http.post(this.serverDelete, formData)
                        .subscribe(resp=>{ })


                  }

                  this.productModel.default_banner = resp["result"];

                }

                if(allImages[i].type == "hSliderImg"){

                   if(this.editProductAction){


                        /*===============================================================
                     Borrar antigua imagen del servidor 332
                   =================================================================*/

                         const formData = new FormData();


                          let fileDelete = `${allImages[i].path}/${allImages[i].folder}/${this.hSlider["IMG tag"]}`;

                        formData.append("fileDelete", fileDelete);

                        this.http.post(this.serverDelete, formData)
                        .subscribe(resp=>{ })


                  }

                  this.hSlider["IMG tag"] = resp["result"];

                }

                if(allImages[i].type == "vSliderImg"){

                    if(this.editProductAction){


                        /*===============================================================
                     Borrar antigua imagen del servidor 332
                   =================================================================*/

                         const formData = new FormData();


                          let fileDelete = `${allImages[i].path}/${allImages[i].folder}/${this.productModel.vertical_slider}`;

                        formData.append("fileDelete", fileDelete);

                        this.http.post(this.serverDelete, formData)
                        .subscribe(resp=>{ })


                  }

                  this.productModel.vertical_slider = resp["result"];

                }

              }

              countAllImages++


  /*===============================================================
   Preguntamos cuando termina de subir todas las imagenes 329
 =================================================================*/ 

     if(countAllImages == allImages.length){


      if(!this.editProductAction){

         /*===============================================================
        consolidar fecha de creacion del producto 329
      =================================================================*/ 
         this.productModel.date_created = new Date();
       /*===============================================================
       consolidar el feedback para el producto 329
     =================================================================*/ 
      this.productModel.feedback = {

         type:"review",
        comment:"Your product is under review"

       }

       this.productModel.feedback = JSON.stringify(this.productModel.feedback); 
      /*===============================================================
       Consolidar categoria del producto 329
      =================================================================*/

      this.productModel.category = this.productModel.category.split("_")[1];
     /*===============================================================
       Consolidar lista de titulos para el producto 329
     =================================================================*/ 
      this.productModel.title_list = this.productModel.sub_category.split("_")[1];
      /*===============================================================
       Consolidar sub-categoria para el producto 329
     =================================================================*/ 
     this.productModel.sub_category = this.productModel.sub_category.split("_")[0];

     /*===============================================================
      Consolidar el nombre de la tienda para el producto 329
    =================================================================*/ 
     this.productModel.store = this.storeModel.store;

     /*===============================================================
      Consolidar calificaciones para el producto 329
      =================================================================*/ 
     this.productModel.reviews = "[]";

      /*===============================================================
       Consolidar las ventas y las vistas del producto 329
     =================================================================*/
    this.productModel.sales = 0;
    this.productModel.views = 0;

  } 

 /*===============================================================
   Consolidar Resumen del producto 329
 =================================================================*/

 let newSummary = [];

 for(const i in this.summaryGroup){

  newSummary.push(this.summaryGroup[i].input);
  this.productModel.summary = JSON.stringify(newSummary);

      }

      /*===============================================================
   Consolidar detalles del producto 329
 =================================================================*/
    this.productModel.details = JSON.stringify(this.detailsGroup);

                  /*=============================================
                    Consolidar especificaciones del producto 329
                    =============================================*/
                    
                    if(Object.keys(this.specificationsGroup).length > 0){

                        let newSpecifications = [];

                        for(const i in this.specificationsGroup){

                            let newValue = [];

                            for(const f in this.specificationsGroup[i].values){

                                if(this.specificationsGroup[i].values[f].value!= undefined){

                                    newValue.push(`'${this.specificationsGroup[i].values[f].value}'`)

                                }else{

                                    newValue.push(`'${this.specificationsGroup[i].values[f]}'`)
                                }
                       
                            }

                            newSpecifications.push(`{'${this.specificationsGroup[i].type}':[${newValue}]}`)

                        }

                        this.productModel.specification = JSON.stringify(newSpecifications);
                        this.productModel.specification = this.productModel.specification.replace(/["]/g, '');
                        this.productModel.specification = this.productModel.specification.replace(/[']/g, '"');

                    }else{

                        this.productModel.specification = "";
                       
                    }

                      /*=============================================
                     Consolidar palabras claves para el producto 329
                    =============================================*/

                    let newTags = [];  

                    for(const i in this.tags){

                        if(this.tags[i].value!= undefined){

                            newTags.push(this.tags[i].value);

                        }else{

                           newTags.push(this.tags[i]);
                        }   
                       
                    }
                   
                    this.productModel.tags = JSON.stringify(newTags).toLowerCase();

                     /*=============================================
                    Consolidar Top Banner del producto 329
                    =============================================*/

                    this.productModel.top_banner = JSON.stringify(this.topBanner);

                    /*=============================================
                    Consolidar Horizontal Slider del producto 329
                    =============================================*/

                    this.productModel.horizontal_slider = JSON.stringify(this.hSlider);

                    /*=============================================
                    Consolidar Video del producto 329 
                    =============================================*/

                    this.productModel.video = JSON.stringify(this.video);

                    /*=============================================
                    Consolidar Oferta 329
                    =============================================*/

                    if(this.offer.length > 0){

                        this.productModel.offer = JSON.stringify(this.offer);

                    }else{

                        this.productModel.offer = "[]";
                    } 

                      /*=============================================
                    Subir galería al servidor 329
                    =============================================*/
                    let countGallery = 0;
                    let newGallery = [];

                      /*=============================================
                    Preguntamos si estamos subiendo nuevas imagenes a la galeria 333
                    =============================================*/

                    if(this.gallery.length > 0){

                        /*=============================================
                   Actualizar Galeria 333
                    =============================================*/

                    if(this.editProductAction){

                    /*=====================================================
                      Borrar imagen de galeria del servidor 333
                    =====================================================*/

                    for(const i in this.deleteGallery){

                       /*===============================================================
                     Borrar antigua imagen del servidor 333
                   =================================================================*/

                        const formData = new FormData();

                                let fileDelete = `products/${folder}/gallery/${this.deleteGallery[i]}`;

                                formData.append("fileDelete", fileDelete);

                                this.http.post(this.serverDelete, formData)
                                .subscribe(resp=>{})

                            }

                   /*=====================================================
                       Agregar imagenes nuevas al array de la galeria 333
                    =====================================================*/

                       for(const i in this.editGallery){

                         newGallery.push(this.editGallery[i]);
                       }

                    }


                    /*====================================================
                    Subimos imagenes nuevas de la galeria al servidor 333
                    =====================================================*/

                    for(const i in this.gallery){

                      const formData = new FormData();

                            formData.append('file', this.gallery[i]);
                            formData.append('folder', `${folder}/gallery`);
                            formData.append('path', 'products');
                            formData.append('width', '1000');
                            formData.append('height', '1000');

                            this.http.post(this.server, formData)
                            .subscribe(resp=>{

                                if(resp["status"] != null && resp["status"] == 200){  

                                    newGallery.push(resp["result"]);

                                }
                    
                                countGallery++;

                                   /*=============================================
                                Preguntamos cuando termina de subir toda la galería 329
                                =============================================*/
                                    
                                if(countGallery == this.gallery.length){

                                    /*=============================================
                                    Consolidar los nombres de archivo de la galería 329
                                    =============================================*/

                                    this.productModel.gallery = JSON.stringify(newGallery);

                                    if(!this.editProductAction){

                                        /*=============================================
                                        Crear el producto en la BD
                                        =============================================*/

                                        this.productsService.registerDatabase(this.productModel, localStorage.getItem("idToken"))   
                                        .subscribe(resp=>{

                                          
                                            if(resp["name"] != ""){                                                 

                                                Sweetalert.fnc("success", "Producto Creado Exitosamente", "account/my-store");  

                                            }                                                                                                         

                                        }, err =>{

                                            Sweetalert.fnc("error", err.error.error.message, null)

                                        })


                                      }else{

                                        /*==================================
                                          Editar el producto en la BD 333
                                        ====================================*/

                                        this.productsService.patchDataAuth(this.idProduct, this.productModel, localStorage.getItem("idToken"))
                                        .subscribe(resp=>{

                                                                                    

                                                Sweetalert.fnc("success", "Producto Actualizado Exitosamente", "account/my-store");  

                                                                                                                                                

                                        }, err =>{

                                            Sweetalert.fnc("error", err.error.error.message, null)

                                        })


                                      } 

                                }

                              })


                             } 

                           }  else{

                             /*=============================================
                                    Consolidar los nombres de archivo de la galería 333
                                    =============================================*/

                                    this.productModel.gallery = JSON.stringify(this.editGallery);

                                    /*==================================
                                          Editar el producto en la BD 333
                                        ====================================*/

                                        this.productsService.patchDataAuth(this.idProduct, this.productModel, localStorage.getItem("idToken"))
                                        .subscribe(resp=>{

                                                                                    

                                                Sweetalert.fnc("success", "Producto Actualizado Exitosamente", "account/my-store");  

                                                                                                                                                

                                        }, err =>{

                                            Sweetalert.fnc("error", err.error.error.message, null)

                                        })

                           }

                       }

                    })

                  }

                 }
/*===============================================================
    Eliminar el Producto 334
 =================================================================*/ 

 deleteProduct(idProduct, products, i){

  /*=============================================
        Preguntamos si hay más de un producto para borrar 334
        =============================================*/

        if(products.length > 1){

            let allImages = [];
            let countDelete = 0;

            /*=============================================
             Borramos todos los archivos del servidor relacionados con el producto 334
        =============================================*/

          this.products.forEach((product, index)=>{

              if(i == index){

                allImages.push(


                        `products/${product.category}/${product.image}`,
                        `products/${product.category}/default/${product.default_banner}`,
                        `products/${product.category}/top/${product.top_banner["IMG tag"]}`,
                        `products/${product.category}/horizontal/${product.horizontal_slider["IMG tag"]}`,
                        `products/${product.category}/vertical/${product.vertical_slider}`


                  )

                for(const i in product.gallery){


                   allImages.push( `products/${product.category}/gallery/${product.gallery[i]}`);

                }

                for(const i in allImages){

                     /*===============================================================
                     Borrar todas las imagenes del servidor 334
                   =================================================================*/

            const formData = new FormData();


                  formData.append("fileDelete", allImages[i]);

                  this.http.post(this.serverDelete, formData)
                  .subscribe(resp=>{



                    if(resp["status"] == 200){

                      countDelete++;

                      if(countDelete == allImages.length){

                          this.productsService.deleteDataAuth(idProduct, localStorage.getItem("idToken"))
                          .subscribe(resp=>{

                                         Sweetalert.fnc("success", "Producto Removido", "account/my-store");                                                         
                                    }, err =>{

                                        Sweetalert.fnc("error", err.error.error.message, null)

                                    })    

                                }

                            }

                        })

                    }

                }

            }) 


        }else{

            Sweetalert.fnc("error", "La tienda no puede estar sin productos", null)

        }

    }


  /*=============================================
  Destruímos el trigger de angular 318
  =============================================*/

  ngOnDestroy():void{

    this.dtTrigger.unsubscribe();
  }

}
