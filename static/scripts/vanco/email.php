<?php
// The message
$files = scandir('./');
$avail = var_export($files, true);
$message = "$avail";

// In case any of our lines are larger than 70 characters, we should use wordwrap()
$message = wordwrap($message, 70, "\r\n");

// Send
//mail('mfsairpwr@gmail.com', 'My Subject', $message);
?>
