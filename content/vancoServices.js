//Testing: https://stripe.com/docs/testing
//http://www.paypalobjects.com/en_US/vhelp/paypalmanager_help/credit_card_numbers.htm
//http://www.getcreditcardnumbers.com/
//http://www.darkcoding.net/credit-card-numbers/
var transaction = {}; //Create the global to store all data
var P = {Dentures: 50, Pulling: 100, "Root Canal": 500, GoldTooth: 20, Cavity: 30, Nicegrill: 1000, Cleaning: 5};

function ucwords(str,force){
  str=force ? str.toLowerCase() : str;
  return str.replace(/(^([a-zA-Z\p{M}]))|([ -][a-zA-Z\p{M}])/g,
      function(firstLetter){
        return firstLetter.toUpperCase();
      });
}

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
  $('html, body').animate({ scrollTop: 0 }, 'fast');
}

function toggleWho() {
  if(transaction['amount']) {
    toggleDisplay( $('#transaction-who-block') );
    toggleBreadCrumb( $('#tx-two'));
  } else {
    alert('Please choose an amount to donate.');
  }
  $('html, body').animate({ scrollTop: 0 }, 'fast');
}

function togglePayment() {

  invalidAmount = !transaction['amount'] || transaction['amount'] <= 0;
  invalidWho = !transaction['last']  ||
               !transaction['first'] ||
               !transaction['addr1'] ||
               !transaction['city']  ||
               !transaction['state'] ||
               !transaction['zip'];

  if(invalidAmount && invalidWho) {
    alert('Please choose an amount to donate and input your billing address.');
  } else if(invalidWho) {
    alert('Please input billing address.');
  } else if(invalidAmount) {
    alert('Please choose an amount to donate.');
  }

  if(!invalidWho && !invalidAmount) {
    toggleDisplay( $('#transaction-payment-block') );
    $('#paymentCC').prop('checked', false);
    $('#paymentC').prop('checked', false);
    $('#paymentS').prop('checked', false);
    toggleBreadCrumb( $('#tx-three'));
  }
  $('html, body').animate({ scrollTop: 0 }, 'fast');
}

function toggleConfirm() {

  $('#tx-one').unbind('click');
  $('#tx-two').unbind('click');
  $('#tx-three').unbind('click');

  $('#tx-one').removeClass('click');
  $('#tx-two').removeClass('click');
  $('#tx-three').removeClass('click');

  toggleDisplay( $('#transaction-confirm-block') );
  toggleBreadCrumb( $('#tx-four'));

  $('html, body').animate({ scrollTop: 0 }, 'fast');
}

function toggleError() {
  $('#tx-one').unbind('click');
  $('#tx-two').unbind('click');
  $('#tx-three').unbind('click');
  toggleDisplay( $('#transaction-error-block') );

  $('#tx-one').removeClass('click');
  $('#tx-two').removeClass('click');
  $('#tx-three').removeClass('click');
}

function submitAmount(event, obj) {
    event.preventDefault(); //End the form submission event now!
    var amount = $(obj).attr("value");
    if(amount == "custom") {
      amount = document.getElementById('enteredAmount').value;
    }
    $('.amount').text(amount);

    var fund = $("input:radio[name=fundid]:checked").val();
    transaction['amount'] = amount;
    if(fund != 'none') {
      transaction['fundid'] = fund;
    }

    toggleWho();
}

function notifyAdmin() {
  $.ajax({
    type: 'GET',
    url: '/static/scripts/vanco/email.php',
    crossDomain: false,
    data: a,
    dataType: 'jsonp',
    success: function(data){ b(data); },
    error: function (jqXHR, textStatus, errorThrown, data) {
      //TODO do something useful
      alert('Local: '+errorThrown);
    }
  });
}



$().ready(function() {
  $('.vanco_nvp').attr('action', 'VANCO_WSNVP');
  $('.vanco_xml').attr('action', 'VANCO_XML');
  if('DEV_MODE'=="yes") {
    $("#dev-warning").removeClass('hidden');
  }

  //AJAX request to test Vanco connection
  //$("element[id$='txtTitle']")
    $("div[id$='_init']").css("display", "block");
    
    encrypto = function getNVP(a, b) {
  return $.ajax({
    type: 'GET',
    url: '/static/scripts/vanco/nvpEncrypt.php',
    crossDomain: false,
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
  $.ajax({
    type: 'GET',
    url: 'VANCO_WSNVP',
    crossDomain: true,
    data: a,
    dataType: 'jsonp',
    success: function(data){ b(data); },
    error: function (jqXHR, textStatus, errorThrown, data) {
      alert('Vanco: '+errorThrown);
    }
  });
}
    
    var fakeData = {'requesttype': 'efttransparentredirect',
                    'isdebitcardonly': 'No',
                    'amount': '0'};

var checkingVancoService = encrypto(fakeData, function(data) {
  $.ajax({ type: 'GET', url: 'VANCO_WSNVP', timeout: 4000, crossDomain: true, data: data, dataType: 'jsonp'});
});

alert(checkingVancoService.status());
checkingVancoService.then(function(){
        $('#donationApp').removeClass("hidden");
      },
      function () {
        $('#failedToLoad').removeClass("hidden");
      },
      function() {
        $("#loading_init").addClass("hidden");
      }
);

    /*encrypto(fakeData, function(data) {
      $.ajax({
        type: 'GET',
        url: 'VANCO_WSNVP',
        timeout: 4000,
        crossDomain: true,
        data: data,
        dataType: 'jsonp',
        success: function(data){
          $('#donationApp').removeClass("hidden");
          $("#loading_init").addClass("hidden");
        },
        error: function (jqXHR, textStatus, errorThrown, data) {
          $("#loading_init").addClass("hidden");
          $('#failedToLoad').removeClass("hidden");
        }
      });
    });*/



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
    },
    errorContainer: "#errors",
    errorLabelContainer: "#errors"
  });

  $("input").not("#billing-email").focusout(function() {
        var cp_value= ucwords($(this).val(),true) ;
            $(this).val(cp_value );
  });

  $("#amount-form").validate();
  $("#who-form").validate();
  $("#CC-form").validate();
  $("#C-form").validate();
  $("#S-form").validate();

   //Amount Form
   $("#enteredAmount").rules("add", {
     minlength: 1,
     maxlength: 5
   });
   //Billing Information (Who Block)
   $("#billing-first").rules("add", {
     required: true,
     minlength: 1
   });
   $("#billing-last").rules("add", {
     required: true,
     minlength: 1
   });
   $("#billing-city").rules("add", {
     required: true,
     minlength: 1
   });
   $("#billing-email").rules("add", {
     required: true,
     email: true
   });
   $("#billing-phone").rules("add", {
     phoneUS: true
   });
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

$('#tx-one').click(function() { toggleAmount(); });
$('#tx-two').click(function() { toggleWho(); });
$('#tx-three').click(function() { togglePayment(); });
$('#tx-four').click(function() { /*toggleConfirm();*/ });

$('#amount-form :submit').click(function(event) {submitAmount(event, this); });
$('#who-form').submit(          function(event) {submitWho(event);          });
$('#CC-form').submit(           function(event) {submitPayment(event, this);});
$('#C-form').submit(            function(event) {submitPayment(event, this);});
$('#S-form').submit(            function(event) {submitPayment(event, this);});

$( "input[name=accounttype]" ).change(function() {
  type = $( "input:radio[name=accounttype]:checked" ).val();
  if(type == "T") {
    $( "#transaction-CC-block" ).css("display", "block");
    $( "#transaction-C-block" ).css("display", "none");
    $( "#transaction-S-block" ).css("display", "none");
  } else if(type == "C") {
      $('#accounttype').val('C');
      $( "#transaction-C-block" ).css("display", "block");
      $( "#transaction-S-block" ).css("display", "none");
      $( "#transaction-CC-block" ).css("display", "none");
  } else if(type == "S") {
      $('#accounttype').val('S');
      $( "#transaction-C-block" ).css("display", "none");
      $( "#transaction-S-block" ).css("display", "block");
      $( "#transaction-CC-block" ).css("display", "none");
  }
});

function submitPayment(event, me) {
  event.preventDefault(); //End the form submission event now!

  var form = $( me );
  if(!form.valid()) {
    return;
  }

  var acct = $( me ).serializeArray();
  jQuery.each(acct, function() {
    transaction[this.name] = this.value || '';
  });
  //console.log('transaction[]: '+JSON.stringify(transaction));

  //Data to encrypt locally
  var paymentData = {};
  paymentData['requesttype'] = 'eftaddonetimecompletetransaction';
  paymentData['urltoredirect'] = '/static/scripts/vanco/confirm.php';
  /*
   * 26 March 2015:  Seems that Vanco is not setup to handle debit cards;
   * removing debit option for users;
  if( 'isdebitcardonly' in transaction && transaction['isdebitcardonly'].toLowerCase() == 'debit'.toLowerCase() ) {
    paymentData['isdebitcardonly'] = 'Yes';
  } else {
    paymentData['isdebitcardonly'] = 'No';
  }
  */
  paymentData['isdebitcardonly'] = 'No';

  //console.log('paymentData[]: '+JSON.stringify(paymentData));
  //$( "#transaction-loading").css('display', 'block');
  toggleDisplay($('#transaction-loading'));

  //Adds nvp to the 'data' sent to the anonymous function
  encrypto(paymentData, function(data) {
    //Data to be handed over to VANCO only
    data['accountnumber'] = transaction['accountnumber'];
    data['accounttype'] = transaction['accounttype'];
    //Credit Card Specific Info
    if(data['accounttype'] == "CC") {
      data['sameccbillingaddrascust'] = 'Yes';
      data['name_on_card'] = transaction['first'] +' '+transaction['last'];
      data['expyear'] = transaction['expyear'];
      data['expmonth'] = transaction['expmonth'];
      data['cvvcode'] = transaction['cvvcode'];
    } else { //Checking or Saving type
      data['routingnumber'] = transaction['routingnumber'];
    }
    //Customer Parameters
    data['customername'] = transaction['last']+', '+transaction['first'];
    data['customeraddress1'] = transaction['addr1'];
    //data['customeraddress2'] = transaction['addr2'];
    data['customercity'] = transaction['city'];
    data['customerstate'] = transaction['state'];
    data['customerzip'] = transaction['zip'];
    data['customerphone'] = transaction['phone'];
    var id = transaction['fundid'];
    //console.log(id);
    if(id != 'none') {
      data['fundid_'+id] = id;
      data['fundamount_'+id] = transaction['amount'];
    } else {
      data['amount'] = transaction['amount'];
    }
    //Transaction Parameters
    data['startdate'] = '0000-00-00';
    data['transactiontypecode'] = 'WEB';

    wsNVP(data, function(result) {
      /*
      {
        "ccavsresp":"Y",
        "paymentmethodref":15751344,
        "cccvvresp":"M",
        "startdate":"2014-11-22",
        "clientid":"ES15816",
        "isdebitcardonly":"No",
        "ccauthcode":"60439C",
        "cardtype":"debit",
        "requestid":"7056993710100",
        "transactionref":16121072,
        "last4":"1111",
        "visamctype":"visa",
        "customerref":14940770,
        "customerid":"14940770"
      }
      */
      // This is where we trigger the writing of the receipt!
      $("#transaction-loading").css('block','none');
      $("#status-bar").addClass("hidden");
      //console.log('confirm: '+JSON.stringify(result));
      if(result['transactionref']) {
        var id = transaction['fundid'];
        funds = {
          "0001" : "General Operations",
          "0002" : "Direct Patient Care",
          "0003" : "Endowment Fund" };
        if(id == '0001' || id == '0002' || id == '0003') {
          $('#confirm').append('<p>'+transaction['first'] +' '+transaction['last']+', thanks for supporting '+funds[id]+' at the San Antonio Christian Dental Clinic.</p>');
          $('#confirm').append('<p>Amount: $'+data['fundamount_'+id]+'</p>');
        } else {
          $('#confirm').append('<p>'+transaction['first'] +' '+transaction['last']+', thanks for supporting the San Antonio Christian Dental Clinic.</p>');
          $('#confirm').append('<p>Amount: $'+data['amount']+'</p>');
        }

        $('.amount').text(transaction['amount']);

        toggleConfirm();
        var proc = runSubset(P, transaction['amount']);
        for(var i=0; i<proc.length; i++ ) {
          $('#purchased').append('<p><span class="badge">'+proc[i]['label']+' ('+proc[i]['freq']+')</span></p>');
        }
        $('#confirm').append('<p>Donation Date: '+result['startdate']+'</p>');
        $('#confirm').append('<p>Confirmation: '+result['transactionref']+'</p>');
        if(result['cardtype']) {
          $('#confirm').append('<p>Payment Type: '+result['visamctype']+' '+result['cardtype']+'</p>');
        }
        $('#confirm').append('<p>Account Last Four: '+result['last4']+'</p>');
      }

      if(result['errorlist']) {
        toggleError();
        errors = result['errorlist'].split(',');
        //Assumes errorCodes.json is loaded...
        errors.forEach(function(e) {
          $('#error').append('<li>' + errorCodes[e] + '</li>\n');
        });
      }
    });
  });

}

/* EXAMPLES ...
 *
 * confirm: //Credit
 * {"requestid":"3962297830100","&ccavsresp":"Y","paymentmethodref":"15750739","cccvvresp":"M","ccauthcode":"60439C","startdate":"2014-10-16","clientid":"ES15816","customerid":"14940186","last4":"1111","cardtype":"debit","visamctype":"visa","transactionref":"16117740","customerref":"14940186","isdebitcardonly":"No"}
 *
 * confirm: //Checking
 * {"requestid":"1646117130100","&startdate":"2014-10-21","paymentmethodref":"15750740","clientid":"ES15816","customerid":"14940187","last4":"1111","cardtype":"","visamctype":"","transactionref":"16117741","customerref":"14940187","isdebitcardonly":"No"}
 *
 * confirm: //Saving
 * {"requestid":"3043488850100","&startdate":"2014-10-21","paymentmethodref":"15750741","clientid":"ES15816","customerid":"14940188","last4":"1111","cardtype":"","visamctype":"","transactionref":"16117742","customerref":"14940188","isdebitcardonly":"No"}
*/


