<?php

require('vancoFunctions.inc');

if(isset($_GET['nvpvar'])) {
  $data = my_unpack($_GET['nvpvar']);
  header("Location: //proto.sa-cdc.org/get_involved/donations/?$data");
  die();
  echo '<HTML><SCRIPT></SCRIPT><P>Success!</P>';
  echo "<P>Decrypting: ".$_GET['nvpvar']."</P>";
  echo '<P>Result: '.my_unpack($_GET['nvpvar']).'</P>';
  echo '</HTML>';
}
?>
