<?php
  //print_r($_POST);
  //print "\n";
  $input = json_decode( $_POST['payload'], TRUE ); //convert JSON into array
  //print_r(json_encode($input));
  //print "\n";
  
  $myFile = "../../../status";
  $fh = fopen($myFile, 'w') or die("can't open file");
  $stringData = '';
  
  switch($input['ref']){
    case 'refs/heads/master':
      //print 'change received on master';
      $stringData = "master\n";
      break;
    case 'refs/heads/experimental':
      //print 'change received on dev';
      $stringData = "experimental\n";
      break;
    default:
      //print 'change received not affecting master or dev branches';
      $stringData = "untracked branch\n";
      break;
  }
  //print "\n";
  
  fwrite($fh, $stringData);
  fclose($fh);
  //print "\nDUN";
?>
