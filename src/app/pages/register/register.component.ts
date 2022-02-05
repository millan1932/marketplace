import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import firebase from "firebase/app";
import "firebase/auth";

import { Capitalize, Sweetalert } from '../../functions';

import { UsersModel } from '../../models/users.model';

import { UsersService } from '../../services/users.service';

declare var jQuery:any;
declare var $:any;

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

	user:UsersModel;

  constructor(private usersService: UsersService){ 

  	this.user = new UsersModel();

  }

  ngOnInit(): void {

  	/*===================================
      Validar Formulario de Bootstrap 4
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

  }

      /*=====================================================
       Capitalizar la primera letra de nombre y apellido 157
     ========================================================*/

     capitalize(input){

     	input.value = Capitalize.fnc(input.value)
    }



      /*===============================================
     Validacion de expresion regular del formulario
     =================================================*/
     validate(input){

     	let pattern;

     	if($(input).attr("name") == "username"){
         
         pattern = /^[A-Za-z]{2,8}$/;

         input.value = input.value.toLowerCase();

        

         this.usersService.getFilterData("username", input.value)
         .subscribe(resp=>{

         if(Object.keys(resp).length > 0){

             $(input).parent().addClass('was-validated')

             input.value= "";

             Sweetalert.fnc("error", "El usuario ya existe", null)

             return;
           }

         })

     	}

     	if($(input).attr("name") == "password"){

     		
     	 pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,}$/;
     	}
       
       if(!pattern.test(input.value)){

       	$(input).parent().addClass('was-validated')

       	input.value= "";

       }
     }

    /*===================================
     Envio del Formulario
     ===================================*/

  onSubmit(f: NgForm){

    if(f.invalid){


  	return;

    }

    /*=================================================
     Alerta suave mientras se registra el usuario 159
     ==================================================*/

     Sweetalert.fnc("loading", "Cargando...", null)


  	/*=======================================
     Registro en Firebase Authentication 153
     =======================================*/

    this.user.returnSecureToken = true;
  	

  	this.usersService.registerAuth(this.user)
  	.subscribe(resp=>{

  		if(resp["email"] == this.user.email){

  			/*==============================
              Enviar correo de verificacion
  			================================*/

  			let body = {

  				requestType: "VERIFY_EMAIL",
  				idToken : resp["idToken"]
  			}

  			this.usersService.sendEmailVerificationFnc(body)
  			.subscribe(resp=>{

  				if(resp["email"] == this.user.email){

  			/*=================================
             Registro en Firebase Database 154
  			===================================*/

  			this.user.displayName = `${this.user.first_name} ${this.user.last_name}`;
  			this.user.method = "direct";  			
  			this.user.needConfirm = false;
        this.user.username = this.user.username.toLowerCase();

  			
            this.usersService.registerDatabase(this.user)
            .subscribe(resp=>{

            	Sweetalert.fnc("success", "Confirma tu cuenta en el email (Verificar spam)", "login")

            })

        }

  			})  			

  		}
  	}, err =>{

  		Sweetalert.fnc("error", err.error.error.message, null)
  	})
  }

  /*===============================
    Registro con facebook 170
  =================================*/

  facebookRegister(){

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
    Acceder con una venta emergente   171 y certificado ssl
     ========================================================*/

     //ng serve --ssl true --ssl-cert "/path/to/file.crt" --ssl-key "/path/to/file.key"

       firebase.auth().signInWithPopup(provider).then(function(result) {
      
        registerFirebaseDatabase(result, localUser, localUsersService)
        
      }).catch(function(error) {
       
        var errorMessage = error.message;

        Sweetalert.fnc("error", errorMessage, "register");
       
      });

      /*=============================================
        Registramos el usuario en Firebase Database 174
      ===============================================*/

      function registerFirebaseDatabase(result, localUser, localUsersService){

        var user = result.user;  
                    
        if(user.b){         

         

            localUser.displayName= user.displayName;
            localUser.email=user.email;
            localUser.idToken=user.b.b.g;
            localUser.method="facebook";            
            localUser.username=user.email.split(`@`)[0];
            localUser.picture =user.photoURL;



          /*======================================================
    Evitar que se dupliquen los registros en Firebase Database 173
     ========================================================*/

     localUsersService.getFilterData("email", user.email)
     .subscribe(resp=>{

       if(Object.keys(resp).length >0){

        Sweetalert.fnc("error", `You're already signed in, please login with ${resp[Object.keys(resp)[0]].method} method`, "login")

       }else{

          localUsersService.registerDatabase(localUser)
         .subscribe(resp=>{

           if(resp["name"] != ""){

             Sweetalert.fnc("success", "Inicia sesion con facebook", "login");
           }

            
         })

       }
     })                   
        }     

      }
  

  }

  /*===============================
    Registro con google 170
  =================================*/

  googleRegister(){

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
    Crear una instancia del objeto proveedor de Google 175 3:36
     ========================================================*/

      var provider = new firebase.auth.GoogleAuthProvider();


      /*======================================================
    Acceder con una venta emergente   175 4:14
     ========================================================*/

    

       firebase.auth().signInWithPopup(provider).then(function(result) {
      
        registerFirebaseDatabase(result, localUser, localUsersService)
        
      }).catch(function(error) {
       
        var errorMessage = error.message;

        Sweetalert.fnc("error", errorMessage, "register");
       
      });

      /*=============================================
        Registramos el usuario en Firebase Database 174
      ===============================================*/

      function registerFirebaseDatabase(result, localUser, localUsersService){

        var user = result.user;  
                    
        if(user.b){         

         

            localUser.displayName= user.displayName;
            localUser.email=user.email;
            localUser.idToken=user.b.b.g;
            localUser.method="google";           
            localUser.username=user.email.split(`@`)[0];
            localUser.picture =user.photoURL;

            

          /*======================================================
    Evitar que se dupliquen los registros en Firebase Database 173
     ========================================================*/

     localUsersService.getFilterData("email", user.email)
     .subscribe(resp=>{

       if(Object.keys(resp).length >0){

        Sweetalert.fnc("error", `You're already signed in, please login with ${resp[Object.keys(resp)[0]].method} method`, "login")

       }else{

          localUsersService.registerDatabase(localUser)
         .subscribe(resp=>{

           if(resp["name"] != ""){

             Sweetalert.fnc("success", "Inicia sesion con google", "login");
           }

            
         })

       }
     })                   
        }     

      }
   

  }
}
