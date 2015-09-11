class Thumbnailize < Nanoc::Filter

  identifier :thumbnailize
  type       :binary

  # Only runs if you have imagemagick installed!
  def run(filename, params={})
    if(which('convert').nil?)
      #TODO: figure out how to load a default image from the static source
      #cmd = "cp #{params[:default]} #{output_filename}"
      cmd = "ls >> #{output_filename}"
      p "Could not do anything because 'convert' -- part of imageMagick not found. Printing output of ls to file instead."
    else
      cmd = "convert -flatten -thumbnail #{params[:width].to_s} #{filename}[0] png:/tmp/#{output_filename}"
    end
    out = `#{cmd}`
  end

  # Cross-platform way of finding an executable in the $PATH.
  #
  #   which('ruby') #=> /usr/bin/ruby
  def which(cmd)
    exts = ENV['PATHEXT'] ? ENV['PATHEXT'].split(';') : ['']
    ENV['PATH'].split(File::PATH_SEPARATOR).each do |path|
      exts.each { |ext|
        exe = File.join(path, "#{cmd}#{ext}")
        return exe if File.executable? exe
      }
    end
    return nil
  end

end
