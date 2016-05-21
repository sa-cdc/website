angular.module('donation-app', [])
.controller('mainController', function($scope) {
  
  $('.vanco_nvp').attr('action', 'VANCO_WSNVP');
  $('.vanco_xml').attr('action', 'VANCO_XML');
  if('DEV_MODE'=="yes") {
    $("#dev-warning").removeClass('hidden');
  }
  
  $("div[id$='_init']").css("display", "block");
  $('#donationApp').removeClass("hidden");
  $("#loading_init").addClass("hidden");
  
  $scope.vanco = {};
  $scope.client = {};
  $scope.amountFormSubmit = function(isValid) {
    if(isValid) {
      toggleWho();
    }
  };
  $scope.whoFormSubmit = function(isValid) {
    if(isValid) {
      togglePayment($scope.client, $scope.vanco);
    }
  };
  $scope.paymentFormSubmit = function(type, isValid) {
    if(isValid) {
      submitPayment(type, $scope.client, $scope.vanco);
    }
  };
});

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
  toggleDisplay( $('#transaction-who-block') );
  toggleBreadCrumb( $('#tx-two'));
  $('html, body').animate({ scrollTop: 0 }, 'fast');
}

function togglePayment(client, vanco) {
  toggleDisplay( $('#transaction-payment-block') );
  $('#paymentCC').prop('checked', false);
  $('#paymentC').prop('checked', false);
  $('#paymentS').prop('checked', false);
  toggleBreadCrumb( $('#tx-three'));
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

//$('#tx-one').click(function() { toggleAmount(); });
//$('#tx-two').click(function() { toggleWho(); });
//$('#tx-three').click(function() { togglePayment(); });
//$('#tx-four').click(function() { /*toggleConfirm();*/ });

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

function submitPayment(type, client, vanco) {
  //UI Stuff
  toggleDisplay($('#transaction-loading'));
  
  
  nvpVars = {};//Data to encrypt on my server
  nvpVars.requesttype = 'eftaddonetimecompletetransaction';
  nvpVars.urltoredirect = '/static/scripts/vanco/confirm.php';
  nvpVars.isdebitcardonly = 'No';
  
  var signingPaymentData = signNVP(nvpVars);
  
  var sendingTransaction = signingPaymentData.then(function(my_nvp_data) {

    //Only two variables needed from data[]
    vanco.sessionid = my_nvp_data['sessionid'];
    vanco.nvpvar = my_nvp_data['nvpvar'];

    //Credit Card Specific Info
    if(type == "CC") {
      vanco.name_on_card = client.first +' '+client.last;
      vanco.sameccbillingaddrascust = 'Yes';
    }
    //Customer Parameters
    vanco.customername = client.last+', '+client.first;
    
    if(client.fundid != 'none') {
      vanco['fundid_'+client.fundid] = client.fundid;
      vanco['fundamount_'+client.fundid] = vanco.amount;
    }
    //Transaction Parameters
    vanco.startdate = '0000-00-00';
    vanco.transactiontypecode = 'WEB';
alert(JSON.stringify(vanco));
return;
    return sendWSNVP(vanco);
  });
  
  sendingTransaction.then(function(vanco_result) {
    // This is where we trigger the writing of the receipt!
    $("#transaction-loading").css('block','none');
    $("#status-bar").addClass("hidden");
    //console.log('confirm: '+JSON.stringify(vanco_result));
    if(vanco_result['transactionref']) {
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
      $('#confirm').append('<p>Donation Date: '+vanco_result['startdate']+'</p>');
      $('#confirm').append('<p>Confirmation: '+vanco_result['transactionref']+'</p>');
      if(vanco_result['cardtype']) {
        $('#confirm').append('<p>Payment Type: '+vanco_result['visamctype']+' '+vanco_result['cardtype']+'</p>');
      }
      $('#confirm').append('<p>Account Last Four: '+vanco_result['last4']+'</p>');
    }

    if(vanco_result['errorlist']) {
      toggleError();
      errors = vanco_result['errorlist'].split(',');
      //Assumes errorCodes.json is loaded...
      errors.forEach(function(e) {
        $('#error').append('<li>' + errorCodes[e] + '</li>\n');
      });
    }
  });
    
  sendingTransaction.then(function(vanco_result){
    storeRef(vanco_result['transactionref'])
    .then(function(){
      var adminData = {};
      adminData['ref'] = vanco_result['transactionref'];
      adminData['message'] = transaction['name_on_card']+' has donated to the clinic.\r\nAmount: '+transaction['amount']+'\r\n'+transaction['visamctype']+'\r\nConfirmation Number: '+vanco_result['transactionref']+'\r\nAddress: '+transaction['customeraddress1']+'\r\nPhone: '+transaction['customerphone']+'\r\nEmail: '+transaction['customeremail'];
      notifyAdmin(adminData);
    });
  });
  };//End submitPayment()

/*$().ready(function() {
  $('.vanco_nvp').attr('action', 'VANCO_WSNVP');
  $('.vanco_xml').attr('action', 'VANCO_XML');
  if('DEV_MODE'=="yes") {
    $("#dev-warning").removeClass('hidden');
  }
  */

  //AJAX request to test Vanco connection
  //$("element[id$='txtTitle']")
    //$("div[id$='_init']").css("display", "block");
  
  /* - Commented for testing off-net  
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
  - Remove following 2 lines when on net*/
//  $('#donationApp').removeClass("hidden");
//  $("#loading_init").addClass("hidden");
/*
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
   });*/
//});

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
 