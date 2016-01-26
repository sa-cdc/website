<?php
/**
 * config.php provides:
 *
 * constant VANCO_KEY
 * constant VANCO_USER_ID
 * constant VANCO_PASSWORD
 * constant VANCO_CLIENT_ID
 * constant VANCO_WSNVP
 * constant VANCO_WS
 */
require('../config.inc');

function urlsafe_b64encode($string)
{
  return rtrim(strtr(base64_encode($string), '+/', '-_'));
}

function encrypt($data, $key=VANCO_KEY)
{
  return mcrypt_encrypt(MCRYPT_RIJNDAEL_128, $key, $data, MCRYPT_MODE_ECB);
}

function pad_msg($data)
{
    return $data . str_repeat(' ', strlen($data) % 16);
}

function urlsafe_b64decode($data) {
  return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT));
}

function decrypt($data, $key=VANCO_KEY)
{
    return mcrypt_decrypt(MCRYPT_RIJNDAEL_128, $key, $data, MCRYPT_MODE_ECB);
}

function my_unpack($data, $key=VANCO_KEY) {
  $data = urlsafe_b64decode($data);
  $data = decrypt($data, $key);  # Will Silently fail
  
  //Enter cone of silence
  set_error_handler(function() { /* ignore errors */ });
    $data = gzinflate($data);  #Will explicitly fail
  restore_error_handler();

  if(!$data) {
    throw new Exception("Unable to decompress '$data', may have failed decryption.");
  }
  return $data;
}

function my_pack($text, $key=VANCO_KEY){
  $text = gzdeflate($text);
  $text = pad_msg($text);
  $text = encrypt($text, $key);
  $text = urlsafe_b64encode($text);
  return $text;
}

#TODO: Add error handling (un-encryption et. al.)
function post($request, $key=VANCO_KEY, $session = FALSE, $user_id = VANCO_USER_ID, $password = VANCO_PASSWORD) {
  ##Data Post
  $request_id = generateRequestID();
  $postfields = array('nvpvar' => "$request&requestid=$request_id");
  #echo $postfields['nvpvar']."<br>";
  if($session) { #Only used if the post needs a sessionid as specified by VANCO's API
    $postfields['sessionid'] = open_session($user_id, $password, $key);
  }
  $result = new_post($postfields, VANCO_WSNVP);
  $result = str_replace('nvpvar=', '', $result);
  try {
    $result = my_unpack($result, $key);
  } catch (Exception $e) {
    echo 'Caught exception: ',  $e->getMessage(), "<BR>\n";
  }
  parse_str($result, $value);
  if($request_id != $value['requestid']) {
    throw new Exception("Invalid requestid returned by server. Original id: '$request_id', response: '$result'");
  }
  return $value;
}

#Allows user to make a presumably well formed/enrypted request via a map-array and CURL
function new_post($request,$url) {
  ##Data Post
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
  curl_setopt($ch, CURLOPT_POST, true);
  curl_setopt($ch, CURLOPT_POSTFIELDS, $request);
  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
  return curl_exec($ch);
}

function isValidSession($session, $key=VANCO_KEY) {
  $request['nvpvar'] = my_pack("requesttype=datetime&requestid=".generateRequestID(), $key);
  $request['sessionid'] = $session;
  $data = new_post($request, VANCO_WSNVP);
  return !(preg_match('/(Invalid Request)/', $data));
}

function open_session($user_id=VANCO_USER_ID, $password=VANCO_PASSWORD, $key=VANCO_KEY) {
  close_session();
  $result = array();
  $session = load_open_session($key);
  $myfile = fopen("test.txt", "w") or die("Unable to open file!");
  fwrite($myfile, isValidSession($session, $key)."\n");
  if(!$session || !isValidSession($session, $key)) {  //If session invalid then then request a new one.
    clear_open_session();
    $request = "requesttype=login&userid=$user_id&password=$password";
    $result = post($request, $key, $session = false, $user_id, $password);
    $shm = shmop_open(0xF44, "c", 0644, 58);
    shmop_write($shm, time(), 48);
    shmop_write($shm, encrypt($result['sessionid'], $key), 0); #Store ecrypted session to shared memory
    shmop_close($shm);
  } else {
    $result['sessionid'] = $session;
    $result['requestid'] = "none";
  }
    
    fwrite($myfile, urlsafe_b64encode($result['sessionid']));
    fclose($myfile);
    
  return $result['sessionid'];
}

#Only works if a session is currently active and not > 24 hours old
function load_open_session($key=VANCO_KEY) {
  $shm = shmop_open(0xF44, "c", 0644, 58);
  $session = shmop_read($shm, 0, 48);
  $age = time() - shmop_read($shm, 48, 10);
  shmop_close($shm);
  if($age < 86400) {
    return trim(decrypt($session, $key)); # Read decrypt and trim from shared memory
  } else {
    return false;
  }
}

function clear_open_session() {
  $shm = shmop_open(0xF44, "c", 0644, 48);
  $result = shmop_delete($shm);
  shmop_close($shm);
  return $result;
}

function close_session($key=VANCO_KEY) {
  try {
    $requestid = generateRequestID();
    $session = load_open_session($key);
    $request = my_pack("requesttype=logout&requestid=$requestid", $key);
    $query = array('sessionid' => $session, 'nvpvar' => $request);

    $data = new_post($query, VANCO_WSNVP);
    $data = str_replace('nvpvar=', '', $data);
    
    $response = my_unpack($data, $key);
    $response = str_replace('response=', '', $response);
    clear_open_session();
    return $response == 'successful';    
  } catch(Exception $e) {
    clear_open_session();
    return false;
  }

  
}

function generateRequestID()
{
  /*
  Function:    generateRequestID()
  Description: Used to generate a unique request ID to be used in a Web Services request
  Parameters:  None
  Returns:     String value to be used as a request ID. Value will be date/time with a random 4 digit number appended
  */
  date_default_timezone_set('America/Chicago');
  $currenttime = date("YmdHis");
  $randomnumber = rand(0, 9999);
  return $currenttime.$randomnumber;
}
 
?>
