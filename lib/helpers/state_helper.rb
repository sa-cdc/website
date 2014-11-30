module StateHelper
  def state_helper
    out = String.new
    File.open('static/states.txt').each do |line|
      data = line.strip.split('|')
      out<<"<option value=\""<<data.at(1)<<"\">"<<data.at(0)<<"</option>"
    end
    out
  end
end
