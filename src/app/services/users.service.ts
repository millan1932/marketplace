import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Api, 
         Register, 
         Login, 
         SendEmailVerification, 
         ConfirmEmailVerification, 
         GetUserData, 
         SendPasswordResetEmail,
         VerifyPasswordResetCode,
         ConfirmPasswordReset, ChangePassword } from '../config';

import { UsersModel } from '../models/users.model';
import { ProductsService } from '../services/products.service';

import { Sweetalert } from '../functions';

declare var jQuery:any;
declare var $:any;

@Injectable({
  providedIn: 'root'
})
export class UsersService {

	private api:string = Api.url;
	private register:string = Register.url;
  private login:string = Login.url;
  private sendEmailVerification:string = SendEmailVerification.url;
  private confirmEmailVerification:string = ConfirmEmailVerification.url;
  private getUserData:string = GetUserData.url;
  private sendPasswordResetEmail:string = SendPasswordResetEmail.url;
  private verifyPasswordResetCode:string = VerifyPasswordResetCode.url;
  private confirmPasswordReset:string = ConfirmPasswordReset.url;
  private changePassword:string = ChangePassword.url;

  constructor(private http:HttpClient,
              private productsService: ProductsService) { }

  /*===============================================
   Registro para Firebase Authentication
  =================================================*/

  registerAuth(user: UsersModel){

  	return this.http.post(`${this.register}`, user);
  }

  /*===============================================
   Registro para Firebase Database 154
  =================================================*/

  registerDatabase(user: UsersModel){

  	delete user.first_name;
    delete user.last_name;
    delete user.password;
  	delete user.returnSecureToken;

  	

  	return this.http.post(`${this.api}/users.json`, user);
  }

  /*===============================================
   Filtrar data para buscar coincidencias 158
  =================================================*/

  getFilterData(orderBy:string, equalTo:string){

    return this.http.get(`${this.api}users.json?orderBy="${orderBy}"&equalTo="${equalTo}"&print=pretty`);

  }

  /*===============================================
   Login en Firebase Authentication
  =================================================*/

  loginAuth(user: UsersModel){

    return this.http.post(`${this.login}`, user);
  }

  /*===============================================
   Enviar Verificacion de correo electronico 161
  =================================================*/

  sendEmailVerificationFnc(body:object){
  
    return this.http.post(`${this.sendEmailVerification}`, body);
  }

  /*===============================================
   Confirmar Email de Verificacion 162
  =================================================*/

  confirmEmailVerificationFnc(body:object){

    return this.http.post(`${this.confirmEmailVerification}`, body);
  }

    /*===============================================
     Actualizar data de usuario 162
  =================================================*/

  patchData(id:string, value:object){

     return this.http.patch(`${this.api}users/${id}.json`,value);
  }

     /*===============================================
     Validar Autenticacion 164
  =================================================*/

  authActivate(){

    return new Promise(resolve=>{

      if(localStorage.getItem("idToken")){

    let body = {

         idToken: localStorage.getItem("idToken")
      }

    this.http.post(`${this.getUserData}`, body)
    .subscribe(resp=>{

      /*==============================================
        Validamos fecha de expiracion idtoken 166
      ================================================*/
      if(localStorage.getItem("expiresIn")){

        let expiresIn = Number(localStorage.getItem("expiresIn"));

        let expiresDate = new Date();
        expiresDate.setTime(expiresIn);

        if(expiresDate > new Date()){

           resolve(true)

        }else{


           localStorage.removeItem('idToken');
           localStorage.removeItem('expiresIn');
           resolve(false)
        }

      }else{


        localStorage.removeItem('idToken');
        localStorage.removeItem('expiresIn');
        resolve(false)
      }

       
      },err =>{
     
     localStorage.removeItem('idToken');
     localStorage.removeItem('expiresIn');
     resolve(false)
    })

  }else{


    localStorage.removeItem('idToken');
    localStorage.removeItem('expiresIn');
    resolve(false)
  }

    })
  }

   /*===================================
      Resetear la Contraseña 168
   =====================================*/
  sendPasswordResetEmailFnc(body:object){

    return this.http.post(`${this.sendPasswordResetEmail}`, body)
  }


  /*=============================================
      Confirmar el cambio de  la Contraseña 169
   ==============================================*/
   verifyPasswordResetCodeFnc(body:object){

      return this.http.post(`${this.verifyPasswordResetCode}`, body)

    }


/*=============================================
     Enviar nueva  Contraseña 169
   ==============================================*/
  confirmPasswordResetFnc(body:object){

      return this.http.post(`${this.confirmPasswordReset}`, body)

    }

    /*=============================================
    Cambiar Contraseña 182
   ==============================================*/
  changePasswordFnc(body:object){

      return this.http.post(`${this.changePassword}`, body)

    }

     /*=============================================
    Tomar informacion de un solo Usuario 187
   ==============================================*/
    getUniqueData(value:string){

      return this.http.get(`${this.api}users/${value}.json`);
    }

    /*====================================================
    Funcion para agregar productos a la lista de deseos 193
   =========================================================*/

   addWishlist(product:string){

       /*====================================================
          Validamos que el usuario este autenticado 191
          ====================================================*/

          this.authActivate().then(resp =>{

           if(!resp){

               Sweetalert.fnc("error", "Iniciar Sesion", null)

               return;

           }else{

          /*====================================================
          Traemos la lista de deseos que ya tenga el usuario 191
          ====================================================*/  
          this.getFilterData("idToken", localStorage.getItem("idToken"))
          .subscribe(resp=>{

          /*====================================================
          Capturamos el id del usuario 191
          ====================================================*/

              let id = Object.keys(resp).toString();

              for(const i in resp){
            /*====================================================
         Preguntamos si existe una lista de deseo 191
          ====================================================*/        

              if(resp[i].wishlist != undefined){

               let wishlist = JSON.parse(resp[i].wishlist);

               let length = 0;

       /*==============================================================
         Preguntamos si existe un producto en la lista de deseos 191
        ==============================================================*/ 
               
               if(wishlist.length > 0){

                   wishlist.forEach((list, index)=>{


               
       

            if(list == product){

                length --

            }else{

                length ++
            }

       })

         /*========================================================================
         Preguntamos si no se a agregado este producto a la lista de deseos 191
        ========================================================================*/

        if(length != wishlist.length){
            
            Sweetalert.fnc("error", "Ya existe el producto en la lista de deseo", null);

        }else{

            wishlist.push(product);

            let body = {

                      wishlist: JSON.stringify(wishlist)
                  }

                  this.patchData(id, body)
                  .subscribe(resp=>{

                      if(resp["wishlist"] != ""){

                       let totalWishlist = Number($(".totalWishlist").html());

                       $(".totalWishlist").html(totalWishlist+1);

                          Sweetalert.fnc("success", "Producto agregado a la lista de deseo", null);
                      }
                  })
        }

    }else{

       wishlist.push(product);

            let body = {

                      wishlist: JSON.stringify(wishlist)
                  }

                  this.patchData(id, body)
                  .subscribe(resp=>{

                      if(resp["wishlist"] != ""){

                         let totalWishlist = Number($(".totalWishlist").html());

                       $(".totalWishlist").html(totalWishlist+1);

                          Sweetalert.fnc("success", "Producto agregado a la lista de deseo", null);
                      }
               })                      

    }   


        /*====================================================
         Cuando no exista la lista de deseos inicialmente 191
        ====================================================*/   

              }else{

                  let body = {

                      wishlist: `["${product}"]`
                  }

                  this.patchData(id, body)
                  .subscribe(resp=>{

                      if(resp["wishlist"] != ""){

                         let totalWishlist = Number($(".totalWishlist").html());

                       $(".totalWishlist").html(totalWishlist+1);

                          Sweetalert.fnc("success", "Producto agregado a la lista de deseo", null);
                      }
                  })
              }

          } 

          })

           }

       })

   }

   /*=============================================================
          Funcion para agregar producto al carrito de compras 203
      ==============================================================*/

      addShoppingCart(item:object){

         /*=============================================================
          Filtramos el producto en la data 204
      ==============================================================*/

        this.productsService.getFilterData("url", item["product"])
        .subscribe(resp=>{

          /*=============================================================
          Recorremos el producto para encontrar su informaciono
      ==============================================================*/

            for (const i in resp){

               /*=============================================================
        preguntamos que el producto tenga stock 204
      ==============================================================*/

                if(resp[i]["stock"] == 0){

                  Sweetalert.fnc("error", "fuera de stock", null);

                  return;
                }

      /*=============================================================
       preguntamos si el item detalles viene vacio 218
      ==============================================================*/

              if(item["details"].length == 0){

                if(resp[i].specification != ""){

                  let specification = JSON.parse(resp[i].specification);

                  item["details"] = `[{`;

                  for(const i in specification){

                    let property = Object.keys(specification[i]).toString();

                    item["details"] += `"${property}":"${specification[i][property][0]}",`
                  }

                  item["details"] = item["details"].slice(0, -1);

                  item["details"] += `}]`;
                }
              }
            }

        })

           /*=============================================================
        Agregamos al localstorage la variable listado carrito de compras
      ==============================================================*/

        if(localStorage.getItem("list")){

          let arrayList = JSON.parse(localStorage.getItem("list"));

      /*=============================================================
       Preguntar si el producto se repite 205
      ==============================================================*/

        let count = 0;
        let index;
          
        for(const i in arrayList){


          if(arrayList[i].product == item["product"] && arrayList[i].details.toString() == item["details"].toString()){

            count --
            index = i;

          }else{

            count ++
          }

        }

      /*=============================================================
       Validamos si el producto se repite 205
      ==============================================================*/

        if(count == arrayList.length){

          arrayList.push(item);
          
        }else{

          arrayList[index].unit += item["unit"];

          
        }         

         /*== arrayList.push(item); ===*/

           localStorage.setItem("list", JSON.stringify(arrayList));

        Sweetalert.fnc("success", "Producto agregado al carrito de compras", item["url"])

        }else{

           let arrayList = [];

        arrayList.push(item);

        localStorage.setItem("list", JSON.stringify(arrayList));

        Sweetalert.fnc("success", "Producto agregado al carrito de compras", item["url"])


        }       
      }

      /*=============================================================
       funcion para tomar la lista de paises 231
      ==============================================================*/

      getCountries(){

        return this.http.get('./assets/json/countries.json');
      }


    }
