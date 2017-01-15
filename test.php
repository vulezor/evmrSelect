<?php
/*$json_string = file_get_contents("https://restcountries.eu/rest/v1/all");
$parsed_json = json_decode($json_string);        */
define('DB_TYPE', 'mysql');
define('DB_HOST', 'localhost');
define('DB_NAME', 'test');
define('DB_USER', 'root');
define('DB_PASS', '');


require 'Database.php';


$db = new Database(DB_TYPE, DB_HOST, DB_NAME, DB_USER, DB_PASS);
//if(isset($_GET['q']) && $_GET['q'] === 'all' && $_GET['q']){
	//sleep(1);
//	WHERE Country LIKE '%land%';
$sql="SELECT id, name FROM countries  WHERE name LIKE '".$_GET['q']."%' ORDER BY name ASC";

$response = $db->select($sql);
   /* echo '<pre>';
    print_r($response);*/
    header('Content-Type: application/json');
    echo json_encode($response, JSON_NUMERIC_CHECK );
/* else {
	echo json_encode(array());
}*/
?>