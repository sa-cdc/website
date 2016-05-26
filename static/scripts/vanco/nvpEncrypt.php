<?php

require('vancoFunctions.inc');

if(!isset($_GET['test']) && !isset($_GET['tovanco']) && !isset($_GET['url'])) {

  $data  = "requestid=".generateRequestID()."&";
  $data .= "clientid=".VANCO_CLIENT_ID."&";
  foreach($_GET as $k => $v) {
    if($k != 'callback' && $k != '_') #TODO: Make this a whitelist?
      $data .= $k.'='.$v.'&'; 
  }
  
  $request = array();
  $request['sessionid'] = open_session();
  $request['nvpvar'] = my_pack($data);
  
  header('Content-Type: application/json');
  echo $_GET['callback'] . '('.json_encode($request).')';
  
} elseif(isset($_GET['test']) && $_GET['test'] == 'decrypt') {

  echo "Decrypting: ".$_GET['data']."\n <BR>";
  echo my_unpack($_GET['data']);
  
} elseif(isset($_GET['tovanco'])) {
  #$data  = "requestid=".rand()."&";
  #$data .= "clientid=".VANCO_CLIENT_ID."&";
  $data = array();
  foreach($_GET as $k => $v) {
    if($k != 'callback' && $k != '_' && $k != 'tovanco') { #TODO: Make this a whitelist?
      $data [$k] = $v; 
    }
  }
  
  $data['sessionid'] = open_session();
  #$request['nvpvar'] = my_pack($data);
  $data = new_post($data, VANCO_WSNVP);
  $matches = array();
  preg_match('/nvpvar=(.*)">/', $data, $matches);
  $result = my_unpack($matches[1]);
  header('Content-Type: application/json');
  //echo $_GET['callback'] . '('.json_encode($result).')';
  echo json_encode($result);
  
} elseif(isset($_GET['url'])) {
  $urls = array();
  $urls['nvp'] = VANCO_WSNVP;
  $urls['xml'] = VANCO_WS;
  $urls['dev'] = VANCO_DEV_MODE;
  header('Content-Type: application/json');
  echo $_GET['callback'] . '('.json_encode($urls).')';
  
} else {
  echo "Encrypting: \"".$_GET['data']."\"\n";
  echo my_pack($_GET['data']);
}
?>
