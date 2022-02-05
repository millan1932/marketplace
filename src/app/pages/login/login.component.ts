import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import firebase from "firebase/app";
import "firebase/auth";

import { Sweetalert } from '../../functions';

import { UsersModel } from '../../models/users.model';

import { UsersService } from '../../services/users.service';

import { ActivatedRoute } from '@angular/router';

declare var jQuery:any;
declare var $:any;


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

	user:UsersModel;
  rememberMe:boolean = false;

  constructor(private usersService: UsersService,
  			  private activatedRoute: ActivatedRoute) { 

  	this.user = new UsersModel();

  }

  ngOnInit(): void {

    /*=======================================================
     Validar accion de recordar credencial de correo 167
     ======================================================*/

     if(localStorage.getItem("rememberMe") && localStorage.getItem("rememberMe") == "yes"){

       this.user.email = localStorage.getItem("email");
       this.rememberMe = true;
     }

   /*===================================
      Validar Formulario de Bootstrap 4 160
     ===================================*/

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

     /*==========================================
      Verificar cuenta de correo electronico 162
     ============================================*/

     if(this.activatedRoute.snapshot.queryParams["oobCode"] != undefined && 
     	this.activatedRoute.snapshot.queryParams["mode"] == "verifyEmail"){

     	let body = {

     		oobCode: this.activatedRoute.snapshot.queryParams["oobCode"]
     	}

     	this.usersService.confirmEmailVerificationFnc(body)
     	.subscribe(resp=>{

     		console.log("resp", resp);

     		if("emailVerified"){

     		 /*==========================================
      			Actualizar Confirmacion de correo en Database 162
     		  ============================================*/
 			  this.usersService.getFilterData("email", resp["email"])	
 			  .subscribe(resp=>{

 			  	for(const i in resp){

 			  		let id = Object.keys(resp).toString();

 			  		let value = {

 			  			needConfirm: true
 			  		}
 			  		
 			  		this.usersService.patchData(id, value)
 			  		.subscribe(resp=>{

 			  			if(resp["needConfirm"]){

 			  				Sweetalert.fnc("success", "Email Confirmado, Inicia Sesion Ahora", "login")
 			  			}
 			  		})

 			  	}
 			  })

     		}
     	}, err =>{

     		if(err.error.error.message == "INVALID_OOB_CODE"){

     		Sweetalert.fnc("error", "Email ya esta confirmado", "login")

     	}

     	})
     } 
  


   /*==========================================
      Confirmar cambio de contraseña 169
     ============================================*/

    if(this.activatedRoute.snapshot.queryParams["oobCode"] != undefined &&
       this.activatedRoute.snapshot.queryParams["mode"] == "resetPassword"){

      let body = {

        oobCode: this.activatedRoute.snapshot.queryParams["oobCode"]
      }

      this.usersService.verifyPasswordResetCodeFnc(body)
      .subscribe(resp=>{

        if(resp["requestType"] == "PASSWORD_RESET"){

          $("#newPassword").modal()

        }

      })

    }
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

         input.value= "";

       }
     }

   /*===================================
     Envio del Formulario 160
     ===================================*/

  onSubmit(f: NgForm){

  	console.log("f", f);
     
      if(f.invalid){


  	  return;

    }

     /*=================================================
     Alerta suave mientras se registra el usuario 160
     ==================================================*/

     Sweetalert.fnc("loading", "Cargando...", null)

    /*=======================================
     Validar que el correo este verificado 162
     =======================================*/

      this.usersService.getFilterData("email", this.user.email)
      .subscribe( resp1 =>{

      		for(const i in resp1){

      			if(resp1[i].needConfirm){

      				/*=======================================
                    Login en Firebase Authentication 160
                    =======================================*/

    				this.user.returnSecureToken = true;

    				this.usersService.loginAuth(this.user)
    				.subscribe( resp2 => { 

    				/*=======================================
                    Almacenar id Token 163
                    =======================================*/

                    let id = Object.keys(resp1).toString();


 			  		let value = {

 			  			idToken: resp2["idToken"]
 			  		}
 			  		
 			  		this.usersService.patchData(id, value)
 			  		.subscribe(resp3=>{

 			  			if(resp3["idToken"] != ""){

                          Sweetalert.fnc("close", null, null)

   				      /*==========================================================
                       Almacenamos el token de seguridad en el localstorage 163
   				      ============================================================*/

   				      localStorage.setItem("idToken", resp3["idToken"]);

   				      	/*==========================================================
                       Almacenamos el email en el localstorage 163
   				      ============================================================*/

                     localStorage.setItem("email", resp2["email"]);


                      /*==========================================================
                       Almacenamos la fecha de expiracion localstorage 163
   				      ============================================================*/

   				      let today = new Date();

   				      today.setSeconds(resp2["expiresIn"]);

   				      localStorage.setItem("expiresIn", today.getTime().toString());

                 /*======================================================================
                   Almacenamos recordar email en el localStorage 167
                 ==========================================================================*/

                 if(this.rememberMe){

                   localStorage.setItem("rememberMe", "yes");
                 }else{

                   localStorage.setItem("rememberMe", "no");
                 }

   				      /*======================================================
                       Redireccionar al usuario a la pagina de su cuenta 164
   				      ========================================================*/

   				      window.open("account", "_top");// Decimos que account se abra en la misma pestaña 164


 			  			}
 			  		})
 					

  					}, err =>{

  					Sweetalert.fnc("error", err.error.error.message, null)
 				 	})	


      			}else{

      				Sweetalert.fnc("error", 'Necesita confirmar su Email', null)
      			}
      		}
      })
  	
  }

  /*============================================
    Enviar Solicitud para Recuperar Contraseña 168
  ==============================================*/
  resetPassword(value){

  //Sweetalert para que le muestre al Usuario mientras carga todo 168

    Sweetalert.fnc("loading", "loading...", null)

    //Enviamos el body que necesita el Endpoint 

    let body = {

      requestType : "PASSWORD_RESET",
      email: value 
    }

    this.usersService.sendPasswordResetEmailFnc(body)
    .subscribe(resp=>{

      if(resp["email"] == value){

        Sweetalert.fnc("success", "Ingrese a su Email para Cambiar su Contraseña", "login")
      }
    })
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

        oobCode: this.activatedRoute.snapshot.queryParams["oobCode"],
        newPassword: value 
      }

      this.usersService.confirmPasswordResetFnc(body)
      .subscribe(resp=>{

        if(resp["requestType"] == "PASSWORD_RESET"){

        Sweetalert.fnc("success", "Clave Cambiada correctamente", "login")
        }
      })

    }
  }

  /*===================================
   Login con Facebook 176
  =====================================*/

  facebookLogin(){

    let localUsersService = this.usersService;
    let localUser = this.user;
    
    //https://firebase.google.com/docs/web/setup
    // crear app en settings del proyecto
    // npm install --save firebase
    // import * as firebase from "firebase/app";
    // import "firebase/auth";

   /*===============================
    Inicializar firebase en tu app 170
  =================================*/

    const firebaseConfig = {
    apiKey: "AIzaSyDGZWMfdvzHvCHSbGGyruVgq3o9eUbjLW8",
    authDomain: "busqueda-a346b.firebaseapp.com",
    databaseURL: "https://busqueda-a346b.firebaseio.com",
    projectId: "busqueda-a346b",
    storageBucket: "busqueda-a346b.appspot.com",
    messagingSenderId: "567725765941",
    appId: "1:567725765941:web:ed6eeec651855c4c65087c"
     
     }

     // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

      /*======================================================
    Crear una instancia del objeto proveedor de facebook 171
     ========================================================*/

      var provider = new firebase.auth.FacebookAuthProvider();


      /*======================================================
    Acceder con una venta emergente   171 y certificado SSL
     ========================================================*/

     //ng serve --ssl true --ssl-cert "/path/to/file.crt" --ssl-key "/path/to/file.key"

     firebase.auth().signInWithPopup(provider).then(function(result) {

      loginFirebaseDatabase(result, localUser, localUsersService)

    }).catch(function(error) {

      var errorMessage = error.message;

      Sweetalert.fnc("error", errorMessage, "login");

    });

    

   function loginFirebaseDatabase(result, localUser, localUsersService){

      var user = result.user; 

      if(user.P){

        localUsersService.getFilterData("email", user.email)
        .subscribe(resp=>{

          if(Object.keys(resp).length > 0){


                  /** con esta linea preguntamos si se esta logeando con el metodo de facebook 176 **/ 
               if(resp[Object.keys(resp)[0]].method == "facebook"){
              /*=============================================
                  Actualizamos el idToken en Firebase 176
               ===============================================*/
let id = Object.keys(resp).toString();

              let body = {  

                idToken: user.b.b.g
              }

              localUsersService.patchData(id, body)
              .subscribe(resp=>{
                    /*==========================================================
                       Almacenamos el token de seguridad en el localstorage 
                 ============================================================*/

                 localStorage.setItem("idToken", user.b.b.g);

                   /*==========================================================
                       Almacenamos el email en el localstorage 
                 ============================================================*/

                     localStorage.setItem("email", user.email);


                      /*==========================================================
                       Almacenamos la fecha de expiracion localstorage 
                 ============================================================*/

              let today = new Date();

                today.setSeconds(3600);

                localStorage.setItem("expiresIn", today.getTime().toString());
                 
                 /*======================================================
                       Redireccionar al usuario a la pagina de su cuenta 
                 ========================================================*/

                 window.open("account", "_top");// Decimos que account se abra en la misma pestaña 

               })

             }else{

              Sweetalert.fnc("error", `You're already signed in, please login with ${resp[Object.keys(resp)[0]].method} method`, "login")
            }

          }else{

            Sweetalert.fnc("error", "This account is not registered", "register")

          }


        })
        

      }
    }

  }

  /*== login con google ==*/

  /*===================================
   Login con Google 177
  =====================================*/

  googleLogin(){
    
  let localUsersService = this.usersService;
      let localUser = this.user;
    
    //https://firebase.google.com/docs/web/setup
    // crear app en settings del proyecto
    // npm install --save firebase
    // import * as firebase from "firebase/app";
    // import "firebase/auth";

   /*===============================
    Inicializar firebase en tu app 170
  =================================*/

    const firebaseConfig = {
    apiKey: "AIzaSyDGZWMfdvzHvCHSbGGyruVgq3o9eUbjLW8",
    authDomain: "busqueda-a346b.firebaseapp.com",
    databaseURL: "https://busqueda-a346b.firebaseio.com",
    projectId: "busqueda-a346b",
    storageBucket: "busqueda-a346b.appspot.com",
    messagingSenderId: "567725765941",
    appId: "1:567725765941:web:ed6eeec651855c4c65087c"
     
     }

     // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

      /*======================================================
    Crear una instancia del objeto proveedor de Google
     ========================================================*/

     var provider = new firebase.auth.GoogleAuthProvider();


      /*======================================================
    Acceder con una venta emergente  
     ========================================================*/
     
      firebase.auth().signInWithPopup(provider).then(function(result) {

      loginFirebaseDatabase(result, localUser, localUsersService)

    }).catch(function(error) {

      var errorMessage = error.message;

      Sweetalert.fnc("error", errorMessage, "login");

    });


    

      function loginFirebaseDatabase(result, localUser, localUsersService){

      var user = result.user; 

      if(user.P){

        localUsersService.getFilterData("email", user.email)
        .subscribe(resp=>{

          if(Object.keys(resp).length > 0){

            if(resp[Object.keys(resp)[0]].method == "google"){

              /*=============================================
              Actualizamos el idToken en Firebase
              =============================================*/

              let id = Object.keys(resp).toString();

              let body = {  

                idToken: user.b.b.g
              }

              localUsersService.patchData(id, body)
              .subscribe(resp=>{

                /*=============================================
                Almacenamos el Token de seguridad en el localstorage
                =============================================*/

                localStorage.setItem("idToken", user.b.b.g);

                /*=============================================
                Almacenamos el email en el localstorage
                =============================================*/

                localStorage.setItem("email", user.email);

                /*=============================================
                Almacenamos la fecha de expiración localstorage
                =============================================*/

                let today = new Date();

                today.setSeconds(3600);

                localStorage.setItem("expiresIn", today.getTime().toString());

                /*=============================================
                Redireccionar al usuario a la página de su cuenta
                =============================================*/

                window.open("account", "_top");


              })

            }else{

              Sweetalert.fnc("error", `You're already signed in, please login with ${resp[Object.keys(resp)[0]].method} method`, "login")
            }

          }else{

            Sweetalert.fnc("error", "This account is not registered", "register")

          }


        })
        

      }
    }

  }

}