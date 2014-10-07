var transaction = {}; //Create the global to store all data

function getQueryParams(qs) {
  qs = qs.split("+").join(" ");
  var params = {},
      tokens,
      re = /[?&]?([^=]+)=([^&]*)/g;

  while (tokens = re.exec(qs)) {
    params[decodeURIComponent(tokens[1])]
      = decodeURIComponent(tokens[2]);
  }

  return params;
}

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
  if(transaction['amount']) {
    toggleDisplay( $('#transaction-who-block') );
    toggleBreadCrumb( $('#tx-two'));
  } else {
    alert('Must select a non-zero amount!');
  }
}

function togglePayment() {

  invalidAmount = !transaction['amount'] || transaction['amount'] <= 0;
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
    toggleDisplay( $('#transaction-payment-block') );
    toggleBreadCrumb( $('#tx-three'));
  }
}

function toggleConfirm() {

  $('#tx-one').unbind('click');
  $('#tx-two').unbind('click');
  $('#tx-three').unbind('click');

  toggleDisplay( $('#transaction-confirm-block') );
  toggleBreadCrumb( $('#tx-four'));

  $('.donate').css('display', 'none');
}

function toggleError() {
  $('#tx-one').unbind('click');
  $('#tx-two').unbind('click');
  $('#tx-three').unbind('click');
  toggleDisplay( $('#transaction-error-block') );
  $('.donate').css('display', 'none');
}

function submitAmount(event, obj) {
    event.preventDefault(); //End the form submission event now!
    var amount = $(obj).attr("value");
    if(amount == "custom") {
      amount = document.getElementById('enteredAmount').value;
    }
    $('.amount').text(amount);

    var fund = $("input:radio[name=dist]:checked").val();
    transaction['amount'] = amount;
    if(fund != '3') {
      transaction['fundid'] = fund;
    }

    toggleWho();
}

$().ready(function() {
  jQuery.validator.setDefaults({
    highlight: function (element) {
      var glyph_e = "#"+$(element).attr("id")+"_glyph";
      $(element).closest('.form-group').removeClass('has-success').addClass('has-error');
      $(glyph_e).removeClass('glyphicon-ok').addClass('glyphicon-remove');
    },
    unhighlight: function (element) {
      var glyph_e = "#"+$(element).attr("id")+"_glyph";
      $(element).closest('.form-group').removeClass('has-error').addClass('has-success');
      $(glyph_e).removeClass('glyphicon-remove').addClass('glyphicon-ok');
    },
    success: function (element) {
      var glyph_e = "#"+$(element).attr("id")+"_glyph";
      $(element).closest('.form-group').removeClass('has-error').addClass('has-success');
      $(glyph_e).removeClass('glyphicon-remove').addClass('glyphicon-ok');
    }
  });
  $("#who-form").validate();
  $("#CC-form").validate();
});

function submitWho(event) {
    event.preventDefault(); //End the form submission event now!

    var form = $("#who-form");
    if(form.valid()) {
      var who = form.serializeArray();
      $.each(who, function() {
        transaction[this.name] = this.value || '';
      });
      togglePayment();
    }
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
  var p = $.param(a);
  console.log(p);
  /* What I have to do */
  window.location.replace('https://www.vancodev.com/cgi-bin/wsnvptest.vps?'.p);

  /*
   * What I would like to do...
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
  */
}

function submitPayment(event) {
  event.preventDefault(); //End the form submission event now!
  
  var form = $("#CC-form");
  if(!form.valid()) {
    return;
  }

  var acct = $( "#CC-form" ).serializeArray();
  jQuery.each(acct, function() {
    transaction[this.name] = this.value || '';
  });

  //Data to encrypt locally
  var paymentData = {};
  paymentData['requesttype'] = 'eftaddonetimecompletetransaction';
  paymentData['urltoredirect'] = 'http://sa-cdc.org/scripts/vanco/confirm.php';
  paymentData['isdebitcardonly'] = 'isdebitcardonly' in transaction ?'Yes':'No';
  paymentData['amount'] = transaction['amount'];

  console.log('paymentData[]: '+JSON.stringify(paymentData));
  $( '#confirm-data').append('<img src="/static/imgs/ajax-loader.gif" width="42">');

  encrypto(paymentData, function(data) {
    //Data to be handed over to VANCO only
    data['sameccbillingaddrascust'] = 'Yes';
    data['accounttype'] = "CC"; //TODO: add forms of payment
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
      data['fundamount_'+id] = transaction['amount'];
    }
    //Transaction Parameters
    data['startdate'] = '0000-00-00';
    data['transactiontypecode'] = 'WEB';

    /* Store the data to #hiddenForm */
    jQuery.each(data, function(index, value) {
      var input = $("<input>").attr("type", "hidden").attr("name", index).val(value);
      $('#hiddenForm').append($(input));
    });
    $('#hiddenForm').submit();
  });

  toggleConfirm();
}

var $_GET = getQueryParams(document.location.search);
if($_GET['transactionref']) {
  $('.amount').text($_GET['requestid'].substring(10));

  toggleConfirm();
  console.log('confirm: '+JSON.stringify($_GET));
  $('#confirm').append('<p>Post Date: '+$_GET['&startdate']+'</p>');
  $('#confirm').append('<p>Confirmation: '+$_GET['transactionref']+'</p>');
  $('#confirm').append('<p>Card: '+$_GET['visamctype']+' #XXXXXXXXXXX'+$_GET['last4']+'</p>');
}
if($_GET['&errorlist']) {
  toggleError();
  errors = $_GET['&errorlist'].split(',');
  //Assumes errorCodes.json is loaded...
  errors.forEach(function(e) {
    $('#error').append('<li>' + errorCodes[e] + '</li>\n');
  });
}


//TODO: Evaluate what parts of these are still needed...
$( "input[name=accounttype]" ).change(function() {
  type = $( "input:radio[name=accounttype]:checked" ).val();
  if(type == "CC") {
    $( "#transaction-CC-block" ).css("display", "block");
    $( "#transaction-CS-block" ).css("display", "none");
  } else if(type == "C" || type == "S") {
    if(type == "C") {
      $('#typelabel').text("Enter Checking Account Numbers");
    } else {
      $('#typelabel').text("Enter Saving Account Numbers");
    }
    $( "#transaction-CS-block" ).css("display", "block");
    $( "#transaction-CC-block" ).css("display", "none");
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
