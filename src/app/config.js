	/*=====================================
		Exportamos la ruta para tomar imagenes
		======================================*/
export let Path = {
	url:'http://localhost:4200/assets/'

  //cuando necesitemos trabajar con certificado SSL  (registro o ingreso con facebook)
  //url:'https://localhost:4200/assets/'
}

	/*=====================================
		Exportamos el endPoint de la APIREST de Firebase
		======================================*/

export let Api = {
	url:'https://busqueda-a346b.firebaseio.com/'
}		

/*==============================================================================
  Exportamos el endpoint para el registro de usuarios en firebase authentication
================================================================================*/

export let Register = {

	url: 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBGG4qLobeSZYpA7CCsqlpQ_GFElTG_IH8'
}

/*==============================================================================
  Exportamos el endpoint para el ingreso de usuarios en firebase authentication 160
================================================================================*/
export let Login = {

	url : 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBGG4qLobeSZYpA7CCsqlpQ_GFElTG_IH8'
}

/*==============================================================================
  Exportamos el endpoint para enviar verificacion de correo electronico 161
================================================================================*/
export let SendEmailVerification = {

url : 'https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=AIzaSyBGG4qLobeSZYpA7CCsqlpQ_GFElTG_IH8'

}


/*==============================================================================
  Exportamos el endpoint para confirmar email de verificacion 162
================================================================================*/
export let ConfirmEmailVerification = {

url : 'https://identitytoolkit.googleapis.com/v1/accounts:update?key=AIzaSyBGG4qLobeSZYpA7CCsqlpQ_GFElTG_IH8'

}

/*==============================================================================
  Exportamos el endpoint para tomar la data del usuario en firebase auth 164
================================================================================*/
export let GetUserData = {

  url:	'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyBGG4qLobeSZYpA7CCsqlpQ_GFElTG_IH8'

}

/*==============================================================================
  Exportamos el endpoint para Resetear la contraseña 168
================================================================================*/

export let SendPasswordResetEmail = {


url:  'https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=AIzaSyBGG4qLobeSZYpA7CCsqlpQ_GFElTG_IH8'

}

/*==============================================================================
  Exportamos el endpoint para confirmar el cambio de  la contraseña 169
================================================================================*/

export let VerifyPasswordResetCode = {

url: 'https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=AIzaSyBGG4qLobeSZYpA7CCsqlpQ_GFElTG_IH8' 

}

/*==============================================================================
  Exportamos el endpoint para enviar la nueva  contraseña 169
================================================================================*/

export let ConfirmPasswordReset = {

url: 'https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=AIzaSyBGG4qLobeSZYpA7CCsqlpQ_GFElTG_IH8'

}

/*=============================================
Exportamos el endPoint para cambiar la contraseña
=============================================*/

export let ChangePassword = {

  url:'https://identitytoolkit.googleapis.com/v1/accounts:update?key=AIzaSyBGG4qLobeSZYpA7CCsqlpQ_GFElTG_IH8'
}

/*==============================================================================================
Exportamos el endPoint del servidor para administrar archivos 184 cambiar la imagen de usuario
===============================================================================================*/
export let Server = {

  url:'http://localhost/marketplace-account/src/assets/img/index.php?key=AIzaSyBGG4qLobeSZYpA7CCsqlpQ_GFElTG_IH8',
  delete:'http://localhost/marketplace-account/src/assets/img/delete.php?key=AIzaSyBGG4qLobeSZYpA7CCsqlpQ_GFElTG_IH8'
}



/*=============================================
Exportamos las credenciales de PAYU
=============================================*/

export let Payu = {

	//Sandbox
	action: 'https://sandbox.checkout.payulatam.com/ppp-web-gateway-payu/',
	merchantId: '508029',
	accountId: '512321', //Solo para Colombia
	responseUrl: 'http://localhost:4200/checkout',
	confirmationUrl: 'http://www.test.com/confirmation',
	apiKey: '4Vj8eK4rloUd272L48hsrarnUA',
	test: 1

	//live
	//action: 'https://checkout.payulatam.com/ppp-web-gateway-payu/',
	//merchantId: '',
	//accountId: '',
	//responseUrl: '',
	//confirmationUrl: '',
	//apiKey:''
	//test: 0 


}



/*=================================================================
Exportamos las credenciales de MERCADO PAGO 252
===================================================================*/

export let MercadoPago = {

	//Sandbox
	public_key:"TEST-48f3bab2-686e-4827-8c92-6df23f13b53c",
	access_token:"TEST-4603390001681978-011320-07c00c0d0ba7693c0666397791e28297-1047683118"

	//Live
	//public_key:"APP_USR-0cf79b9a-335c-4276-9334-451157d270b6",
	//access_token:"APP_USR-4603390001681978-011320-cd1c3c36ad67f87a74692336cb56d978-1047683118"

}