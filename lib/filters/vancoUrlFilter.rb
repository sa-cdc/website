class VancoURLFilter < Nanoc::Filter
  identifier :vanco_url

  def run(content, params = {})
    #url = `php -f ./static/scripts/vanco/getNVP_URL.php`
    branch = `basename $PWD`
    data = `cat ~/conf.inc.#{branch}`
    #GREP data for what we need...
    nvp_url = /^.*VANCO_WSNVP\',\s*\'(.*)\'.*$/.match(data)
    xml_url = /^.*VANCO_XML\',\s*\'(.*)\'.*$/.match(data)
    dev_mode = /^.*VANCO_DEV_MODE\',\s*\'(.*)\'.*$/.match(data)
    
    content.gsub('VANCO_WSNVP', nvp_url[1])
    content.gsub('VANCO_XML', xml_url[1])
    content.gsub('VANCO_DEV_MODE', dev_mode[1])
  end
end
