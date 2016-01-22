class RedirectGenerator
  def self.generate(redirects, items)
    redirect_template = ERB.new(File.read('redirect.html.erb'))

    redirects.each do |pairs|
      pairs.each_pair do |url, aliases|

        if aliased_item = items.find{|item| item.identifier == "/#{url}/" }
          aliases.each do |alias_url|
            redirect = {:url => url, :title => aliased_item[:title]}
            items << Nanoc3::Item.new(redirect_template.result(binding), { :redirect => true }, alias_url)
          end
        end

      end
    end
  end
end
