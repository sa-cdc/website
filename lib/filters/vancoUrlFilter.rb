class VancoURLFilter < Nanoc::Filter
  identifier :vanco_url

  def run(content, params = {})
    #url = `php -f ./static/scripts/vanco/getNVP_URL.php`
    branch = `basename $PWD`
    url = `echo ~/conf.inc.#{branch} | grep 'VANCO_WSNVP`
    url = "\'" + url + "\'"
    content.gsub('VANCO_WSNVP', url)
  end
end
