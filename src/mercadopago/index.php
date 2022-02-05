<?php

require __DIR__  . '/vendor/autoload.php';


/*=============================================
Dominio 251
=============================================*/
   
$domain = "localhost";
/*=============================================
Credenciales 251
=============================================*/

$sandbox = true;

if($sandbox){

   $public_key = "TEST-48f3bab2-686e-4827-8c92-6df23f13b53c";
   $access_token = "TEST-4603390001681978-011320-07c00c0d0ba7693c0666397791e28297-1047683118";

}else{

    $public_key = "APP_USR-0cf79b9a-335c-4276-9334-451157d270b6";
   $access_token = "APP_USR-4603390001681978-011320-cd1c3c36ad67f87a74692336cb56d978-1047683118";

}


   /*=============================================================================
     Peticion a la API de cambio de moneda https://free.currencyconverterapi.com/
   =============================================================================*/
   $curl = curl_init();

     curl_setopt_array($curl, array(
        CURLOPT_URL => "http://free.currconv.com/api/v7/convert?q=USD_CLP&compact=ultra&apiKey=24336800d0bfee0949c4",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => "",
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 0,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => "GET",
        CURLOPT_HTTPHEADER => array(
          "Cookie: __cfduid=d33a8b671902df6f1dfc8eb1d98756da61592509616"
       ),
     ));

     $response = curl_exec($curl);

     curl_close($curl);
     //echo $response;
     
     $jsonResponse = json_decode($response, true);

     /*=============================
     Formulario MercadoPago 250
   ===============================*/

if(isset($_GET["_x"]) && $_GET["_x"] == md5(base64_decode($_COOKIE["_x"]))){

   
      echo '
      <div style="width:100%; height:100vh; position:fixed; background:url(mp-bg.jpg); background-repeat:no-repeat; background-size:cover">

      <div style="text-align:center; position:absolute; top:45vh; right:120px">

      <form action="http://localhost/marketplace-account/src/mercadopago/index.php" method="POST">
     <script
       src="https://www.mercadopago.cl/integrations/v1/web-tokenize-checkout.js"
       data-public-key="'.$public_key.'"
       data-button-label="Next"
       data-summary-product-label="'.$_COOKIE["_p"].'"
       data-transaction-amount="'.$jsonResponse["USD_CLP"]*base64_decode($_COOKIE["_x"]).'">
      </script>
     </form>

     </div>

    </div> ';

      }

      /*=============================================
      Recibir la respuesta de Mercado Pago 251
      =============================================*/


      if(isset($_REQUEST["token"])){


   /*=============================================
   Obtener los datos del comprador 251
   =============================================*/

   $token = $_REQUEST["token"];
   $payment_method_id = $_REQUEST["payment_method_id"];
   $installments = $_REQUEST["installments"];
   $issuer_id = $_REQUEST["issuer_id"];

     /*=============================================
      Realizar el pago con el SDK de Mercado Pago 251
      =============================================*/

      MercadoPago\SDK::setAccessToken($access_token);
    //...
    $payment = new MercadoPago\Payment();
    $payment->transaction_amount = ceil($jsonResponse["USD_CLP"]*base64_decode($_COOKIE["_x"]));
    $payment->token = $token;
    $payment->description = $_COOKIE["_p"];
    $payment->installments = $installments;
    $payment->payment_method_id = $payment_method_id;
    $payment->issuer_id = $issuer_id;
    $payment->payer = array(
    "email" => $_COOKIE["_e"]
    );
    // Guarda y postea el pago
    $payment->save();

    echo $payment->status;

    // Imprime el estado del pago
    if($payment->status == "approved"){

      setcookie('_i', $payment->id, time() + 3600, "/", $domain);
      setcookie('_k', $public_key, time() + 3600, "/", $domain);
      setcookie('_a', $access_token, time() + 3600, "/", $domain);
    echo '<script>

         window.close();

      </script>';

    }

}



