var donationApp = angular.module('donation-app', []);

donationApp.controller('mainController', function($scope, vancoAPI) {
  
  $('.vanco_nvp').attr('action', 'VANCO_WSNVP');
  $('.vanco_xml').attr('action', 'VANCO_XML');
  $scope.devMode = 'DEV_MODE'=="yes";
  
  $scope.loading = true;
  $scope.vancoReachable = false;
  
  $scope.checkingVanco = vancoAPI.testWSNVP();
  $scope.checkingVanco.finally(function(){
    $scope.loading = false;
    console.log('always ran: '+$scope.loading);
  });
  $scope.checkingVanco.then(
    function(){
      $scope.vancoReachable = true;
      console.log('reachable');
    },
    function() {
      $scope.vancoReachable = false;
      console.log('UNreachable');
    }
  );
  
  $scope.vanco = {};
  $scope.vanco.amount = 0;
  $scope.client = {};
  $scope.breadcrumb = 1;

  $scope.amountFormSubmit = function(isValid) {
    if(isValid) {
      $scope.breadcrumb = 2;
      $('html, body').animate({ scrollTop: 0 }, 'fast');
    }
  };
  $scope.whoFormSubmit = function(isValid) {
    if(isValid) {
      $scope.breadcrumb = 3;
    }
  };
  
  submitPayment = function(type, client, vanco) {
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
    return sendWSNVP(vanco);
  });
  
  sendingTransaction.then(function(vanco_result) {
    // This is where we trigger the writing of the receipt!
    $("#transaction-loading").css('block','none');
    $("#status-bar").addClass("hidden");
    //console.log('confirm: '+JSON.stringify(vanco_result));
    if(vanco_result['transactionref']) {
      var id = client.fundid;
      funds = {
        "0001" : "General Operations",
        "0002" : "Direct Patient Care",
        "0003" : "Endowment Fund"
      };
      if(id == '0001' || id == '0002' || id == '0003') {
        $('#confirm').append('<p>Amount: $'+vanco['fundamount_'+id]+'</p>');
      } else {
        $('#confirm').append('<p>Amount: $'+vanco['amount']+'</p>');
      }
      fund_spt = funds[id]+' at'
      $('#confirm').append('<p>{{vanco.name_on_card}}, thanks for supporting '+fund_spt+' the San Antonio Christian Dental Clinic.</p>');
      $('#confirm').append('<p>Donation Date: '+vanco_result['startdate']+'</p>');
      $('#confirm').append('<p>Confirmation: '+vanco_result['transactionref']+'</p>');
      if(vanco_result['cardtype']) {
        $('#confirm').append('<p>Payment Type: '+vanco_result['visamctype']+' '+vanco_result['cardtype']+'</p>');
      }
      $('#confirm').append('<p>Account Last Four: '+vanco_result['last4']+'</p>');
    }

    if(vanco_result['errorlist']) {
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
      adminData['message'] = vanco.name_on_card+' has donated to the clinic.\r\nAmount: '+vanco.amount+'\r\n'+vanco_result.visamctype+'\r\nConfirmation Number: '+vanco_result['transactionref']+'\r\nAddress: '+vanco.customeraddress1+'\r\nPhone: '+vanco.customerphone+'\r\nEmail: '+vanco.customeremail;
      notifyAdmin(adminData);
    });
  });
  };//End submitPayment()
  $scope.paymentFormSubmit = function(type, isValid) {
    if(isValid) {
      $scope.breadcrumb = 4;
      submitPayment(type, $scope.client, $scope.vanco);
    }
  };  
});




donationApp.factory('vancoAPI', function($http, $location){
  var service = {};
  
  service.storeRef = function(ref) {
   return $http({
      type: 'GET',
      url: '/static/scripts/vanco/storeRef.php',
      crossDomain: false,
      data: {'ref':ref},
      dataType: 'jsonp'
    });
  }

  service.notifyAdmin = function(data) {
    return $http({
      type: 'GET',
      url: '/static/scripts/vanco/email.php',
      crossDomain: false,
      data: data,
      dataType: 'jsonp'
    });
  }

  service.signNVP = function(insecureData) {
    console.log('INSECURE DATA: '+JSON.stringify(insecureData));
    return $http({
      type: 'GET',
      url: 'http://'+$location.host()+'/static/scripts/vanco/nvpEncrypt.php',
      data: insecureData
    });
  }

  service.sendWSNVP = function(secureData, timeout) {
    timeout = typeof timeout !== 'undefined' ? timeout : 0;
    return $http({
      type: 'GET',
      url: 'VANCO_WSNVP',
      crossDomain: true,
      timeout: timeout,
      data: secureData,
      dataType: 'jsonp'
    });
  }

service.testWSNVP = function() {
    var fakeData = {'requesttype': 'efttransparentredirect', 'isdebitcardonly': 'No', 'amount': '0'};
    
    var signingFakeData = service.signNVP(fakeData); //Expected to always succeed - its on my server
    console.log('parse: '+JSON.parse('{"sessionid":"55e2f5b3c41a0a2b86770c77d7ddfcda18241268","nvpvar":"fUlFUSXmGl2UkjdIDw-VEQv1JJsh5OQdrJs9KAy96L1BgUlsxbyEr5hxOw-aTsnCKuV1gUghY2cDovds-48Pug=="}'));
    var sendingTestData = signingFakeData.then(function(data){
      console.log('test: '+JSON.stringify(data));
      return service.sendWSNVP(data, 4000);
    },
    function(data){
      console.log('FAILED: '+JSON.stringify(data));
      return null;
    });
    return sendingTestData;
  }
  return service;
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
