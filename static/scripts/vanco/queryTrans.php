<?php

require('vancoFunctions.inc');
 
$session = open_session();

if(isset($_GET['transactionref'])) {
  $query = "<VancoWS>
        <Auth>
                <RequestType>EFTTransactionFundHistory</RequestType>
		<RequestID>".rand()."</RequestID>
		<RequestTime>".$_SERVER['REQUEST_TIME']."</RequestTime>
		<SessionID>$session</SessionID>
		<Version>2</Version>
	</Auth>
	<Request><RequestVars><ClientID>".VANCO_CLIENT_ID."</ClientID><TransactionRef>".$_GET['transactionref']."</TransactionRef></RequestVars></Request>
      </VancoWS>";
  $xml = new_post($query, VANCO_WS);
  $xml = str_replace('<?xml version="1.0" encoding="UTF-8"  ?>','<?xml version="1.0" encoding="UTF-8"  ?><?xml-stylesheet type="text/xsl" href="/static/transaction.xslt" ?>',$xml);
  header('Content-type: text/xml');
  echo $xml;
} else {
  header('Content-type: text/html');
  echo '
    <html>
      <body>
        <form action="queryTrans.php" method="get">
          <p>
            <label for="transactionref">Enter Confirmation code</label>
            <input type="text" id="transactionref" name="transactionref">
            <input type="submit" value="Send">
          </p>
        </form>
      </body>
    </html>';
}
?>
