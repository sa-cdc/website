var donationApp = angular.module('donation-app', []);

donationApp.controller('mainController', function($scope, vancoAPI) {
  
  $('.vanco_nvp').attr('action', 'VANCO_WSNVP');
  $('.vanco_xml').attr('action', 'VANCO_XML');
  $scope.devMode = 'DEV_MODE'=="yes";
  
  $scope.loading = true;
  $scope.vancoReachable = false;
  
  $scope.checkingVanco = vancoAPI.testWSNVP();
  $scope.checkingVanco.then(
    function(data){ $scope.vancoReachable = true; console.log('success: '+data);},
    function(error) {
      //TODO Remove ! from false when debug complete
      $scope.vancoReachable = !false;
      console.log('error: '+JSON.stringify(error));
    }
  );
  
  $scope.checkingVanco.finally(function(){
    console.log('finally');
    $scope.loading = false;
  });
  
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
      $('html, body').animate({ scrollTop: 0 }, 'fast');
    }
  };

  $scope.paymentFormSubmit = function(type, isValid) {
    if(isValid) {
      $scope.breadcrumb = 4;
      nvpVars = {};//Data to encrypt on my server
      nvpVars.requesttype = 'eftaddonetimecompletetransaction';
      nvpVars.urltoredirect = '/static/scripts/vanco/confirm.php';
      nvpVars.isdebitcardonly = 'No';
  
      var signingPaymentData = vancoAPI.signNVP(nvpVars);
  
      var sendingTransaction = signingPaymentData.then(function(my_nvp_data) {

        //Only two variables needed from data[]
        $scope.vanco.sessionid = my_nvp_data.data.sessionid;
        $scope.vanco.nvpvar = my_nvp_data.data.nvpvar;
        
        //Credit Card Specific Info
        if($scope.vanco.accounttype == "CC") {
          $scope.vanco.name_on_card = $scope.client.first +' '+$scope.client.last;
          $scope.vanco.sameccbillingaddrascust = 'Yes';
        }
        
        //Customer Parameters
        $scope.vanco.customername = $scope.client.last+', '+$scope.client.first;
    
        if($scope.client.fundid != 'none') {
          $scope.vanco['fundid_'+$scope.client.fundid] = $scope.client.fundid;
          $scope.vanco['fundamount_'+$scope.client.fundid] = $scope.vanco.amount;
        }
        
        //Transaction Parameters
        $scope.vanco.startdate = '0000-00-00';
        $scope.vanco.transactiontypecode = 'WEB';
        return vancoAPI.sendWSNVP($scope.vanco);
      });
  
  sendingTransaction.then(function(vanco_result) {
    // This is where we trigger the writing of the receipt!
    
        //"0001" : "General Operations",
        //"0002" : "Direct Patient Care",
        //"0003" : "Endowment Fund"-->
        $scope.vanco.errorlist = vanco_result.data.errorlist;
        $scope.vanco.startdate = vanco_result.data.startdate;
        $scope.vanco.transactionref = vanco_result.data.transactionref;
        $scope.vanco.visamctype = vanco_result.data.visamctype;
        $scope.vanco.cardtype = vanco_result.data.cardtype;
        $scope.vanco.last4 = vanco_result.data.last4;
  });    
      

    
  sendingTransaction.then(function(vanco_result){
    console.log(vanco_result);
    vancoAPI.storeRef(vanco_result.data.transactionref)
    .then(function(){
      var adminData = {};
      adminData['ref'] = vanco_result.data.transactionref;
      adminData['message'] = $scope.vanco.name_on_card+' has donated to the clinic.\r\nAmount: '+$scope.vanco.amount+'\r\n'+vanco_result.data.visamctype+'\r\nConfirmation Number: '+vanco_result.data.transactionref+'\r\nAddress: '+$scope.vanco.customeraddress1+'\r\nPhone: '+$scope.vanco.customerphone+'\r\nEmail: '+$scope.vanco.customeremail;
      vancoAPI.notifyAdmin(adminData);
    });
  });
    }
  };  
});




donationApp.factory('vancoAPI', function($http, $httpParamSerializer){
  var service = {};
  
  service.storeRef = function(ref) {
    console.log({ref: ref});
    return $http.post('/static/scripts/vanco/storeRef.php', {ref: ref});
   /*return $http({
      type: 'GET',
      url: '/static/scripts/vanco/storeRef.php',
      crossDomain: false,
      data: {'ref':ref},
      dataType: 'jsonp'
    });*/
  }

  service.notifyAdmin = function(data) {
    return $http.post('/static/scripts/vanco/email.php', data);
    /*return $http({
      type: 'GET',
      url: '/static/scripts/vanco/email.php',
      crossDomain: false,
      data: data,
      dataType: 'jsonp'
    });*/
  }

  service.sendWSNVP = function(secureData, timeout) {
    timeout = typeof timeout !== 'undefined' ? timeout : 0;
    var qs = null;
    if(secureData['data'])
      qs = $httpParamSerializer(secureData['data']);
    else
      qs = $httpParamSerializer(secureData);
    qs = '?callback=JSON_CALLBACK&'+qs;
    console.log(qs);
    return $http.jsonp('VANCO_WSNVP'+qs);
  }

  service.signNVP = function(data){
    return $http.post('/static/scripts/vanco/nvpEncrypt.php', data);
  }

service.testWSNVP = function() {
    var fakeData = {'requesttype': 'efttransparentredirect', 'isdebitcardonly': 'No', 'amount': '0'};
    var signingFakeData = service.signNVP(fakeData);
    console.log(fakeData);
    
    return signingFakeData.then(function(data){
      return service.sendWSNVP(data, 4000);
    }); //Otherwise something went really wrong
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
