<?php
  print_r($_POST);
  print "\n";
  $input = json_decode( $_POST, TRUE ); //convert JSON into array
  print_r(json_encode($input));
  print "\n";
  
  switch($input['ref']){
    case 'refs/heads/master':
      print 'change received on master';
      break;
    case 'refs/heads/dev':
      print 'change received on dev';
      break;
    default:
      print 'change received not affecting master or dev branches';
      break;
  }
  print "\nDUN";
?>
