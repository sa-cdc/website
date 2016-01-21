<?php

/**
 * getDateTime.php
 *
 * Returns JSON with the current Vanco Server Date/Time.
 * If the current SessionID is invalid errorcode 380 is returned.
 *
 **/

require('vancoFunctions.inc');

$request['nvpvar'] = my_pack("requesttype=datetime&requestid=".rand());
$request['sessionid'] = open_session();

$data = new_post($request, VANCO_WSNVP);
if(preg_match('/(Invalid Request)/', $data)) {
  $result = array();
  $result['errorlist'] = "380";
  
  header('Content-Type: application/json');
  echo json_encode($result);    //echo $_GET['callback'] . '('.json_encode($result).')';
  
} else {
  $matches = array();
  preg_match('/nvpvar=(.*)/', $data, $matches);
  $result = my_unpack($matches[1]);
  $result = explode('&', $result);
  $final = array();
  foreach($result as $item) {
    $item = explode('=', $item);
    $final[$item[0]] = $item[1];
  }

  header('Content-Type: application/json');
  echo json_encode($final);  //echo $_GET['callback'] . '('.json_encode($result).')';
}
?>
