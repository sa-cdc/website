<?php
require('vancoFunctions.inc');

#clear_open_session();
$result = array('sessionid' => open_session());
header('Content-Type: application/json');
echo $_GET['callback'] . '('.json_encode($result).')';
?>
