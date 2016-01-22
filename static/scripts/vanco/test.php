<?php
require('vancoFunctions.inc');

#clear_open_session();
$result = array('sessionid' => open_session());
header('Content-Type: application/html');
echo '<html>'.json_encode($result).'</html>';
?>
