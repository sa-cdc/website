class VancoURLFilter < Nanoc::Filter
  identifier :vanco_url

  def run(content, params = {})
    #url = `php -f ./static/scripts/vanco/getNVP_URL.php`
    branch = `basename $PWD`
    data = `cat ~/conf.inc.#{branch}`
    #GREP data for what we need...
    m = /^.*VANCO_WSNVP\',\s*\'(.*)\'$/.match(data)
    url = "\'" + m[1] + "\'"
    content.gsub('VANCO_WSNVP', url)
  end
end
