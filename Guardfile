# A sample Guardfile
# More info at https://github.com/guard/guard#readme

guard 'nanoc' do
  #watch('nanoc.yaml') # Change this to config.yaml if you use the old config file name
  watch('Rules')
  watch(%r{^(content|layouts|lib|static)/.*$})
  # Ignore Vim swap files
  ignore /^(?:.*[\\\/])?\.[^\\\/]+\.sw[p-z]$/
end

guard 'livereload', host: 'localhost', port: '35729' do
  watch(%r{content/.+\.(css|js|html|png|jpg)})
end
