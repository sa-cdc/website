<?php
require('vancoFunctions.inc');

#clear_open_session();
$result =  open_session_test();
header('Content-Type: text/html');
print_r($result);
?>
