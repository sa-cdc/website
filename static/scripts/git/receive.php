<?php
  $input= json_decode( $_POST, TRUE ); //convert JSON into array
  print_r(json_encode($input));
?>
