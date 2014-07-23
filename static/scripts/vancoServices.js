var transaction = {}; //Create the global to store all data

function parseURLParams(url) {
    var queryStart = url.indexOf("?") + 1,
        queryEnd   = url.indexOf("#") + 1 || url.length + 1,
        query = url.slice(queryStart, queryEnd - 1),
        pairs = query.replace(/\+/g, " ").split("&"),
        parms = {}, i, n, v, nv;

    if (query === url || query === "") {
        return;
    }

    for (i = 0; i < pairs.length; i++) {
        nv = pairs[i].split("=");
        n = decodeURIComponent(nv[0]);
        v = decodeURIComponent(nv[1]);

        if (!parms.hasOwnProperty(n)) {
            parms[n] = [];
        }

        parms[n].push(nv.length === 2 ? v : null);
    }
    return parms;
}

function toggleBreadCrumb(a) {
  $('[id^=tx-]').removeClass('active');
  a.addClass('active');
}

function toggleDisplay(a) {
  $( "[id^=transaction-]" ).css("display", "none");
  a.css("display", "block");
}

function toggleAmount() {
  toggleDisplay( $('#transaction-amount-block') );
  toggleBreadCrumb( $('#tx-one'));
}

function toggleWho() {
  if(transaction['amount'] || transaction['fundamount']) {
    toggleDisplay( $('#transaction-who-block') );
    toggleBreadCrumb( $('#tx-two'));
  } else {
    alert('Must select a non-zero amount!');
  }
}

function togglePayment() {

  invalidAmount = !transaction['amount'] || transaction['amount'] <= 0;
  invalidAmount &= !transaction['fundamount'] || transaction['fundamount'] <= 0;
  invalidWho = !transaction['last']  ||
               !transaction['first'] ||
               !transaction['addr1'] ||
               !transaction['city']  ||
               !transaction['state'] ||
               !transaction['zip'];

  if(invalidAmount) {
    alert('Must select a non-zero amount!');
  }
  if(invalidWho) {
    alert('Must specify complete billing address!');
  }

  if(!invalidWho && !invalidAmount) {
    toggleDisplay( $('#transaction-CC-block') );
    toggleBreadCrumb( $('#tx-three'));
  }
}

function toggleConfirm() {

  $('#tx-one').unbind('click');
  $('#tx-two').unbind('click');
  $('#tx-three').unbind('click');

  toggleDisplay( $('#transaction-confirm-block') );
  toggleBreadCrumb( $('#tx-four'));
}

function submitAmount(event, obj) {
    event.preventDefault(); //End the form submission event now!
    var amount = $(obj).attr("value");
    if(amount == "custom") {
      amount = document.getElementById('enteredAmount').value;
    }
    $('.amount').text(amount);

    var fund = $("input:radio[name=dist]:checked").val();
    if(fund == '3') {
      transaction["amount"] = amount;
    } else {
      transaction['fundid'] = fund;
      transaction['fundamount'] = amount;
    }

    toggleWho();
}

function submitWho(event) {
    event.preventDefault(); //End the form submission event now!
    var who = $("#who-form").serializeArray();
    $.each(who, function() {
      transaction[this.name] = this.value || '';
    });

    togglePayment();
}

$('#tx-one').click(function() {
  toggleAmount();
});
$('#tx-two').click(function() {
  toggleWho();
});
$('#tx-three').click(function() {
  togglePayment();
});
$('#tx-four').click(function() {
  //toggleConfirm();
});

$('#amount-form :submit').click(function(event) {submitAmount(event, this); });
$('#who-form').submit(          function(event) {submitWho(event);    });
$('#CC-form').submit(           function(event) {submitPayment(event);});


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

function submitPayment(event) {
    event.preventDefault(); //End the form submission event now!

    var acct = $( "#CC-form" ).serializeArray();
    jQuery.each(acct, function() {
      transaction[this.name] = this.value || '';
    });

    //Data to encrypt locally
    var paymentData = {};
    paymentData['requesttype'] = 'eftaddonetimecompletetransaction';
    paymentData['urltoredirect'] = 'http://google.com';
    paymentData['isdebitcardonly'] = 'isdebitcardonly' in transaction ?'Yes':'No';

    console.log('paymentData[]: '+JSON.stringify(paymentData));
    $( '#confirm-data').append('<img src="/static/imgs/ajax-loader.gif" width="42">');

    encrypto(paymentData, function(data) {

      //Data to be handed over to VANCO only
      data['sameccbillingaddrascust'] = 'Yes';
      data['accounttype'] = "CC";
      data['name_on_card'] = transaction['first'] +' '+transaction['last'];
      data['accountnumber'] = transaction['accountnumber'];
      data['expyear'] = transaction['expyear'];
      data['expmonth'] = transaction['expmonth'];
      data['cvvcode'] = transaction['cvvcode'];

      //Customer Parameters
      data['customername'] = transaction['last']+', '+transaction['first'];
      data['customeraddress1'] = transaction['addr1'];
      //data['customeraddress2'] = transaction['addr2'];
      data['customercity'] = transaction['city'];
      data['customerstate'] = transaction['state'];
      data['customerzip'] = transaction['zip'];
      data['customerphone'] = transaction['phone'];

      if(transaction['amount']) {
        data['amount'] = transaction['amount'];
      } else {
        var id = transaction['fundid'];
        data['fundid_'+id] = id;
        data['fundamount_'+id] = transaction['fundamount'];
      }

      //Transaction Parameters
      data['startdate'] = '0000-00-00';
      data['transactiontypecode'] = 'WEB';

      //Flag for local server to submit to VANCO
      data['tovanco'] = true;

      console.log('data[]: '+JSON.stringify(data));
      //Encrypt cData...
      //TODO: Send to wsNVP first then decrypt second... (can't let acct go to server)
      encrypto(data, function(out) {
        console.log('out[]: '+JSON.stringify(out));
        console.log(out);
        done = parseURLParams('?'+out+'#');
        $( '#confirm-data').text('Confirmation #'+done['transactionref']+'Details: '+done['visamctype'] +' Card: '+done['last4']);
      });
    });

    toggleConfirm();
}


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

