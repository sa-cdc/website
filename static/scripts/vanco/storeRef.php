<?php
if(!ctype_digit($_GET['ref'])) {
  header('Content-Type: application/json');
  $array = ["status" => "invalid data"];
  echo $_GET['callback'] . '('.json_encode($array).')';
  return;
}

$ref = (int)$_GET['ref'];

if($ref <= 0) {
  header('Content-Type: application/json'); 
  $array = ["status" => "invalid data"];
  echo $_GET['callback'] . '('.json_encode($array).')';
  return;
}

$handle = fopen("../../../../$ref", "w");
fclose($handle);
$array = ["status" => "success"];
header('Content-Type: application/json');
echo $_GET['callback'] . '('.json_encode($array).')';
return;
?> 
