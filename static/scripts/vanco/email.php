<?php
$ref = $_GET['ref'];
$name = $_GET['name'];
$amount = $_GET['amount'];
$email = $_GET['email'];
$phone = $_GET['phone'];
//TODO: Validate this data - never trust user input

//----
$files = scandir('../../../../');

if(!in_array($ref,$files)) {
  //No matching reference found
  //TODO: Send exception json
  return;
}

$message = "$name is contributing $amount. Phone: $phone. Email: $email";
// In case any of our lines are larger than 70 characters, we should use wordwrap()
$message = wordwrap($message, 70, "\r\n");

// Send
mail('mfsairpwr@gmail.com', 'Donation', $message);
?>
