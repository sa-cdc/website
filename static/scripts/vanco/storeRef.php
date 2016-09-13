<?php

$post = file_get_contents('php://input');
$post = json_decode($post);
if($post['ref'] == null) {
  header('Content-Type: application/json');
  $array = ["status" => "no data"];
  echo json_encode($array);
  return;
} else {
  $ref = $post['ref'];
}

if(!ctype_digit($ref)) {
  header('Content-Type: application/json');
  $array = ["status" => "invalid data", "ref" => $ref];
  echo json_encode($array);
  return;
}

$ref = (int)$ref;

if($ref <= 0) {
  header('Content-Type: application/json'); 
  $array = ["status" => "reference < 0", "ref" => $ref];
  echo json_encode($array);
  return;
}

$handle = fopen("../../../../$ref", "w");
fclose($handle);
$array = ["status" => "success"];
header('Content-Type: application/json');
echo json_encode($array);
return;
?> 
