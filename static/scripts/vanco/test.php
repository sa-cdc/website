<?php
require('vancoFunctions.inc');

#clear_open_session();
$result = array('sessionid' => open_session_test());
header('Content-Type: text/html');
echo '<html>'.json_encode($result).'</html>';
?>
