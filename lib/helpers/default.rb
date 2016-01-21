=begin
Helper to render the sites layout features e.g., navigation tabs
=end

module DefaultHelper
  def sort_pages
    bigA = Array.new
    home_pages = items_with_tag('sa-cdc')
    home_pages.each do |page|
      h = { lnk: link_to(page[:title], page.reps[0]) }
      h.merge!( { item: page } )
      h.merge!( { precedence: page[:precedence].to_i } )
      if @item[:group] == page[:group]
        h.merge!({ cls: "class=\"active\"" })
        h.merge!({ cls_bald: "active" })
      end
      bigA.push(h)
    end
    bigA.sort_by!{|v| v[:precedence]}
    bigA.reverse!
    bigA  # Return the re-ordered list
  end

  def build_tabs(bigA)
    result=String.new
    bigA.each do |page|
      if(!page[:item].children.empty? && page[:item][:title]!= 'Home')
        result << "<li class=\"dropdown #{page[:cls_bald]}\"> <a href=\"#\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">  #{page[:item][:group]} <b class=\"caret\"></b></a> <ul class=\"dropdown-menu\"> <li>  #{link_to(page[:item][:title], page[:item].reps[0])} </li>"
        subpages = page[:item].children - items_with_tag('no-link')
        subpages.each do |sub|
          result << "<li> #{link_to(sub[:title], sub.reps[0])}</li>"
        end
        result << "</ul> </li>"
      else
        result << "<li #{page[:cls]} > #{page[:lnk]} </li>"
      end
    end
    result
  end
end
