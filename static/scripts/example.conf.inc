# Move this file outside of your www directory;  chown sacdcorg; chmod 710;
# rwx--x---

# Place the conf.inc relative to ~/www/SiteName/scripts: ../
# Make sure that .htaccess blocks .inc files:
#  <FilesMatch "\.inc$">
#    Deny from all
#  </FilesMatch>

# TWITTER CREDENTIALS
$twitteruser = "";
$consumerkey = "";
$consumersecret = "";
$accesstoken = "";
$accesstokensecret = "";

#VANCO CREDENTIALS
# Make sure the appropriate URLs are loaded for Vanco (dev vs. live)
define('VANCO_KEY', '');
define('VANCO_USER_ID', '');
define('VANCO_PASSWORD', '');
define('VANCO_CLIENT_ID', '');
define('VANCO_WSNVP', 'https://vancodev.com/cgi-bin/wsnvptest.vps');
define('VANCO_WS', 'https://www.vancodev.com/cgi-bin/wstest2.vps');
