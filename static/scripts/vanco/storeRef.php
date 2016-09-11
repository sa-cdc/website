<?php
if(!ctype_digit($_POST['ref'])) {
  header('Content-Type: application/json');
  $array = ["status" => "invalid data"];
  echo $_POST['callback'] . '('.json_encode($array).')'.$_POST['ref'];
  return;
}

$ref = (int)$_POST['ref'];

if($ref <= 0) {
  header('Content-Type: application/json'); 
  $array = ["status" => "data < 0"];
  echo $_POST['callback'] . '('.json_encode($array).')'.$_POST['ref'];
  return;
}

$handle = fopen("../../../../$ref", "w");
fclose($handle);
$array = ["status" => "success"];
header('Content-Type: application/json');
echo $_POST['callback'] . '('.json_encode($array).')';
return;
?> 
