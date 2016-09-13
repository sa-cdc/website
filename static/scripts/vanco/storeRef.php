<?php

$post = file_get_contents('php://input');
$post = json_decode($post);

if($post['ref'] == null) {
  $array = json_encode(["status" => "no data"]);
  header('Content-Type: application/json');
  echo $array;
  return;
} else {
  $ref = $post['ref'];
  echo $ref;
}

if(!ctype_digit($ref)) {
  header('Content-Type: application/json');
  $array = json_encode(["status" => "invalid data", "ref" => $ref]);
  echo $array;
  return;
}

$ref = (int)$ref;

if($ref <= 0) {
  $array = json_encode(["status" => "reference < 0", "ref" => $ref]);
  header('Content-Type: application/json'); 
  echo $array;
  return;
}

$handle = fopen("../../../../$ref", "w");
fclose($handle);
$array = json_encode(["status" => "success"]);
header('Content-Type: application/json');
echo $array;
return;

?> 
