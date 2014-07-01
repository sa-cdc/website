var transaction = {}; //Create the global to store all data

$('#amount-form :submit').click(function(event) {
  event.preventDefault(); //End the form submission event now!
  var amount = $(this).attr("value");
  if(amount == "custom") {
    amount = $('.enteredAmount').text();
  }
  transaction["amount"] = amount;
  $('.amount').text(transaction['amount']);
  $( "#transaction-amount-block" ).css("display", "none");
  $( "#transaction-who-block" ).css("display", "block");
 
  $( '#tx-one').css({"color": "grey"});
  $( '#tx-two').css({"font-size": "2em"});
});

$('#who-form').submit(function(event) {
  event.preventDefault(); //End the form submission event now!
  var who = $("#who-form").serializeArray();
  $.each(who, function() {
    transaction[this.name] = this.value || '';
  });
    
  $( "#transaction-who-block" ).css("display", "none");
  $( "#transaction-CC-block" ).css("display", "block");

  $( '#tx-two').css({"color": "grey"});
  $( '#tx-three').css({"font-size": "2em"});
});

encrypto = function getNVP(a, b) {
  $.ajax({
    type: 'GET',
    url: 'http://sa-cdc.org/scripts/vanco/nvpEncrypt.php',
    crossDomain: true,
    data: a,
    dataType: 'jsonp',
    success: function(data){ b(data); },
    error: function (jqXHR, textStatus, errorThrown, data) {
      //TODO do something useful
      alert('Local: '+errorThrown);
    }
  });
}

wsNVP = function callWSNVP(a, b) {
  console.log(JSON.stringify(a));
  $.ajax({
    type: 'GET',
    url: 'https://www.vancodev.com/cgi-bin/wsnvptest.vps',
    crossDomain: true,
    data: a,
    dataType: 'jsonp',
    success: function(data){ b(data); },
    error: function (jqXHR, textStatus, errorThrown, data) {
      alert('Vanco: '+errorThrown);
    }
  });
}

$('#CC-form').submit(function(event) {
  event.preventDefault(); //End the form submission event now!

  var acct = $( "#CC-form" ).serializeArray();
  jQuery.each(acct, function() {
    transaction[this.name] = this.value || '';
  });

  //Data to encrypt locally
  var paymentData = {};
  paymentData['requesttype'] = 'eftaddonetimecompletetransaction';
  //paymentData['requesttype'] = 'datetime';
  //paymentData['urltoredirect'] = 'http://google.com';
  //paymentData['isdebitcardonly'] = 'isdebitcardonly' in transaction ?'Yes':'No';

  console.log('paymentData[]: '+JSON.stringify(paymentData));
   
  encrypto(paymentData, function(data) {

    //Data to be handed over to VANCO only
    //data['sameccbillingaddrascust'] = 'Yes';
    //data['accounttype'] = "CC";
    //data['name_on_card'] = transaction['first'] +' '+transaction['last'];
    //data['accountnumber'] = transaction['accountnumber'];
    //data['expyear'] = transaction['expyear'];
    //data['expmonth'] = transaction['expmonth'];
    //data['cvvcode'] = '123'; //TODO...

    //Customer Parameters
    // data['customername'] = transaction['last']+', '+transaction['first'];
    // data['customeraddress1'] = transaction['addr1'];
    //data['customeraddress2'] = transaction['addr2'];
    // data['customercity'] = transaction['city'];
    // data['customerstate'] = transaction['state'];
    // data['customerzip'] = transaction['zip'];
    // data['customerphone'] = '2105555555';

    //Amount Parameters w/ Funds
    //data['fundid_0'] = 'Endowment';
    //data['fundamount_0'] = '';

    //Amount Parameters w/o Funds
    // data['amount'] = transaction['amount'];
    //data['amount'] = '500.00';

    //Transaction Parameters
    // data['startdate'] = '0000-00-00';
    //data['enddate'] = '0000-00-00';
    //data['frequencycode'] = 'O';
    // data['transactiontypecode'] = 'WEB';

    //Flag for local server to submit to VANCO
    // data['tovanco'] = true;

    //Encrypt cData...
    wsNVP(data, function(out) {
      console.log('out[]: '+JSON.stringify(out));
      alert(JSON.stringify(out));
    });
  });

  $( "#transaction-CC-block" ).css("display", "none");
  $( "#transaction-confirm-block" ).css("display", "block");

  $( '#tx-three').css({"color": "grey"});
  $( '#tx-four').css({"font-size": "2em"});
});


//TODO: Evaluate what parts of these are still needed...
$( "input[name=accounttype]" ).change(function() {
  type = $( "input:radio[name=accounttype]:checked" ).val();
  if(type == "CC") {
    $( ".CC" ).css("display", "block");
    $( ".CS" ).css("display", "none");
  } else if(type == "C" || type == "S") {
    $( ".CS" ).css("display", "block");
    $( ".CC" ).css("display", "none");
  }
});

$('#CS-form').submit(function() {
  $.ajax({
    type: "POST",
      url: url,
      data: { "sessionid":sessionid,
              "nvpvar":nvpvar,
              "accounttype":"CC",
              "accountnumber": ccno,
              "expmonth": mm,
              "expyear": yy,
              "email": email,
              "name": custname,
              "billingaddr1": custadd,
              "billingcity": custcity, 
              "billingstate": custstate,
              "billingzip": custzip,
              "name_on_card": custname },
      dataType: 'jsonp',
      async: true,
      traditional: false,
      success: function (data) {
                 alert(JSON.stringify(data));
               },
      error: function (jqXHR, textStatus, errorThrown, data) {
               alert(errorThrown);
             }
  });
});

