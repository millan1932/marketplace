import { Component, OnInit, Input, NgZone } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { Path, Server } from '../../../../config';
import { Sweetalert, Capitalize, CreateUrl } from '../../../../functions';

import { StoresService } from '../../../../services/stores.service';
import { UsersService } from '../../../../services/users.service';
import { ProductsService } from '../../../../services/products.service';
import { CategoriesService } from '../../../../services/categories.service';
import { SubCategoriesService } from '../../../../services/sub-categories.service';

import { StoresModel } from '../../../../models/stores.model';
import { ProductsModel } from '../../../../models/products.model';

declare var jQuery:any;
declare var $:any;


@Component({
  selector: 'app-account-new-store',
  templateUrl: './account-new-store.component.html',
  styleUrls: ['./account-new-store.component.css']
})
export class AccountNewStoreComponent implements OnInit {

  @Input() childItem:any;

  path:string = Path.url;
  server:string = Server.url;

   /*===============================================================
    Variable para aceptar terminos y condiciones 275
    =================================================================*/
  accept:boolean=false;
   /*===============================================================
    Variable para saber que la creacion de la tienda esta lista 276
    =================================================================*/ 
  storeOK:boolean=false;
  /*===============================================================
    Variable para el Modelo de tiendas 277 y productos 287
    =================================================================*/
    store: StoresModel;
    product: ProductsModel;
     /*===============================================================
    Variable para el Numero indicativo del pais 281
    =================================================================*/
    dialCode:string = null;
    /*===============================================================
    Variable para capturar el listado de paises 281
    =================================================================*/
    countries:any = null;
    /*===============================================================
    Variable de tipo objeto para Redes Sociales 285
    =================================================================*/

    social:object = {

        facebook:"",
        instagram:"",
        twitter:"",
        linkedin:"",
        youtube:""

    }

     /*===============================================================
    Variables de tipo arreglo para categorias y subcategorias 288
    =================================================================*/
      categories:any[] = [];
      subcategories:any[] = [];


     /*===============================================================
      Configuracion inicial de Summernote 289
    =================================================================*/
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

      /*=====================================================================
      Variable de tipo arreglo con objeto para el resumen del producto 290
    =======================================================================*/
    summaryGroup: any[] = [{

      input:''

    }]

     /*=====================================================================
      Variable de tipo arreglo con objeto para los detalles del producto 292
    =======================================================================*/
    detailsGroup: any[] = [{

      title:'',
      value:''

    }]


    /*=====================================================================
      Variable de tipo arreglo con objetos para las especificaciones del producto 293
    =======================================================================*/
    specificationsGroup: any[] = [{

      type:'',
      values:''

    }]

     /*=====================================================================
      Variable de tipo arreglo para las palabras claves del producto 294
    =======================================================================*/

   tags:any[] = [];

     /*=====================================================================
      Variable de tipo arreglo para la galeria del producto 296
    =======================================================================*/

   gallery: File[] = [];

    /*=====================================================================
     Variable de tipo objeto para el banner superior del producto 297
    =======================================================================*/
    topBanner:object = {

        "H3 tag":"",
        "P1 tag":"",
        "H4 tag":"", 
        "P2 tag":"", 
        "Span tag":"",
        "Button tag":"",
        "IMG tag":""

    }

     /*=====================================================================
     Variable de tipo objeto para el slide horizontal del producto 299
    =======================================================================*/
    hSlider:object = {

        "H4 tag":"",
        "H3-1 tag":"",
        "H3-2 tag":"", 
        "H3-3 tag":"", 
        "H3-4s tag":"",
        "Button tag":"",
        "IMG tag":""

    }

    /*=====================================================================
     Variable de tipo arreglo para el video del producto 301
    =======================================================================*/
    video:any[] = [];

    /*=====================================================================
     Variable de tipo arreglo para las ofertas del producto 303
    =======================================================================*/
    offer: any[] = [];
     /*=============================================================================
     Variables para almacenar los archivos de imagen de la tienda y del producto 305
    ===============================================================================*/
    logoStore:File = null;
    coverStore:File = null;
    imageProduct:File = null;
    topBannerImg:File = null;
    defaultBannerImg:File = null;
    hSliderImg:File = null;
    vSliderImg: File = null;



  constructor(private storesService:StoresService,
              private usersService: UsersService,
              private productsService: ProductsService,
              private categoriesService:CategoriesService,
              private subCategoriesService:SubCategoriesService,
              private http: HttpClient,
              private ngZone: NgZone) { 

    this.store = new StoresModel();
    this.product = new ProductsModel();
  }

  ngOnInit(): void {


    /*===============================================================
      Validamos si el usuario ya tiene una tienda habilitada 273
    =================================================================*/

     this.storesService.getFilterData("username",this.childItem)
       .subscribe(resp=>{

        if(Object.keys(resp).length > 0){

         window.open("account/my-store", "_top");

          

        }else{

          this.store.username = this.childItem;
          this.store.logo = `assets/img/stores/default/default-logo.jpg`
          this.store.cover = `assets/img/stores/default/default-cover.jpg`
        }

       })


   /*===============================================================
     Traer la informacion del usuario existente  277
    =================================================================*/
    this.usersService.getFilterData("username", this.childItem)
    .subscribe(resp=>{

      for(const i in resp){

         this.store.email = resp[i].email;
         this.store.country = resp[i].country;
         this.store.city = resp[i].city;         
         this.store.address = resp[i].address;

           /*===============================================================
                 Dar formato al numero telf 281
           =================================================================*/

         if(resp[i].phone != undefined){

            this.store.phone = resp[i].phone.split("-")[1];
            this.dialCode = resp[i].phone.split("-")[0];
         }

          /*===============================================================
                 Traemos listado de paises 281
           =================================================================*/
            this.usersService.getCountries()
            .subscribe(resp=>{

                this.countries = resp;

            })
      }

    })

  }

  /*===============================================================
      Mover el Scroll hasta donde inicia terminos y condiciones 274
    =================================================================*/

    goTerms(){

      $("html, body").animate({

        scrollTop: $("#tabContent").offset().top-50

      })

    }

      /*===============================================================
     Funcion que avisa si acepta terminos y condicones 275
    =================================================================*/

    changeAccept(){

      if(this.accept){

        $("#createStore").tab("show")

             /*===============================================================
               Movemos el Scroll hasta la creacion de la tienda 275
              =================================================================*/

        $("html, body").animate({

        scrollTop: $("#createStore").offset().top-90

      })

      }else{

        $("#createStore").removeClass("active")
      }
    }

     /*===============================================================
      Activar modulo para crear producto 275
    =================================================================*/
    createProduct(){

       /*===============================================================
        Validar que la tienda este correctamente creada 276
    =================================================================*/
      let formStore = $(".formStore");

      let error = 0;

      for(let i = 0; i < formStore.length; i++){

          if($(formStore[i]).val() == "" || $(formStore[i]).val() == undefined){

            error++

            $(formStore[i]).parent().addClass("was-validated")
          }
      }

      if(error > 0){

         return;
      }

      this.storeOK = true;

       /*===============================================================
         cuando se activa el modulo para crear el producto 276
        =================================================================*/

      if(this.storeOK){


      $("#createProduct").tab("show")

      /*===============================================================
               Movemos el Scroll hasta la creacion del producto 275
              =================================================================*/

        $("html, body").animate({

        scrollTop: $("#createProduct").offset().top-90

         })

           /*=============================================
            Traer data de categorías 288
            =============================================*/

             this.categoriesService.getData()
            .subscribe(resp=>{

              for(const i in resp){

                this.categories.push(resp[i]);

              }

            })

             /*=============================================
            Agregar imagen del producto por defecto 295
            =============================================*/

            this.product.image = `assets/img/products/default/default-image.jpg`;

             /*=============================================
            Agregar imagen Banner Top por defecto 297
            =============================================*/

            this.topBanner["IMG tag"] = `assets/img/products/default/default-top-banner.jpg`; 
            
              /*=============================================
            Agregar imagen Banner default por defecto 298
            =============================================*/    

            this.product.default_banner = `assets/img/products/default/default-banner.jpg`; 

            /*=============================================
            Agregar Imagen Slide Horizontal por defecto
            =============================================*/

            this.hSlider["IMG tag"] = `assets/img/products/default/default-horizontal-slider.jpg`;

              /*=============================================
            Agregar Imagen Slide Vertical por defecto 300
            =============================================*/

            this.product.vertical_slider = `assets/img/products/default/default-vertical-slider.jpg`;

       } 


    }

     /*===============================================================
       Validacion extra para campo del formulario 278
    =================================================================*/
    validate(input){

       /*===============================================================
       Validamos el Nombre de la Tienda 278
    =================================================================*/

      if($(input).attr("name") == "storeName" || $(input).attr("name") == "productName"){

         /*===============================================================
       Validamos expresion regular del nombre de la tienda 278
    =================================================================*/        

       let pattern = /^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]{1,}$/;

       if(!pattern.test(input.value)){

           $(input).parent().addClass('was-validated');

           input.value = "";

           return;
       }else{

        if($(input).attr("name") == "storeName"){

        /*===============================================================
         Validamos que el nombre de la tienda no este repetido 278
       =================================================================*/
       this.storesService.getFilterData("store", input.value)
       .subscribe(resp=>{

           if(Object.keys(resp).length > 0){

                $(input).parent().addClass('was-validated')
                input.value = "";
                this.store.url="";

                Sweetalert.fnc("error", "El nombre de la Tienda ya Existe en Nuestro Registro, Utilize un Nombre Diferente", null)

                return;

           }else{

                /*===============================================================
                      Capitulamos el nombre de la tienda 278
                  =================================================================*/

              input.value = Capitalize.fnc(input.value)

                 /*===============================================================
                      Creamos la URL de la tienda 279
                  =================================================================*/
                  this.store.url = CreateUrl.fnc(input.value);


           }

        })

        }else{
         

             /*===============================================================
         Validamos que el nombre de la tienda no este repetido 278
       =================================================================*/
       this.productsService.getFilterData("name", input.value)
       .subscribe(resp=>{

           if(Object.keys(resp).length > 0){

                $(input).parent().addClass('was-validated')
                input.value = "";
                this.product.url="";

                Sweetalert.fnc("error", "El nombre del Producto ya Existe, Utilize un Nombre Diferente", null)

                return;

           }else{

                /*===============================================================
                      Capitulamos el nombre de la tienda 278
                  =================================================================*/

              input.value = Capitalize.fnc(input.value)

                 /*===============================================================
                      Creamos la URL de la tienda 279
                  =================================================================*/
                  this.product.url = CreateUrl.fnc(input.value);


           }

        })

        }


       }

      }

       /*===============================================================
       Validamos la informacion de la tienda 280
    =================================================================*/

      if($(input).attr("name") == "storeAbout"){

            /*===============================================================
       Validamos expresion regular de la informacion de la tienda 278
    =================================================================*/        

       let pattern = /^[-\\(\\)\\=\\%\\&\\$\\;\\_\\*\\"\\#\\?\\¿\\!\\¡\\:\\,\\.\\0-9a-zA-ZñÑáéíóúÁÉÍÓÚ ]{1,1000}$/;

       if(!pattern.test(input.value)){

           $(input).parent().addClass('was-validated');

           input.value = "";

           return;
       }else{

          this.store.abstract = input.value.substr(0,100)+"...";

       }

      }

       /*===============================================================
         Validamos la ciudad de la tienda 282
    =================================================================*/

    if($(input).attr("name") == "storeCity"){

            /*===============================================================
       Validamos expresion regular de la ciudad de la tienda 278
    =================================================================*/        

       let pattern = /^[A-Za-zñÑáéíóúÁÉÍÓÚ ]{1,}$/;

       if(!pattern.test(input.value)){

           $(input).parent().addClass('was-validated');

           input.value = "";

           return;
       }

      }

      
       /*===============================================================
         Validamos el telefono de la tienda 282
    =================================================================*/

    if($(input).attr("name") == "storePhone"){

            /*===============================================================
       Validamos expresion regular del telefono de la tienda 278
    =================================================================*/        

       let pattern = /^[-\\0-9 ]{1,}$/;

       if(!pattern.test(input.value)){

           $(input).parent().addClass('was-validated');

           input.value = "";

           return;
       }

      }

    
        /*===============================================================
         Validamos la Direccion de la tienda 282
    =================================================================*/

    if($(input).attr("name") == "storeAddress"){

            /*===============================================================
       Validamos expresion regular de la direccion de la tienda 278
    =================================================================*/        

       let pattern = /^[-\\(\\)\\=\\%\\&\\$\\;\\_\\*\\"\\#\\?\\¿\\!\\¡\\:\\,\\.\\0-9a-zA-ZñÑáéíóúÁÉÍÓÚ ]{1,1000}$/;

       if(!pattern.test(input.value)){

           $(input).parent().addClass('was-validated');

           input.value = "";

           return;
       }

      }     

        /*===============================================================
         Validamos las Redes Sociales de la tienda 285
    =================================================================*/

    if($(input).attr("social") == "socialNetwork"){

            /*===============================================================
       Validamos expresion regular de la direccion de la tienda 278
    =================================================================*/        

       let pattern = /^[-\\_\\.\\0-9a-zA-Z]{1,}$/;

       if(!pattern.test(input.value)){

           $(input).parent().addClass('was-validated');

           //input.value = "";

           return;
       }

      }

        /*===============================================================
      Validamos los TAGS de los Banner y Slider's 297
    =================================================================*/

      if($(input).attr("tags") == "tags"){

    /*===============================================================
       Validamos expresion regular  297
    =================================================================*/        

       let pattern = /^[-\\(\\)\\=\\%\\&\\$\\;\\_\\*\\'\\#\\?\\¿\\!\\¡\\:\\,\\.\\0-9a-zA-ZñÑáéíóúÁÉÍÓÚ ]{1,50}$/;

       if(!pattern.test(input.value)){

           $(input).parent().addClass('was-validated');

           input.value = "";

           return;


         }

      }

    /*===============================================================
      Validamos el Video del Producto 301
    =================================================================*/
      if($(input).attr("name") == "id_video"){

      /*===============================================================
       Validamos expresion regular 
    =================================================================*/        

       let pattern = /^[-\\(\\)\\=\\%\\&\\$\\;\\_\\*\\"\\#\\?\\¿\\!\\¡\\:\\,\\.\\0-9a-zA-ZñÑáéíóúÁÉÍÓÚ ]{1,1000}$/;

       if(!pattern.test(input.value)){

           $(input).parent().addClass('was-validated');           

           return;
       }

      }

        /*===============================================================
      Validamos el precio de envio y el precio de venta 302
    =================================================================*/

       if($(input).attr("tags") == "prices"){

        /*===============================================================
       Validamos expresion regular 
    =================================================================*/        

       let pattern = /^[.\\,\\0-9]{1,}$/;

       if(!pattern.test(input.value)){

           $(input).parent().addClass('was-validated');           

           return;
       }

       }

        /*===============================================================
       Validamos dias de entrega y stock 302
    =================================================================*/      

      if($(input).attr("tags") == "intNumber"){

        /*===============================================================
       Validamos expresion regular 302
    =================================================================*/        

       let pattern = /^[0-9]{1,}$/;

       if(!pattern.test(input.value)){

           $(input).parent().addClass('was-validated');           

           return;
        }else{

          if($(input).attr("name") == "stock" && input.value > 100){


              input.value = "";

              Sweetalert.fnc("error", "Maximo 100 Unidades", null);

              return;
          }

        }

       }

    }

     /*===============================================================
      Validacion para las Imagenes del Formulario 283
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
      Agregar codigo dial al input telefonico 281
    =================================================================*/
      changeCountry(input){

        this.countries.forEach(country=>{

            if(input.value == country.name){

                this.dialCode = country.dial_code;
            }

        })
      }

    /*===========================================================================
     Traer la data de subcategorias de acuerdo a la categoria seleccionada 288
    ============================================================================*/

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

      /*===============================================================
      Adicionar Input's de forma Dinamica 291
    =================================================================*/
    addInput(type){

      if(type =="summary"){

      if(this.summaryGroup.length < 5){


      this.summaryGroup.push({

         input:''
      })

     }else{

        Sweetalert.fnc("error", "Se ha Exedido el numero de Entradas", null)  
     }

   }

    if(type =="details"){

      if(this.detailsGroup.length < 10){


      this.detailsGroup.push({

         title:'',
         value:''
      })

     }else{

        Sweetalert.fnc("error", "Se ha Exedido el numero de Entradas", null)  
     }

   }

    if(type =="specifications"){

      if(this.specificationsGroup.length < 5){


      this.specificationsGroup.push({

         type:'',
         values:''
      })

     }else{

        Sweetalert.fnc("error", "Se ha Exedido el numero de Entradas", null)  
     }

   }


    }


     /*===============================================================
      Quitar Input's de forma Dinamica 291
    =================================================================*/
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
    funciones de Dropzone 296
    =================================================================*/

    onSelect(event){
      
      this.gallery.push(...event.addedFiles);
    }

    onRemove(event){
      
      this.gallery.splice(this.gallery.indexOf(event), 1);
    }


  /*===============================================================
      Envio del Formulario 275
    =================================================================*/

    onSubmit(f: NgForm){  

      this.ngZone.runOutsideAngular(() => {
   
   console.log("f", f);
       /*===============================================================
        Validar que el producto este correctamente creada 276
    =================================================================*/
      let formProduct = $(".formProduct");

      let error = 0;

      for(let i = 0; i < formProduct.length; i++){

          if($(formProduct[i]).val() == "" || $(formProduct[i]).val() == undefined){

            error++

            $(formProduct[i]).parent().addClass("was-validated")
          }
      }     


      /*=========================================================================
        Validamos que las palabras claves tengan como minimo una sola palabra 304
    =============================================================================*/
      if(this.tags.length == 0){

         Sweetalert.fnc("error", "Las etiquetas de Productos estan Vacias", null);

         return;

      }

        /*=========================================================================
        Validamos que la galeria tenga como minimo una sola imagen 304
    =============================================================================*/

        if(this.gallery.length == 0){

          Sweetalert.fnc("error", "Galeria de Productos Sin Imagenes", null);

          return;

        }

      /*===============================================================
        Validacion completa del formulario 278
    =================================================================*/

      if(f.invalid){

         Sweetalert.fnc("error", "Campos Invalidos", null);

         return;
      }

       /*===============================================================
        Alerta suave mientras se registra la tienda y el producto 305
    =================================================================*/

        Sweetalert.fnc("loading", "Loading...", null);     

      /*===============================================================
      Subir imagenes al servidor 305
    =================================================================*/

        let countAllImages = 0;
        let allImages = [

            {

              type:'logoStore',
              file: this.logoStore,
              folder:this.store.url,
              path:'stores',
              width:'270',
              height:'270'

            },
            {
              type:'coverStore',
              file: this.coverStore,
              folder:this.store.url,
              path:'stores',
              width:'1424',
              height:'768'
            },
            {
              type:'imageProduct',
              file: this.imageProduct,
              folder:this.product.category.split("_")[1],
              path:'products',
              width:'300',
              height:'300'
            },
            {
              type:'topBannerImg',
              file: this.topBannerImg,
              folder:`${this.product.category.split("_")[1]}/top`,
              path:'products',
              width:'1920',
              height:'80'
            },
            {
              type:'defaultBannerImg',
              file: this.defaultBannerImg,
              folder:`${this.product.category.split("_")[1]}/default`,
              path:'products',
              width:'570',
              height:'210'
            },
            {
              type:'hSliderImg',
              file: this.hSliderImg,
              folder:`${this.product.category.split("_")[1]}/horizontal`,
              path:'products',
              width:'1920',
              height:'358'
            },
            {
              type:'vSliderImg',
              file: this.vSliderImg,
              folder:`${this.product.category.split("_")[1]}/vertical`,
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
            .subscribe(resp=>{

                  

                 if(resp["status"] == 200){

                  switch(allImages[i].type){

                      case "logoStore":
                      this.store.logo = resp["result"];
                      break;

                      case "coverStore":
                      this.store.cover = resp["result"];
                      break;

                      case "imageProduct":
                      this.product.image = resp["result"];
                      break;

                      case "topBannerImg":
                      this.topBanner["IMG tag"]= resp["result"];
                      break;

                      case "defaultBannerImg":
                      this.product.default_banner = resp["result"];
                      break;

                      case "hSliderImg":
                      this.hSlider["IMG tag"] = resp["result"];
                      break;

                      case "vSliderImg":
                      this.product.vertical_slider = resp["result"];
                      break;


                  }

                  countAllImages ++

              /*===============================================================
               Preguntamos cuando termina de subir todas las imagenes 307
              =================================================================*/

                   if(countAllImages == allImages.length){

                    /*===============================================================
                      Subir galeria al servidor 307
                    =================================================================*/
                      let countGallery = 0;
                      let newGallery = [];

                      for(const i in this.gallery){

                           const formData = new FormData();

                            formData.append('file', this.gallery[i]);
                            formData.append('folder', `${this.product.category.split("_")[1]}/gallery`);
                            formData.append('path', 'products');
                            formData.append('width', '1000');
                            formData.append('height', '1000');

                            this.http.post(this.server, formData)
                            .subscribe(resp=>{


                                if(resp["status"] == 200){

                                   newGallery.push(resp["result"]);

                                   this.product.gallery = JSON.stringify(newGallery);

                                   countGallery++;

                                   /*===============================================================
                                      Preguntamos cuando termina de subir toda la galeria 307
                                   =================================================================*/
                                    if(countGallery == this.gallery.length){

        /*===============================================================
        Consolidar numero de telefono de la tienda 308
       =================================================================*/
       this.store.phone = `${this.dialCode}-${this.store.phone}`;

       /*===============================================================
         Consolidar cantidad de productos para la tienda 308
       =================================================================*/
        this.store.products = 1;
     /*===============================================================
          Consolidar redes sociales para la tienda 308
      =================================================================*/
      for(const i in Object.keys(this.social)){

      if(this.social[Object.keys(this.social)[i]] != ""){

       this.social[Object.keys(this.social)[i]] = `https://${Object.keys(this.social)[i]}.com/${this.social[Object.keys(this.social)[i]]}`


        }

       }

      this.store.social = JSON.stringify(this.social);

      /*===============================================================
      consolidar fecha de creacion del producto 309
    =================================================================*/
    this.product.date_created = new Date();

      /*===============================================================
      consolidar el feedback para el producto 309
    =================================================================*/
     this.product.feedback = {

       type:"review",
       comment:"Your product is under review"

      }
     this.product.feedback = JSON.stringify(this.product.feedback);

    /*===============================================================
      consolidar categoria para el producto 309
    =================================================================*/

      this.product.category = this.product.category.split("_")[1];

        /*===============================================================
      consolidar lista de titulos para el producto 309
    =================================================================*/
    this.product.title_list = this.product.sub_category.split("_")[1];

        /*===============================================================
      consolidar Sub-categoria para el producto 309
    =================================================================*/
      this.product.sub_category = this.product.sub_category.split("_")[0];

      
    /*===============================================================
      consolidar Nombre de la tienda para el producto 309
    =================================================================*/
    this.product.store = this.store.store;
    /*===============================================================
      consolidar calificaciones para el  producto 309
    =================================================================*/
    this.product.reviews = "[]";
    /*===============================================================
      consolidar las ventas y las visitas del producto 309
    =================================================================*/
    this.product.sales = 0;
    this.product.views = 0;
    /*===============================================================
      consolidar Resumen del producto 309
    =================================================================*/
    let newSummary = [];

     for(const i in this.summaryGroup){

        newSummary.push(this.summaryGroup[i].input);
        this.product.summary = JSON.stringify(newSummary);

     }

       /*===============================================================
      consolidar Detalles del producto 309
    =================================================================*/
      this.product.details = JSON.stringify(this.detailsGroup);

       /*===============================================================
      consolidar Especificaciones del producto 309
    =================================================================*/
    if(this.specificationsGroup.length > 0){

    let newSpecifications = [];

    for(const i in this.specificationsGroup){

      let newValue = [];

      for(const f in this.specificationsGroup[i].values){

          newValue.push(`'${this.specificationsGroup[i].values[f].value}'`)

      }      

      newSpecifications.push(`{'${this.specificationsGroup[i].type}':[${newValue}]}`)

    }

    this.product.specification = JSON.stringify(newSpecifications);
    this.product.specification = this.product.specification.replace(/["]/g, '');
    this.product.specification = this.product.specification.replace(/[']/g, '"');

  }else{

    this.product.specification = "";

  }

     /*===============================================================
      consolidar palabras claves para el producto 309
    =================================================================*/
    let newTags = [];

    for(const i in this.tags){

        newTags.push(this.tags[i].value);

    }

        this.product.tags = JSON.stringify(newTags).toLowerCase();

       

        
        /*===============================================================
      consolidar el Top Banner del producto 309
    =================================================================*/
    this.product.top_banner = JSON.stringify(this.topBanner);
    /*===============================================================
      consolidar Horizontal Slider del producto 309
    =================================================================*/
    this.product.horizontal_slider = JSON.stringify(this.hSlider);
      /*===============================================================
      consolidar Video del producto 309
    =================================================================*/
    this.product.video = JSON.stringify(this.video);
      /*===============================================================
      consolidar OFerta del producto 309
    =================================================================*/
    if(this.offer.length > 0){

      this.product.offer = JSON.stringify(this.offer);

    }else{

      this.product.offer = "";
    }


   /*===============================================================
      Crear la tienda en la BD 310
    =================================================================*/

            this.storesService.registerDatabase(this.store, localStorage.getItem("idToken"))
            .subscribe(resp=>{ 

            if(resp["name"] != ""){ 

                  console.log("resp", resp);
                  console.log("this.store", this.store);

                  /*===============================================================
                      Crear el producto en la BD 310
                  =================================================================*/
                  this.productsService.registerDatabase(this.product, localStorage.getItem("idToken"))
                  .subscribe(resp=>{

                       if(resp["name"] != ""){

                        console.log("resp", resp);
                    console.log("this.product", this.product);


                          Sweetalert.fnc("success", "La Tienda y el Producto, se crearon Correctamente", "account/my-store");

                       }



                  }, err =>{



                    Sweetalert.fnc("error", err.error.error.message, null)

                  })


                }


            }, err =>{

              Sweetalert.fnc("error", err.error.error.message, null)

            })


          }

         }

      })


     }

    }
   }

  })

 }
 })
 }
 
 }


