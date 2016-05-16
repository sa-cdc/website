<?php

error_reporting(-1);
ini_set('display_errors', 'On');
set_error_handler("var_dump");
ini_set("mail.log", "./mail.log");
ini_set("mail.add_x_header", TRUE);

require_once('Mail.php');
    $from = "<sacdc@sachristiandental.org>";
    $to = "<mfsairpwr@gmail.com>";
    $subject = "Hi!";
    $body = "Hi,\n\nHow are you?";

    $headers = array ('From' => $from,
      'To' => $to,
      'Subject' => $subject);
    $mailer = Mail::factory('sendmail');

    $mail = $mailer->send($to, $headers, $body);

    if (PEAR::isError($mail)) {
      echo("<p>" . $mail->getMessage() . "</p>");
    } else {
      echo("<p>Message successfully sent!</p>");
    }

$message = $_GET['message'];
$ref = $_GET['ref'];
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
$message = trim($message);
$message = wordwrap($message, 70, "\n");
$headers = "From:sacdc@stage.sachristiandental.org\n";
$headers .= "Content-Type: text/html; charset=ISO-8859-1\n";
$recipient = "mfsairpwr@gmail.com";

// Send
//$mailed = mail($recipient, 'Donation', $message, $headers);
$mailed = false;
header('Content-Type: application/json'); 
$array = $mailed?["status" => "$message"]:["status" => "failed to email"];
echo '('.json_encode($array).')';
if($ref != 42) {
  unlink("../../../../$ref");
}
?>
