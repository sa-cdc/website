<?php
$message = $_GET['message'];
//TODO: Validate this data - never trust user input

//----
$files = scandir('../../../../');

if(!in_array($ref,$files)) {
  //No matching reference found
  //TODO: Send exception json
  header('Content-Type: application/json'); 
  $array = ["status" => "invalid data"]; 
  echo $_GET['callback'] . '('.json_encode($array).')';
  return;
}

// In case any of our lines are larger than 70 characters, we should use wordwrap()
$message = wordwrap($message, 70, "\r\n");

// Send
mail('mfsairpwr@gmail.com', 'Donation', $message);
header('Content-Type: application/json'); 
$array = ["status" => "success"]; 
echo $_GET['callback'] . '('.json_encode($array).')'; 
unlink("../../../../$ref");
?>
