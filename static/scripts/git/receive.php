<?php
  $input= json_decode( $_POST, TRUE ); //convert JSON into array
  print_r(json_encode($input));
  
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
?>
