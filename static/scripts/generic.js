//TODO: Also allow sachristiandental.org in the target
$(document).ready(function () {
  function addBlankToURL() {
    $('a[href^="http://"]').not('a[href*=sa-cdc]').attr('target','_blank');
  }
});
