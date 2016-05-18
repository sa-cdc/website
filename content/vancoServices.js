var transaction = {}; //Create the global to store all data

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
               !transaction['customeraddress1'] ||
               !transaction['customercity']  ||
               !transaction['customerstate'] ||
               !transaction['customerzip'];

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

function storeRef(ref) {
  return $.ajax({
    type: 'GET',
    url: '/static/scripts/vanco/storeRef.php',
    crossDomain: false,
    data: {"ref":ref},
    dataType: 'jsonp'
  });
}

function notifyAdmin(data) {
  return $.ajax({
    type: 'GET',
    url: '/static/scripts/vanco/email.php',
    crossDomain: false,
    data: data,
    dataType: 'jsonp'
  });
}

function signNVP(insecureData) {
  return $.ajax({
    type: 'GET',
    url: '/static/scripts/vanco/nvpEncrypt.php',
    data: insecureData,
    dataType: 'jsonp'
  });
}

function sendWSNVP(secureData, timeout) {
  timeout = typeof timeout !== 'undefined' ? timeout : 0;
  return $.ajax({
    type: 'GET',
    url: 'VANCO_WSNVP',
    crossDomain: true,
    timeout: timeout,
    data: secureData,
    dataType: 'jsonp'
  });
}

function testWSNVP() {
  var fakeData = {'requesttype': 'efttransparentredirect', 'isdebitcardonly': 'No', 'amount': '0'};
  var signingFakeData = signNVP(fakeData); //Expected to always succeed - its on my server
  var sendingTestData = signingFakeData.then(function(data){
      return sendWSNVP(data, 4000);
  });
  return sendingTestData;
}

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
  var signingPaymentData = signNVP(paymentData);
  
  var sendingTransaction = signingPaymentData.then(function(data) {
    //TODO:  put data into transaction...
    /*
  jQuery.each(data, function() {
    transaction[this.name] = this.value || '';
  });
    */
    //Credit Card Specific Info
    transaction['name_on_card'] = transaction['first'] +' '+transaction['last'];
    if(transaction['accounttype'] == "CC") {
      transaction['sameccbillingaddrascust'] = 'Yes';
    }
    //Customer Parameters
    transaction['customername'] = transaction['last']+', '+transaction['first'];
    var id = transaction['fundid'];
    
    if(id != 'none') {
      transaction['fundid_'+id] = id;
      transaction['fundamount_'+id] = transaction['amount'];
    }
    //Transaction Parameters
    transaction['startdate'] = '0000-00-00';
    transaction['transactiontypecode'] = 'WEB';

    return sendWSNVP(transaction);
  });
  
  sendingTransaction.then(function(result) {
    // This is where we trigger the writing of the receipt!
    $("#transaction-loading").css('block','none');
    $("#status-bar").addClass("hidden");
    //console.log('confirm: '+JSON.stringify(result));
    if(result['transactionref']) {
      var id = transaction['fundid'];
      funds = {
        "0001" : "General Operations",
        "0002" : "Direct Patient Care",
        "0003" : "Endowment Fund"
      };
      if(id == '0001' || id == '0002' || id == '0003') {
        $('#confirm').append('<p>Amount: $'+transaction['fundamount_'+id]+'</p>');
      } else {
        $('#confirm').append('<p>Amount: $'+transaction['amount']+'</p>');
      }
      fund_spt = funds[id]+' at'
      $('#confirm').append('<p>'+transaction['name_on_card']+', thanks for supporting '+fund_spt+' the San Antonio Christian Dental Clinic.</p>');

      $('.amount').text(transaction['amount']);
      toggleConfirm();
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
    
  sendingTransaction.then(function(result){
    var storingRef = storeRef(result['transactionref']);
    storingRef.then(function(){
      var adminData = {};
      adminData['ref'] = result['transactionref'];
      adminData['message'] = transaction['name_on_card']+' has donated to the clinic. Amount: '+transaction['amount']+''+transaction['accounttype']+'Confirmation Number: '+result['transactionref']+'Address: '+transaction['address']+'Phone: '+transaction['phone']+'Email: '+transaction['email'];
      notifyAdmin(adminData);
    });
  });
  };//End submitPayment()

$().ready(function() {
  $('.vanco_nvp').attr('action', 'VANCO_WSNVP');
  $('.vanco_xml').attr('action', 'VANCO_XML');
  if('DEV_MODE'=="yes") {
    $("#dev-warning").removeClass('hidden');
  }

  //AJAX request to test Vanco connection
  //$("element[id$='txtTitle']")
    $("div[id$='_init']").css("display", "block");
    
  var checkingVanco = testWSNVP();
  checkingVanco.always(function(){
    $("#loading_init").addClass("hidden");
  });
  checkingVanco.then(
    function(){
      $('#donationApp').removeClass("hidden");
    },
    function() {
      $('#failedToLoad').removeClass("hidden");
    }
  );

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
      var cp_value= ucwords($(this).val(),true);
      $(this).val(cp_value);
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

/**
 * Testing Notes:
 * Testing: https://stripe.com/docs/testing
 * http://www.paypalobjects.com/en_US/vhelp/paypalmanager_help/credit_card_numbers.htm
 * http://www.getcreditcardnumbers.com/
 * http://www.darkcoding.net/credit-card-numbers/
 * 
 * EXAMPLES ...
 *
 * confirm: //Credit
 * {"requestid":"3962297830100","&ccavsresp":"Y","paymentmethodref":"15750739","cccvvresp":"M","ccauthcode":"60439C","startdate":"2014-10-16","clientid":"ES15816","customerid":"14940186","last4":"1111","cardtype":"debit","visamctype":"visa","transactionref":"16117740","customerref":"14940186","isdebitcardonly":"No"}
 *
 * confirm: //Checking
 * {"requestid":"1646117130100","&startdate":"2014-10-21","paymentmethodref":"15750740","clientid":"ES15816","customerid":"14940187","last4":"1111","cardtype":"","visamctype":"","transactionref":"16117741","customerref":"14940187","isdebitcardonly":"No"}
 *
 * confirm: //Saving
 * {"requestid":"3043488850100","&startdate":"2014-10-21","paymentmethodref":"15750741","clientid":"ES15816","customerid":"14940188","last4":"1111","cardtype":"","visamctype":"","transactionref":"16117742","customerref":"14940188","isdebitcardonly":"No"}
 * 
 * 
 * 
 *   
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
 **/
 
