<?php 

if(isset($_GET["key"]) && $_GET["key"] == "AIzaSyBGG4qLobeSZYpA7CCsqlpQ_GFElTG_IH8"){

	header('Access-Control-Allow-Origin: *');
	header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
	header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
	header('content-type: application/json; charset=utf-8');

	if(isset($_POST["fileDelete"])){ 

		  /*===============================================================
    Eliminamos el Archivo 326
    =================================================================*/

		unlink($_POST["fileDelete"]);

		  /*===============================================================
       Retornar el estado 200 326
    =================================================================*/
		

		$json = array(

		 	'status' => 200
		 	
		
		);

		echo json_encode($json, true);

		return;

	}	
	

}

