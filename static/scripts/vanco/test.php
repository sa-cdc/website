<?php
require('vancoFunctions.inc');

#clear_open_session();
$result = array('output' => isValidSession());
header('Content-Type: text/html');
echo '<html>'.json_encode($result).'</html>';
?>
