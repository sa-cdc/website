class VancoURLFilter < Nanoc::Filter
  identifier :vanco_url

  def run(content, params = {})
    #url = `php -f ./static/scripts/vanco/getNVP_URL.php`
    url = `echo $PWD`
    content.gsub('VANCO_WSNVP', url)
  end
end
