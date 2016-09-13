<?php

$post = file_get_contents('php://input');
//$post = json_decode($post);

header('Content-Type: application/json');
echo $post;
/*
if($post['ref'] == null) {
  echo json_encode(["status" => "no data"]);
  return;
} else {
  $ref = $post['ref'];
  echo json_encode($post);
  return;
}

if(!ctype_digit($ref)) {
  echo json_encode(["status" => "invalid data", "ref" => $ref]);
  return;
}

$ref = (int)$ref;

if($ref <= 0) {
  echo json_encode(["status" => "reference < 0", "ref" => $ref]);
  return;
}

$handle = fopen("../../../../$ref", "w");
fclose($handle);
echo json_encode(["status" => "success"]);
return;
*/
?>
