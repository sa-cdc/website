<?php

session_start();
require_once("twitteroauth/twitteroauth.php"); //Path to twitteroauth library
 
init_set('display_errors','Off');
/**
 * conf.inc provides:
 *
 * $twitteruser
 * $consumerkey
 * $consumersecret
 * $accesstoken
 * $accesstokensecret
 */
require_once("./config.inc");

$notweets = 30; # Twitter appears to be auto-limiting to 10 results...

function getConnectionWithAccessToken($cons_key, $cons_secret, $oauth_token, $oauth_token_secret) {
  $connection = new TwitterOAuth($cons_key, $cons_secret, $oauth_token, $oauth_token_secret);
  return $connection;
}
 
$connection = getConnectionWithAccessToken($consumerkey, $consumersecret, $accesstoken, $accesstokensecret);
 
$tweets = $connection->get("https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=".$twitteruser."&count=".$notweets);
 
$response = json_encode($tweets);
 
header('Content-Type: application/json');
if(isset($_GET['callback'])) {
  echo $_GET['callback'].'('.$response.');';
} else {
  echo $response;
}
?>
