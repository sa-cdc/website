<?php

$post = file_get_contents('php://input');
$data = json_decode($post, true);

header('Content-Type: application/json');


if($data == null) {
  echo json_encode(["status" => "no data"]);
  return;
} else {
  //$ref = $data['ref'];
  echo json_encode(["status" => $data]);
  return;
}
/*
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
