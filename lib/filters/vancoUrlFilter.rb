class VancoURLFilter < Nanoc::Filter
  identifier :vanco_url

  def run(content, params = {})
    #url = `php -f ./static/scripts/vanco/getNVP_URL.php`
    branch = `basename $PWD`
    data = `cat ~/conf.inc.#{branch}`
    #GREP data for what we need...
    url = /.*/.match(data)
    url = "\'" + url + "\'"
    content.gsub('VANCO_WSNVP', url)
  end
end
