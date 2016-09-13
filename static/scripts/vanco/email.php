<?php

/*error_reporting(-1);
ini_set('display_errors', 'On');
set_error_handler("var_dump");
ini_set("mail.log", "./mail.log");
ini_set("mail.add_x_header", TRUE);*/

require_once('Mail.php');
   
$recipients = 'mfsairpwr@gmail.com';

$post = file_get_contents('php://input');
$data = json_decode($post, true);

$message = $data['message'];
$ref = $data['ref'];
//TODO: Validate this data - never trust user input

//----
$files = scandir('../../../../');

if(!in_array($ref,$files) && $ref != 42) {
  //No matching reference found
  //TODO: Send exception json
  header('Content-Type: application/json'); 
  $array = ["status" => "invalid data"]; 
  echo '('.json_encode($array).')';
  return;
}

// In case any of our lines are larger than 70 characters, we should use wordwrap()
$headers['From']    = 'sacdcorg@sachristiandental.org';
$headers['To']      = $recipients;
$headers['Subject'] = 'Donation '.$ref;
$body = $message;
$params['sendmail_path'] = '/usr/lib/sendmail';
// Create the mail object using the Mail::factory method
$mail_object =& Mail::factory('sendmail', $params);
//Send
$mailed = $mail_object->send($recipients, $headers, $body);

header('Content-Type: application/json'); 
$array = $mailed?["status" => "$message"]:["status" => "failed to email"];
echo '('.json_encode($array).')';
if($ref != 42) {
  unlink("../../../../$ref");
}
?>
