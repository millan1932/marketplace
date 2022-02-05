import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';

import { Path, Server } from '../../../config';

import { Sweetalert,Tooltip } from '../../../functions';

import { UsersService } from '../../../services/users.service';

import { ActivatedRoute } from '@angular/router';

declare var jQuery:any;
declare var $:any;

@Component({
  selector: 'app-account-profile',
  templateUrl: './account-profile.component.html',
  styleUrls: ['./account-profile.component.css']
})
export class AccountProfileComponent implements OnInit {

  path:string = Path.url;
  vendor:boolean = false;
  displayName:String;
  username:string;
  email:string;
  picture:string;
  id:string;
  method:boolean = false;
  preload:boolean = false;
  server:string = Server.url;
  image:File = null;
  accountUrl:string = null;

  constructor(private usersService: UsersService,
              private http: HttpClient,
              private activatedRoute:ActivatedRoute) { }

  ngOnInit(): void {

    this.preload = true;

      /*==============================================
       Capturamos la Url de la pagina de cuentas 255
      ================================================*/

      this.accountUrl = this.activatedRoute.snapshot.params["param"];

    /*=======================================
        Validar si existe usuario autenticado 180
      ========================================*/
      this.usersService.authActivate().then(resp =>{

         if(resp){

              
               this.usersService.getFilterData("idToken", localStorage.getItem("idToken"))
               .subscribe(resp=>{

                this.id = Object.keys(resp).toString();

                  for(const i in resp){

                    
                /*=======================================
                  Preguntamos si es vendedor 181
                  ========================================*/

                  if(resp[i].vendor != undefined){

                    this.vendor = true;
                  }


                /*=========================================================
                  Asignemos Nombre completo del usuario en el perfil 181
                  ========================================================*/

                  this.displayName = resp[i].displayName;

                  /*=========================================================
                  Asignemos Username en el perfil 181
                  ========================================================*/

                  this.username = resp[i].username;

                  /*=========================================================
                  Asignemos Email en el perfil 181
                  ========================================================*/

                  this.email = resp[i].email;

                   /*=========================================================
                  Asignemos Fotos del usuario en el perfil 181
                  ========================================================*/

                     if(resp[i].picture != undefined){

                        if(resp[i].method != "direct"){

                           this.picture = resp[i].picture;

                        }else{

                          this.picture = `assets/img/users/${resp[i].username.toLowerCase()}/${resp[i].picture}`;   
                        }
                     }else{

                        this.picture = `assets/img/users/default/default.png`;
                     }

                     /*=========================================================
                             Metodo de registro 181
                  ========================================================*/

                     if(resp[i].method != "direct"){

                     this.method = true;
                  }

                  this.preload = false;
                  }
                })
             }
           })

            /*=========================================
      funcion para ejecutar el tooltip de bootstrap 4
     ============================================*/
      Tooltip.fnc();

      /*=========================================
      Validar Formulario de Bootstrap 4 183 4:46
     ============================================*/

     // Disable form submissions if there are invalid fields 155 Bootstrap 4
    (function() {
  'use strict';
  window.addEventListener('load', function() {
    // Get the forms we want to add validation styles to
    var forms = document.getElementsByClassName('needs-validation');
    // Loop over them and prevent submission
    var validation = Array.prototype.filter.call(forms, function(form) {
      form.addEventListener('submit', function(event) {
        if (form.checkValidity() === false) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add('was-validated');
      }, false);
     });
     }, false);
     })();


     /*======================================================
      Scrip para subir imagen con el input de boostrap 183 4:17
     =======================================================*/

      // Add the following code if you want the name of the file appear on select
         $(".custom-file-input").on("change", function() {
         var fileName = $(this).val().split("\\").pop();
         $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
});
  }


       /*===============================================
     Validacion de expresion regular del formulario 169
     =================================================*/
     validate(input){

      let pattern;

      if($(input).attr("name") == "password"){

        pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,}$/;
        
      }

      if(!pattern.test(input.value)){

        $(input).parent().addClass('was-validated')

        input.value = "";
      
      }

    }

     /*============================================
    Enviar nueva Contraseña 169
  ==============================================*/
  newPassword(value){

  //Sweetalert para que le muestre al Usuario mientras carga todo 168

  if(value != ""){

    Sweetalert.fnc("loading", "loading...", null)

    //Enviamos el body que necesita el Endpoint 

      let body = {

          idToken: localStorage.getItem('idToken'),
             password: value,
             returnSecureToken: true
      }

      this.usersService.changePasswordFnc(body)
      .subscribe(resp1=>{

         


                  let value = {

                     idToken: resp1["idToken"]
                  }
                  
                  this.usersService.patchData(this.id, value)
                  .subscribe(resp2=>{

         /*==========================================================
                       Almacenamos el token de seguridad en el localstorage 182
                     ============================================================*/

                     localStorage.setItem("idToken", resp1["idToken"]);

                       
                      /*==========================================================
                       Almacenamos la fecha de expiracion localstorage 182
                     ============================================================*/

                     let today = new Date();

                     today.setSeconds(resp1["expiresIn"]);

                     localStorage.setItem("expiresIn", today.getTime().toString());

                     Sweetalert.fnc("success", "Password change successful...", "account")

                  })
      }, err =>{

         Sweetalert.fnc("error", err.error.error.message, null)
      })

    }
  }

   /*=============================================
      Validar Imagen
    =============================================*/

    validateImage(e){
       
       this.image = e.target.files[0];

        /*=============================================
        Validamos el formato
        =============================================*/

        if(this.image["type"] !== "image/jpeg" && this.image["type"] !== "image/png"){

          Sweetalert.fnc("error", "The image must be in JPG or PNG format", null)

          return;

        }

        /*=============================================
        Validamos el tamaño
        =============================================*/

        else if(this.image["size"] > 2000000){

           Sweetalert.fnc("error", "Image must not weigh more than 2MB", null)

          return;

        }

        /*=============================================
        Mostramos la imagen temporal
        =============================================*/

        else{

           let data = new FileReader();
           data.readAsDataURL(this.image);

            $(data).on("load", function(event){

               let path = event.target.result; 

               $(".changePicture").attr("src", path)     

            })

        }

    }

    /*=============================================
      Subir imagen al servidor
    =============================================*/

    uploadImage(){

       const formData = new FormData();

       formData.append('file', this.image);
       formData.append('folder', this.username);
       formData.append('path', 'users');
       formData.append('width', '200');
       formData.append('height', '200');

       this.http.post(this.server, formData)
       .subscribe(resp =>{
          
          if(resp["status"] == 200){

             let body = {

                picture: resp["result"]
             }

             this.usersService.patchData(this.id, body)
             .subscribe(resp=>{

                if(resp["picture"] != ""){

                   Sweetalert.fnc("success", "¡Your photo has been updated!", "account")
                }

             })

          }

       })

    }

}