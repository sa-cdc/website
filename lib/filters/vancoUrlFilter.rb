class VancoURLFilter < Nanoc::Filter
  identifier :vanco_url

  def run(content, params = {})
    #url = `php -f static/scripts/getNCP_URL`
    content.gsub('VANCO_URL', 'url')
  end
end
