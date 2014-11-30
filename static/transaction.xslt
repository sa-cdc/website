<?xml version="1.0"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
  <xsl:output method="html" omit-xml-declaration="yes"/>
  <xsl:template match="/VancoWS">
    <html>
      <body>
        <xsl:choose>
          <xsl:when test="boolean(number(Response/TransactionCount))">
            <table border="1">
              <tr>
                <th>DepositDate</th>
                <th>ProcessDate</th>
                <th>SettlementDate</th>
                <th>AccountType</th>
                <xsl:if test="Response/Transactions/Transaction/AccountType='CC'">
                  <th>CCAuthDesc</th>
                  <th>CCStatus</th>
                  <th>TransactionFee</th>
                  <th>FundTransactionFee</th>
                </xsl:if>
                <th>CustomerRef</th>
                <th>TransactionRef</th>
                <th>Amount(Total)</th>
                <th>Funds</th>
                <th>ReturnCode</th>
              </tr>
              <xsl:for-each select="Response/Transactions/Transaction">
                <tr>
                  <td><xsl:value-of select="DepositDate"></xsl:value-of></td>
                  <td><xsl:value-of select="ProcessDate"></xsl:value-of></td>
                  <td><xsl:value-of select="SettlementDate"></xsl:value-of></td>
                  <td><xsl:value-of select="AccountType"></xsl:value-of></td>
                  <xsl:if test="AccountType='CC'">
                    <td><xsl:value-of select="CCAuthDesc"></xsl:value-of></td>
                    <td><xsl:value-of select="CCStatus"></xsl:value-of></td>
                    <td><xsl:value-of select="TransactionFee"></xsl:value-of></td>
                    <td><xsl:value-of select="FundTransactionFee"></xsl:value-of></td>
                  </xsl:if>
                  <td><xsl:value-of select="CustomerRef"></xsl:value-of></td>
                  <td><xsl:value-of select="TransactionRef"></xsl:value-of></td>
                  <td><xsl:value-of select="Amount"></xsl:value-of></td>
                  <td>
                    <xsl:for-each select="Funds/Fund">
                      <xsl:value-of select="FundAmount"></xsl:value-of>,
                      <xsl:value-of select="FundName"></xsl:value-of>,
                      <xsl:value-of select="FundID"></xsl:value-of>;
                    </xsl:for-each>
                  </td>
                  <td><xsl:value-of select="ReturnCode"></xsl:value-of></td>
                </tr>
              </xsl:for-each>
            </table>
          </xsl:when>
          <xsl:otherwise>
            <b> Could not find your transaction, please wait XX hours, and try again. </b>
          </xsl:otherwise>
        </xsl:choose>
        <div>
          <a href='/scripts/vanco/queryTrans.php'>Return to Confirmation checker</a>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
